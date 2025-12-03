"use client" // 1. Required for hooks
import useRedirectToAuth from "@/hooks/useRedirectToAuth" // 2. Import your hook
import { useSupabase } from "@/contexts/SupabaseProvider" // 3. Needed for loading state
import Dashboard from "@/components/Dashboard";
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import { InvoiceData } from "@/types/dashboard"; // Adjust path

/*
// 1. Define the fetching function
async function getInvoiceData(): Promise<InvoiceData | null> {
  try {
    // Next.js extends 'fetch' to allow caching options
    // cache: 'no-store' ensures it fetches fresh data every time the page loads
    const res = await fetch("http://127.0.0.1:5000/api/invoices", { 
      cache: "no-store",
      // If using Docker/Container, ensure localhost points to the right place
    });

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    return res.json();
  } catch (error) {
    console.error("Server Fetch Error:", error);
    return null;
  }
}

// 2. The Page Component (Async)
export default async function Page() {
  const data = await getInvoiceData();

  if (!data) {
    return <div className="p-10 text-red-500">Error loading data. Check backend connection.</div>;
  }

  // 3. Pass data to the Client Component
  return (

    <div className="page bg-nature">   
      <div className="bg-primary w-[95%] h-[95%] rounded-2xl overflow-y-auto ">      
        <Dashboard initialData={data} />
      </div>
    </div>
  );
}*/





export default function DashboardPage() {
  const router = useRouter()
  const { user, supabase, isLoading } = useSupabase()
  const inputRef = useRef<HTMLInputElement>(null)
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
  return(
    <div className="page bg-nature">   
      <div className="bg-primary w-[95%] h-[95%] rounded-2xl overflow-y-auto ">      
         <Dashboard />;
      </div>
    </div>
  )
  
}
