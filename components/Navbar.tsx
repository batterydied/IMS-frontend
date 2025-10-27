import { LogOutSVG, UploadSVG } from "./SVG"
import { memo } from "react"

interface NavbarProps {
    handleUpload: () => void
    handleLogOut: () => void
}

const Navbar = ({handleUpload, handleLogOut}: NavbarProps) => {
    return <div className="navbar justify-end bg-secondary shadow-sm space-x-2 px-6">
        <button onClick={handleUpload} className="btn btn-square bg-transparent border-transparent hover:bg-primary group text-accent">
            <UploadSVG className="group-hover:text-content"/>
        </button>
        <button onClick={handleLogOut} className="btn btn-square bg-transparent border-transparent hover:bg-primary group text-accent">
            <LogOutSVG className="group-hover:text-red-500"/>
        </button>
    </div>
}

export default memo(Navbar)