import SignInForm from "@/components/SignInForm"
import Image from "next/image"
import Link from "next/link"

export default function SignInPage(){
    return (
        <div className="page bg-nature">
            <div
                className="glass w-[500px] h-[500px] flex flex-col justify-center items-center rounded-2xl overflow-hidden"
            >
                <div className="overflow-hidden w-[50px] h-[50px] rounded-xl">
                    <Image src="/nature.png" alt="app icon" height={50} width={50} className="object-cover w-full h-full"></Image>
                </div>
                <strong className="text-2xl">Welcome Back</strong>
                <p className="text-content">{"Don't have an account yet? "}
                    <Link className="text-accent hover:cursor-pointer" href="/auth/signup">Sign up</Link>
                </p>
                <SignInForm />
            </div>
        </div>
    )
}