"use client"
import { useSupabase } from "@/contexts/SupabaseProvider"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { ViewOffSVG, ViewSVG } from "./SVG"

export default function SignUpForm(){
    const router = useRouter()
    const {supabase} = useSupabase()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isPasswordHidden, setIsPasswordHidden] = useState(true)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    
    const handleShowPassword = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsPasswordHidden(false)
    }, [])
    
    const handleHidePassword = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsPasswordHidden(true)
    }, [])
    
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if(error){
            setErrorMsg(error.message);
            return
        }

        if(data.user?.identities?.length === 0){
            setErrorMsg("Email already registered. Try signing in instead.")
            return
        }else if(!data.session){
            setErrorMsg("Check your inbox to verify your email address before logging in.")
        }else{
            router.replace("/auth/signin")
        }
    }   

    return (
        <form onSubmit={handleSignUp} className="flex text-content flex-col w-[80%] space-y-4 p-2">
            <input name="email" placeholder="Email" className="input input-no-focus w-full border-0 bg-gray-800" value={email} onChange={(e)=>{
                setEmail(e.currentTarget.value)
            }}/>
            <div>
                <label className="input w-full rounded-sm input-no-focus border-0 bg-gray-800">
                    <input name="password" placeholder="Password" value={password} type={isPasswordHidden ? "password" : "text"} onChange={(e)=>{
                        setPassword(e.currentTarget.value)
                    }}/>
                    {isPasswordHidden ? <ViewOffSVG className="text-muted hover:cursor-pointer" onClick={handleShowPassword}/> : <ViewSVG className="text-content hover:cursor-pointer" onClick={handleHidePassword}/>}
                </label>
                {errorMsg && <text className="text-sm text-red-400">{errorMsg}</text>}
            </div>
            <button className="bg-accent p-2 rounded-md hover:bg-accent/80 active:bg-accent/70 text-content">Sign up</button>
        </form>
    )
}