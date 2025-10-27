"use client"
import Image from "next/image"
import { useCallback, useState } from "react"
import { ViewOffSVG, ViewSVG } from "@/components/SVG"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/contexts/SupabaseProvider"

export default function LoginForm(){
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isPasswordHidden, setIsPasswordHidden] = useState(true)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const {supabase} = useSupabase()

    const handleShowPassword = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsPasswordHidden(false)
    }, [])

    const handleHidePassword = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsPasswordHidden(true)
    }, [])

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if(email && password){
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if(error){
                setErrorMsg(error.message)
            }else{
                setErrorMsg(null)
                router.replace("/")
            }
        }else{
            alert("Please enter your email and password")
        }
    }

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
        });

        if (error) {
            console.error("Google sign-in error:", error.message);
        } else {
            console.log("Redirecting to Google…");
        }
    };

    return (
        <div className="flex flex-col w-[80%] space-y-2 p-2">
            <form className="space-y-4" onSubmit={handleSignIn}>
                <input name="email" placeholder="Email" className="input input-no-focus w-full" value={email} onChange={(e)=>{
                    setEmail(e.currentTarget.value)
                }}/>
                <div>
                    <label className="input w-full">
                        <input name="password" placeholder="Password" className="input-no-focus" value={password} type={isPasswordHidden ? "password" : "text"} onChange={(e)=>{
                            setPassword(e.currentTarget.value)
                        }}/>
                        {isPasswordHidden ? <ViewOffSVG className="hover:cursor-pointer" onClick={handleShowPassword}/> : <ViewSVG className="hover:cursor-pointer" onClick={handleHidePassword}/>}
                    </label>
                    {errorMsg && <text className="text-sm text-red-400">{errorMsg}</text>}
                </div>
                <button type="submit" className="bg-accent p-2 rounded-md hover:bg-accent/80 active:bg-accent/70 text-secondary w-full">Login</button>
            </form>
            <div className='flex flex-row items-center justify-between'>
                <div className='w-[47%] h-0.5 bg-muted'/>
                or
                <div className='w-[47%] h-0.5 bg-muted'/>
            </div>
            <button onClick={handleGoogleSignIn} className="bg-content p-2 rounded-md hover:bg-content/80 active:bg-content/70 text-secondary flex justify-center">
                <div className="flex flex-row space-x-3">
                    <Image src="/google.svg" alt="Google Icon" width={20} height={20}/>
                    <div>Continue with Google</div>
                </div>
            </button>
        </div>
    )
}
