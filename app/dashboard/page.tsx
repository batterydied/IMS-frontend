"use client" // 1. Required for hooks
import useRedirectToAuth from "@/hooks/useRedirectToAuth" // 2. Import your hook
import { useSupabase } from "@/contexts/SupabaseProvider" // 3. Needed for loading state
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {

  return(
    <div className="page bg-nature">   
      <div className="glass w-[95%] h-[95%] rounded-2xl overflow-y-auto ">      
         <Dashboard />;
      </div>
    </div>
  )
  
}
