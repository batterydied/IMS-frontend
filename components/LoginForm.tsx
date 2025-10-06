"use client"
export default function LoginForm(){
    return (
        <div className="flex flex-col w-[80%] space-y-4 p-2">
            <input placeholder="Email" className="input input-no-focus w-full"/>
            <input placeholder="Password" className="input input-no-focus w-full"/>
            <button className="bg-accent p-2 rounded-md hover:bg-accent/80 active:bg-accent/70 text-secondary">Login</button>
        </div>
    )
}