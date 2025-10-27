import { LogOutSVG, UploadSVG } from "./SVG"
import { memo } from "react"

interface NavbarProps {
    handleUpload: () => void
    handleLogOut: () => void
}

const Navbar = ({handleUpload, handleLogOut}: NavbarProps) => {
    return <div className="navbar justify-between bg-primary shadow-sm space-x-2 px-6">
        
        <button onClick={handleUpload} className="rounded-md btn bg-accent border-transparent hover:bg-accent/80 group text-secondary hover:text-white">
            <UploadSVG />
            Upload Invoice
        </button>
        <button onClick={handleLogOut} className="rounded-md btn btn-square border-transparent bg-primary hover:bg-secondary group">
            <LogOutSVG className="text-secondary group-hover:text-red-500"/>
        </button>
    </div>
}

export default memo(Navbar)