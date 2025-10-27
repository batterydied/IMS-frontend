import { LogOutSVG, UploadSVG } from "./SVG"
import { memo, useState } from "react"

interface NavbarProps {
    handleUpload: () => void
    handleLogOut: () => void
}

const Navbar = ({handleUpload, handleLogOut}: NavbarProps) => {
    const [selected, setSelected] = useState("month")
    return <div className="navbar justify-between bg-secondary shadow-sm space-x-2 px-6">
        
        <button onClick={handleUpload} className="rounded-md btn bg-transparent hover:bg-primary group text-muted hover:text-content">
            <UploadSVG />
            Upload Invoice
        </button>
        <div className="flex justify-center items-center space-x-2">
            <div className="bg-content w-[80px] text-primary text-center p-2 rounded-md hover:cursor-pointer">
                Day
            </div>
            <div className="bg-content w-[80px] text-primary text-center p-2 rounded-md hover:cursor-pointer">
                Week
            </div>
            <div className={`bg-content w-[80px] text-primary text-center p-2 rounded-md hover:cursor-pointer ${selected == "month" && "!bg-accent"}`}>
                Month
            </div>
            <button onClick={handleLogOut} className="rounded-md btn btn-square bg-transparent hover:bg-primary group">
                <LogOutSVG className="text-muted group-hover:text-red-500"/>
            </button>
        </div>
    </div>
}

export default memo(Navbar)