"use client";

import { useState, useEffect } from "react";
import InvoiceItem from "./InvoiceItem";

type Invoice = {
  id: string;
  vendor_name: string;
  invoice_date: string;
  total_amount: number;
};

async function getInvoices() {
  const userId = "123"; 
  const res = await fetch(`http://127.0.0.1:5000/api/all-invoices`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}


export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

 useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/all-invoices");
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error loading invoices:", error);
      } finally {
        setLoading(false); 
      }
    }

    fetchData();
  }, []); 

  const filteredInvoices = invoices.filter((invoice) => {
    const term = searchTerm.toLowerCase();
    return (
      invoice.vendor_name.toLowerCase().includes(term) ||
      invoice.id.toString().includes(term)
    );
  });


  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) 
        ? prev.filter((itemId) => itemId !== id) 
        : [...prev, id] // Check
    );
  };

  //TODO actual logic neets to do an api call to download all the data
const handleExport = async () => {
    if (selectedIds.length === 0) return;

    try {
      // 1. Change to POST request
      const res = await fetch("http://127.0.0.1:5000/api/invoices-by-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 2. Send the IDs in the body
        body: JSON.stringify({ 
          ids: selectedIds 
        }),
      });
      
      if (!res.ok) throw new Error("Failed to export");
      
      const fullData = await res.json();
      
      if (fullData.length === 0) return;

      // ... (The rest of the CSV generation logic remains exactly the same) ...
      const headers = Object.keys(fullData[0]);
      const rows = fullData.map((obj: any) => 
        headers.map(header => {
          const val = obj[header] === null || obj[header] === undefined ? "" : obj[header];
          return `"${String(val).replace(/"/g, '""')}"`; 
        }).join(",")
      );

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `full_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Export failed:", error);
    }
  };
  return (
    <div className="flex flex-col gap-6 w-full h-full overflow-scroll">
      <div className="flex gap-4 ">
        <input
          type="text"
          placeholder="Search invoices..."
          className="flex-1 p-2 bg-secondary border border-border rounded text-content2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <button
          onClick={handleExport}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 rounded font-bold text-content transition
            ${selectedIds.length > 0 
              ? "btn border-accent bg-accent hover:bg-accent/90 hover:border-accent/90" 
              : "!btn cursor-not-allowed"
            }`}
        >
          Export CSV ({selectedIds.length})
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice: Invoice) => (
            <InvoiceItem
              key={invoice.id}
              id={invoice.id}
              vendor_name={invoice.vendor_name}
              amount={invoice.total_amount}
              date={invoice.invoice_date}
              // Pass selection props down
              isSelected={selectedIds.includes(invoice.id)}
              onToggle={toggleSelection}
            />
          ))
        ) : (
          <p className="text-content2">No invoices found.</p>
        )}
      </div>
    </div>
  );
}