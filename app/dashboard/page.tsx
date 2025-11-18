"use client" // 1. Required for hooks
import useRedirectToAuth from "@/hooks/useRedirectToAuth" // 2. Import your hook
import { useSupabase } from "@/contexts/SupabaseProvider" // 3. Needed for loading state
import Dashboard from "@/components/Dashboard";
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, supabase, isLoading } = useSupabase()
  const inputRef = useRef<HTMLInputElement>(null)
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
  return(
    <div className="page bg-nature">   
      <div className="glass w-[95%] h-[95%] rounded-2xl overflow-y-auto ">      
         <Dashboard />;
      </div>
    </div>
  )
  
}
