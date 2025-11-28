"use client";

import { useState } from "react";
import InvoiceItem from "./InvoiceItem";

type Invoice = {
  id: string;
  description: string;
  invoice_date: string;
  total_amount: number;
};

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredInvoices = invoices.filter((invoice) => {
    const term = searchTerm.toLowerCase();
    return (
      invoice.description.toLowerCase().includes(term) ||
      invoice.id.toString().includes(term)
    );
  });

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) 
        ? prev.filter((itemId) => itemId !== id) // Uncheck
        : [...prev, id] // Check
    );
  };

  //TODO actual logic neets to do an api call to download all the data
  const handleExport = () => {
    const selectedInvoices = invoices.filter((inv) => selectedIds.includes(inv.id));
    
    if (selectedInvoices.length === 0) return;

    const headers = ["ID", "Description", "Date", "Price"];

    const rows = selectedInvoices.map(inv => [
      `"${inv.id}"`, 
      `"${inv.description}"`, 
      `"${inv.invoice_date}"`, 
      `"${inv.total_amount}"`
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "selected_invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search invoices..."
          className="flex-1 p-2 border border-gray-300 rounded text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <button
          onClick={handleExport}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 rounded font-bold text-white transition
            ${selectedIds.length > 0 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-gray-600 cursor-not-allowed opacity-50"
            }`}
        >
          Export CSV ({selectedIds.length})
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <InvoiceItem
              key={invoice.id}
              id={invoice.id}
              description={invoice.description}
              amount={invoice.total_amount}
              date={invoice.invoice_date}
              // Pass selection props down
              isSelected={selectedIds.includes(invoice.id)}
              onToggle={toggleSelection}
            />
          ))
        ) : (
          <p className="text-gray-500">No invoices found.</p>
        )}
      </div>
    </div>
  );
}