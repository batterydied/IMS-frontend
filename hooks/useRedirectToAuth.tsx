"use client"
import { useEffect } from "react"
import { useSupabase } from "@/contexts/SupabaseProvider"
import { useRouter } from "next/navigation"

const useRedirectToAuth = () => {
    const router = useRouter()
    const { user } = useSupabase()
    
    useEffect(()=>{
        if(!user){
            router.push("/auth/signin")
        }
    }, [router, user])
}

export default useRedirectToAuth