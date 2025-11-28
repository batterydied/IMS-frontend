"use client"
import { useSupabase } from "@/contexts/SupabaseProvider"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import Navbar from "@/components/Navbar"
import { MenuSVG } from "@/components/SVG"

export default function App() {
  const router = useRouter()
  const { user, supabase, isLoading } = useSupabase()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLogOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace("/auth/signin")
  }, [router, supabase.auth])

  const handleUpload = useCallback(()=>{
    if(inputRef.current){
      inputRef.current.click()
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if(file){
      console.log("Uploaded file:", file)
    }
  }, [])

  const handleToggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/signin")
    }
  }, [router, user, isLoading])

  if (!user) return (
    <div className="page">
      <span className="loading loading-spinner loading-xl"></span>
    </div>
  )

  return (
    <div className="flex flex-row h-screen bg-primary">
      <div className="w-[50px] h-full bg-content flex justify-center p-2 border-r border-muted items-start">
        <div onClick={handleToggleCollapsed} className="hover:cursor-pointer hover:bg-secondary text-content2 p-1 rounded-sm h-auto">
            <MenuSVG/>
        </div>
      </div>
      <div
        className={`${
          isCollapsed ? "w-0 !p-0" : "w-[250px]"
        } transition-all duration-300 bg-content p-2 overflow-hidden h-full`}
      >
        <div
          className={`w-full transition-opacity duration-300 flex flex-col h-full space-y-2 ${
            isCollapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          <input
            type="text"
            placeholder="Search..."
            className="input w-full focus:outline-none border-0 bg-primary text-content2"
          />
          <div className="text-content2 p-1 min-w-[200px]">
            Dashboard
          </div>
            <div className="text-content2 p-1 min-w-[200px]">
            Calendar
          </div>
            <div className="text-content2 p-1 min-w-[200px]">
            Invoice Extractor
          </div>
        </div>
      </div>

      <div className="bg-primary flex-1 p-2">
        <text>hi</text>
      </div>
    </div>
  )
}
