import InvoiceUploader from "./DocumentUpload"
import { LogOutSVG, UploadSVG } from "./SVG"
import { memo } from "react"

interface NavbarProps {
    handleUpload: () => void
    handleLogOut: () => void
}

const Navbar = ({handleUpload, handleLogOut}: NavbarProps) => {
    return <div className="navbar justify-between bg-primary shadow-sm space-x-2 px-6">
        
        <InvoiceUploader />

        <button onClick={handleLogOut} className="rounded-md btn btn-square border-transparent bg-primary/80 hover:bg-secondary group">
            <LogOutSVG className="text-content group-hover:text-red-500"/>
        </button>
    </div>
}

export default memo(Navbar)