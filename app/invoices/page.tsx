import InvoiceList from "@/components/InvoiceList";

async function getInvoices() {
  const userId = "123"; 
  const res = await fetch(`http://127.0.0.1:5000/api/all-invoices`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-6 text-white">Invoices</h1>
      
      <InvoiceList invoices={invoices} />
      
    </main>
  );
}