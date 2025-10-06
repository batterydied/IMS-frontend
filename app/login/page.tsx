import LoginForm from "@/components/LoginForm";
import Image from "next/image";
export default function loginPage(){
    return (
        <div className="page bg-nature">
            <div
                className="glass w-[500px] h-[500px] flex flex-col justify-center items-center rounded-2xl overflow-hidden"
            >
                <div className="overflow-hidden w-[50px] h-[50px] rounded-xl">
                    <Image src="/nature.png" alt="app icon" height={50} width={50} className="object-cover w-full h-full"></Image>
                </div>
                <strong className="text-2xl">Welcome Back</strong>
                <p className="text-muted">{"Don't have an account yet?"} <span className="text-content hover:cursor-pointer">Sign up</span></p>
                <LoginForm />
            </div>
        </div>
    )
}