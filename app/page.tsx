"use client"
import { useSupabase } from "@/contexts/SupabaseProvider"
import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import Navbar from "@/components/Navbar"

export default function App() {
  const router = useRouter()
  const { user, supabase, isLoading } = useSupabase()

  const handleLogOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace("/auth/signin")
  }, [router, supabase.auth])

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
    <div className="flex flex-col items-center justify-center h-screen bg-primary">
      <Navbar handleLogOut={handleLogOut} handleUpload={()=>{}}/>
      <div className="grid grid-cols-[35%_1fr] gap-2 p-6 h-full w-full">
        <div className="bg-secondary p-2">
          <text className="text-content">Welcome! Glad to see you.</text>
        </div>
        <div className="bg-secondary p-2">

        </div>
      </div>
    </div>
  )
}
