"use client"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { ViewOffSVG, ViewSVG } from "@/components/SVG"
import { useSupabase } from "@/contexts/SupabaseProvider"

export default function SignInForm(){
    const router = useRouter()
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
    
    const handleSignIn = async (e:React.FormEvent) => {
        e.preventDefault()
        try {
        const res = await fetch("http://localhost:5000/signin", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include", // <--- this is key!
        });

        const data = await res.json();

        if (res.ok) {
            console.log(data)
            setMessage(`Logged in as ${data.user}`);
            // Optionally store token: localStorage.setItem("token", data.access_token);
        } else {
            setMessage(data.error || "Login failed");
        }
        } catch (error) {
        setMessage("Error connecting to backend");
        }
    };

    return (
        <div className="flex flex-col w-[80%] space-y-2 p-2">
            <form className="space-y-4" onSubmit={handleSignIn}>
                <input name="email" placeholder="Email" className="input input-no-focus w-full" value={email} onChange={(e)=>{
                    setEmail(e.currentTarget.value)
                }}/>
                <div>
                    <label className="input input-no-focus w-full">
                        <input name="password" placeholder="Password" value={password} type={isPasswordHidden ? "password" : "text"} onChange={(e)=>{
                            setPassword(e.currentTarget.value)
                        }}/>
                        {isPasswordHidden ? <ViewOffSVG className="hover:cursor-pointer text-muted" onClick={handleShowPassword}/> : <ViewSVG className="hover:cursor-pointer" onClick={handleHidePassword}/>}
                    </label>
                    {errorMsg && <text className="text-sm text-red-400">{errorMsg}</text>}
                </div>
                <button type="submit" className="bg-accent p-2 rounded-md hover:bg-accent/80 active:bg-accent/70 text-content w-full">Sign in</button>
            </form>
            <div className='flex flex-row items-center justify-between'>
                <div className='w-[47%] h-0.5 bg-muted'/>
                or
                <div className='w-[47%] h-0.5 bg-muted'/>
            </div>
            <button onClick={handleGoogleSignIn} className="hover:cursor-pointer text-content p-2 rounded-md hover:text-accent flex justify-center">
                <div className="flex flex-row space-x-3">
                    <Image src="/google.svg" alt="Google Icon" width={20} height={20}/>
                    <div>Continue with Google</div>
                </div>
            </button>
        </div>
    )
}
