"use client"
import SignUpForm from "@/components/SignUpForm"
import { useSupabase } from "@/contexts/SupabaseProvider"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignUpPage(){
    const {user, isLoading} = useSupabase()

    const router = useRouter()
    if(isLoading) return null

    if(!isLoading && user){
        router.replace('/')
        return null
    }

    return (
        <div className="grid grid-cols-[2fr_1fr] w-full h-full">
            <div className="page bg-nature w-full h-full">
                <span className="text-content text-9xl italic">IMS</span>
            </div>
            <div className="page bg-content">
                <div
                    className="w-[500px] h-[500px] flex flex-col justify-center items-center rounded-2xl overflow-hidden"
                >
                    <div className="overflow-hidden w-[50px] h-[50px] rounded-xl">
                        <Image src="/nature.png" alt="app icon" height={50} width={50} className="object-cover w-full h-full"></Image>
                    </div>
                    <strong className="text-2xl">Create Account</strong>
                    <p className="text-content2">{"Already have an account? "}
                        <Link className="text-accent hover:cursor-pointer" href="/auth/signin">Sign in</Link>
                    </p>
                    <SignUpForm />
                </div>
            </div>
        </div>
    )
}