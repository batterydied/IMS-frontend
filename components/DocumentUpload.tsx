'use client' // <--- REQUIRED for useRef and event handlers

import { useCallback, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { UploadSVG } from './SVG' // Adjust path as needed

// Initialize Supabase (Make sure you have these in your .env.local)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const session_key = "sb-"+ process.env.NEXT_PUBLIC_SUPABASE_REF +"-auth-token"

export default function InvoiceUploader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  // Trigger the hidden file input
  const handleUpload = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  // The Main Logic
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
// --- STEP 0: Read Session and Set Client Context ---
        const sessionString = localStorage.getItem(session_key);
        console.log(session_key)

        if (!sessionString) throw new Error("User session not found in Local Storage.");

        const sessionData = JSON.parse(sessionString);
        // Supabase stores the actual session inside a 'data' key within the stored string
        const { access_token, refresh_token } = sessionData.user;
        
        // This explicitly tells the client who the current user is
        await supabase.auth.setSession({ access_token, refresh_token });

        // --- STEP 1: Get Confirmed UID from the Policy's perspective ---
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;      
        console.log(userId)
      // --- STEP 1: Upload to Supabase Bucket ---
      // Create a unique path: user_id / timestamp_filename
      const filePath = `${userId}/${Date.now()}_${file.name}`
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('invoices') // Your bucket name
        .upload(filePath, file)

      if (uploadError) throw uploadError

      console.log("Supabase Upload Successful:", uploadData.path)

      // --- STEP 2: Notify Python Backend (Send JSON) ---
      const response = await fetch("http://localhost:5000/api/process-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          file_path: uploadData.path // Sending the text path, not the file!
        }),
      })

      const result = await response.json()
      console.log("VLM Processing Result:", result)

    } catch (error) {
      console.error("Error in upload flow:", error)
    } finally {
      setUploading(false)
    }
  }, [])

  return (
    <div>
      {/* Hidden Input remains the same */}
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept="image/*,application/pdf"
      />
      
      {/* 2. Use the SVG component here, attaching handleUpload to its onClick */}
      <button 
        onClick={handleUpload} // Clicks the hidden input
        disabled={uploading}
        className="rounded-md btn bg-accent/80 border-transparent hover:bg-accent group text-x"      >
        {/* 3. Use the imported SVG */}
        <UploadSVG className="w-6 h-6" /> 
        
        <span>{uploading ? "Uploading..." : "Select Invoice"}</span>
      </button>
    </div>
  )
}

