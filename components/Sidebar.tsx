import { memo } from "react";
import { LogOutSVG, MenuSVG } from "./SVG"
import { ViewMode }from "@/app/page";

interface Sidebar {
    handleToggle: () => void;
    isCollapsed: boolean;
    handleSelectView: (view: ViewMode) => void;
    handleSignOut: () => void;
}

export const Sidebar = memo(function Sidebar({handleSignOut, handleToggle, isCollapsed, handleSelectView} : Sidebar){
    return (
        <>
        <div className="w-[50px] h-full bg-content flex justify-center p-2 border-r border-muted items-start">
            <div onClick={handleToggle} className="hover:cursor-pointer hover:bg-accent hover:text-content text-content2 p-1 rounded-sm h-auto">
                <MenuSVG/>
            </div>
        </div>
        <div
        className={`${
            isCollapsed ? "w-0 !p-0" : "w-[250px]"
        } transition-all duration-300 bg-content py-3 px-2 overflow-hidden h-full`}
        >
            <div
            className={`w-full transition-opacity duration-300 flex flex-col h-full space-y-2 ${
            isCollapsed ? "opacity-0" : "opacity-100"
            }`}
            >
                <div className="text-content2 p-1 min-w-[200px] hover:cursor-pointer" onClick={() => handleSelectView("dashboard")}>
                    Dashboard
                </div>
                <div className="text-content2 p-1 min-w-[200px] hover:cursor-pointer" onClick={() => handleSelectView("search")}>
                    Invoices
                </div>
                <div className="text-content2 p-1 min-w-[200px] hover:cursor-pointer" onClick={() => handleSelectView("extract")}>
                    Extraction
                </div>
                <div className="p-4 flex-1 flex items-end w-full justify-end">
                    <button className="btn hover:bg-accent rounded-md border-0" onClick={handleSignOut}>Sign Out
                        <LogOutSVG/>
                    </button>
                </div>
            </div>
        </div>
        </>
    )
})