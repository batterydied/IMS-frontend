"use client";
import { memo, useRef, useState } from "react"
import { UploadSVG } from "./SVG"
import { createClient } from "@supabase/supabase-js"
import Image from "next/image"
import { InvoiceItem } from "./ExtractView"
import { v4 as uuid } from "uuid"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const session_key = "sb-"+ process.env.NEXT_PUBLIC_SUPABASE_REF +"-auth-token"

interface InvoiceUploader {
    setInvoiceNumber: (data: string) => void;
    setVendor: (data: string) => void;
    setInvoiceDate: (data: string) => void;
    setInvoiceItems: (data: InvoiceItem[]) => void;
    invoiceImg: string;
    setInvoiceImg: (data: string) => void;
    setTotal: (data: string) => void;
}

interface RawInvoice {
    description: string; 
    quantity: string; 
    unit_price: string; 
    line_total: string;
}

const InvoiceUploader = ({setTotal, invoiceImg, setInvoiceImg, setInvoiceNumber, setVendor, setInvoiceDate, setInvoiceItems}: InvoiceUploader) => {
    const inputRef = useRef<HTMLInputElement>(null)
        const [isUploading, setIsUploading] = useState(false)
        const [isDragging, setIsDragging] = useState(false)
        const [hasServerError, setHasServerError] = useState(false)
    
        const getInvoiceDate = (date: string | null): string => {
            if (!date) {
                const today = new Date()
                return today.toISOString().split("T")[0] // YYYY-MM-DD
            }
            return date
        }


        const handleUpload = ()=>{
            if(inputRef.current){
                inputRef.current.click()
            }
        }
    
        const handleUploadFile = async (file: File) => {
            try {
                setIsUploading(true)
                const previewUrl = URL.createObjectURL(file);
                setInvoiceImg(previewUrl);
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

                    if(result.status === "success"){
                        const data = result.data
                        setInvoiceDate(getInvoiceDate(data.invoice_date))
                        setInvoiceItems([])
                        setInvoiceNumber(data.invoice_number)
                        setVendor(data.vendor_name)
                        setTotal(data.total_amount)

                        setInvoiceItems(data.items.map((item: RawInvoice) => {
                            return {
                                description: item.description,
                                itemId: uuid(),
                                quantity: item.quantity,
                                price: item.unit_price,
                                total: item.line_total
                            }
                        }))
                    }
                    
                    setHasServerError(false)
                } catch (error) {
                    console.error("Error in upload flow:", error)
                    setHasServerError(true)
                } finally {
                    setIsUploading(false)
                }
        }
    
        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
    
            const file = e.dataTransfer.files[0];
            if (file) {
                handleUploadFile(file);
            }
        }
    
        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
        }
    
        const handleDragEnter = () => {
            setIsDragging(true);
        }
    
        const handleDragLeave = () => {
            setIsDragging(false);
        }
    
        const handleFileChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if(file){
                handleUploadFile(file)
            }
        }
        return (
            <div className={`h-full w-full flex flex-col justify-center items-center space-y-2 ${isDragging && "bg-black/5"}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            >
                {isUploading && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] w-full h-full">
                        <div className="text-content text-xl font-semibold animate-pulse">
                            Uploading...
                        </div>
                    </div>
                )}
                <UploadSVG size={64} className="opacity-60"/>
                <div className="flex flex-col">
                    <span className="text-center">Drag and drop file here</span>
                    <span className="text-center">or Upload</span>
                </div>
                <input ref={inputRef} type="file" className="hidden" onChange={handleFileChangeEvent}/>
                <button className="btn rounded-md hover:bg-accent border-0" onClick={handleUpload}>Upload</button>
                {hasServerError && <span className="text-red-500">Unable to connect to server, try again</span>}
                {invoiceImg && <Image src={invoiceImg} alt="Invoice Preview" width={200} height={200} className="p-4"/>}
            </div>
        )
}

export default memo(InvoiceUploader)