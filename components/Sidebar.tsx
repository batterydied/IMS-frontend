import { memo } from "react";
import { MenuSVG } from "./SVG"
import { ViewMode }from "@/app/page";

interface Sidebar {
    handleToggle: () => void;
    isCollapsed: boolean;
    query: string;
    handleSetQuery: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleSelectView: (view: ViewMode) => void;
}

export const Sidebar = memo(function Sidebar({handleToggle, isCollapsed, query, handleSetQuery, handleKeyDown, handleSelectView} : Sidebar){
    return (
        <>
        <div className="w-[50px] h-full bg-content flex justify-center p-2 border-r border-muted items-start">
            <div onClick={handleToggle} className="hover:cursor-pointer hover:bg-secondary text-content2 p-1 rounded-sm h-auto">
                <MenuSVG/>
            </div>
        </div>
        <div
        className={`${
            isCollapsed ? "w-0 !p-0" : "w-[250px]"
        } transition-all duration-300 bg-content p-2 overflow-hidden h-full`}
        >
            <div
            className={`w-full transition-opacity duration-300 flex flex-col h-full space-y-2 ${
            isCollapsed ? "opacity-0" : "opacity-100"
            }`}
            >
                <input
                type="text"
                placeholder="Search for invoice..."
                value={query}
                onChange={handleSetQuery}
                onKeyDown={handleKeyDown}
                className="input w-full focus:outline-none border-0 bg-primary text-content2"
                />
                <div className="text-content2 p-1 min-w-[200px] hover:cursor-pointer" onClick={() => handleSelectView("dashboard")}>
                    Dashboard
                </div>
                <div className="text-content2 p-1 min-w-[200px] hover:cursor-pointer" onClick={() => handleSelectView("extract")}>
                    Extract Invoices
                </div>
            </div>
        </div>
        </>
    )
})