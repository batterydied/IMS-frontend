"use client";

import { useState, useEffect } from "react";
import InvoiceItem from "./InvoiceItem";

type Invoice = {
  id: string;
  vendor_name?: string;
  invoice_date?: string;
  total_amount?: number;
};

async function getInvoices() {
  const res = await fetch("http://127.0.0.1:5000/api/all-invoices", {
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
        const data = await getInvoices();
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
    const vendor = invoice.vendor_name?.toLowerCase() || "";
    const id = invoice.id?.toString().toLowerCase() || "";
    return vendor.includes(term) || id.includes(term);
  });

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const handleExport = () => {
    const selectedInvoices = invoices.filter((inv) =>
      selectedIds.includes(inv.id)
    );

    if (selectedInvoices.length === 0) return;

    const headers = ["ID", "Vendor", "Date", "Total"];

    const rows = selectedInvoices.map((inv) =>
      [
        `"${inv.id}"`,
        `"${inv.vendor_name || ""}"`,
        `"${inv.invoice_date || ""}"`,
        `"${inv.total_amount ?? 0}"`,
      ].join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "selected_invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <p className="text-content2 p-4">Loading invoices...</p>;
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full overflow-auto">
      <div className="flex gap-4">
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
          className={`px-4 py-2 rounded transition
            ${
              selectedIds.length > 0
                ? "btn bg-accent hover:bg-accent/90 border-0"
                : "btn cursor-not-allowed text-content bg-muted"
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
              description={invoice.vendor_name || ""}
              amount={invoice.total_amount ?? 0}
              date={invoice.invoice_date || ""}
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
