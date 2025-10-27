"use client"
import { useSupabase } from "@/contexts/SupabaseProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Navbar from "@/components/Navbar"

export default function App() {
  const router = useRouter()
  const { user, supabase, isLoading } = useSupabase()

  const handleLogOut = async () => {
    await supabase.auth.signOut()
    router.replace("/auth/signin")
  }

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
    <div className="flex flex-col items-center justify-center h-screen">
      <Navbar handleLogOut={()=>{}} handleUpload={()=>{}}/>
      <div className="grid grid-cols-[35%_1fr] gap-2 p-6 h-full w-full">
        <div className="bg-white min-h-[50px]">

        </div>
        <div className="bg-gray-400 min-h-[50px]">

        </div>
      </div>
    </div>
  )
}
