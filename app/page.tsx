"use client"
import { useSupabase } from "@/contexts/SupabaseProvider"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import Dashboard from "@/components/Dashboard"
import InvoiceList from "@/components/InvoiceList"
import { ExtractView } from "@/components/ExtractView"

export type ViewMode = "dashboard" | "search" | "extract";

const VIEWS = {
  dashboard: <Dashboard />,
  search: <InvoiceList />,
  extract: <ExtractView />,
} as const;

export default function App() {
  const router = useRouter()
  const { user, supabase, isLoading } = useSupabase()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [query, setQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");

  const handleSelectView = (view: ViewMode) => {
    setViewMode(view)
  }

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.replace("/auth/signin")
  }, [router, supabase.auth])

  const handleToggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  const handleSetQuery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if(query != ""){
        setViewMode("search")
      }
    }
  }, [query])

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/signin")
    }
  }, [router, user, isLoading])

  if (!user) return (
    <div className="page">
      <span className="loading loading-spinner loading-xl"></span>
    </div>
  )

  return (
    <div className="flex flex-row h-screen bg-primary">
      <Sidebar handleSignOut={handleSignOut} handleToggle={handleToggleCollapsed} isCollapsed={isCollapsed} handleSetQuery={handleSetQuery} query={query} handleKeyDown={handleKeyDown} handleSelectView={handleSelectView}/>
      <div className="bg-primary flex-1 p-2">
        {VIEWS[viewMode]}
      </div>
    </div>
  )
}
