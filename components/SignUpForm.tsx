"use client"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { ViewOffSVG, ViewSVG } from "./SVG"

export default function SignUpForm(){
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
    
  const handleSignUp = async (e:React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log(data)
        setErrorMsg(data.message);
        // Optionally store token: localStorage.setItem("token", data.access_token);
      } else {
        setErrorMsg(data.error || "Login failed");
      }
    } catch (error) {
      console.log(error);
    }
  };

    return (
        <form onSubmit={handleSignUp} className="flex flex-col w-[80%] space-y-4 p-2">
            <input name="email" placeholder="Email" className="input input-no-focus w-full" value={email} onChange={(e)=>{
                setEmail(e.currentTarget.value)
            }}/>
            <div>
                <label className="input input-no-focus w-full">
                    <input name="password" placeholder="Password" value={password} type={isPasswordHidden ? "password" : "text"} onChange={(e)=>{
                        setPassword(e.currentTarget.value)
                    }}/>
                    {isPasswordHidden ? <ViewOffSVG className="hover:cursor-pointer" onClick={handleShowPassword}/> : <ViewSVG className="text-secondary hover:cursor-pointer" onClick={handleHidePassword}/>}
                </label>
                {errorMsg && <text className="text-sm text-red-400">{errorMsg}</text>}
            </div>
            <button className="bg-accent p-2 rounded-md hover:bg-accent/80 active:bg-accent/70 text-secondary">Sign up</button>
        </form>
    )
}
