"use client"; // mark as client component

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

// dynamically import Plot so it's only loaded on the client
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface MonthlySale {
  month: string;
  revenue: number;
}

interface Vendor {
  vendor_name: string;
  revenue: number;
}

interface Product {
  description: string;
  quantity: number;
}

interface InvoiceData {
  total_revenue: number;
  unique_vendors: number;
  monthly_sales: MonthlySale[];
  top_vendors: Vendor[];
  top_products_qty: Product[];  // top 10 products by quantity
  product_sales: Product[];     // all products by quantity
  all_vendors: Vendor[];        // all vendors with revenue
}


export default function Dashboard() {
  const [data, setData] = useState<InvoiceData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get<InvoiceData>("http://127.0.0.1:5000/api/invoices");
      setData(res.data);
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

 if (!data) return <p className="text-gray-400">Loading data...</p>;

  const {
    total_revenue,
    unique_vendors,
    monthly_sales = [],
    top_vendors = [],
    top_products_qty = [],
    product_sales = [],
    all_vendors = [],
  } = data;

  // Helper arrays
  const months = monthly_sales.map((d: any) => d.month);
  const monthRevenues = monthly_sales.map((d: any) => d.revenue ?? 0);

  const vendorNames = top_vendors.map((d: any) => d.vendor_name);
  const vendorRevenues = top_vendors.map((d: any) => d.revenue ?? 0);

  const productNames = top_products_qty.map((d: any) => d.description);
  const productQty = top_products_qty.map((d: any) => d.quantity ?? 0);

  const allProductNames = product_sales.map((d: any) => d.description);
  const allProductQty = product_sales.map((d: any) => d.quantity ?? 0);

  const allVendorNames = all_vendors.map((d: any) => d.vendor_name);
  const allVendorRevenue = all_vendors.map((d: any) => d.revenue ?? 0);

  return (
    <div className="p-6 text-white bg-[#121212] min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Store Sales Dashboard
      </h1>

            {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1E1E2F] p-4 rounded-lg text-center">
          <h2 className="text-gray-400">Total Revenue</h2>
          <p className="text-4xl font-bold text-green-400">
            ${total_revenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#1E1E2F] p-4 rounded-lg text-center">
          <h2 className="text-gray-400">Unique Vendors</h2>
          <p className="text-4xl font-bold text-blue-400">{unique_vendors}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Sales Trend */}
        <div className="bg-[#1E1E2F] p-4 rounded-lg">
          <h2 className="text-gray-400 text-center">Monthly Sales</h2>

          <Plot
            data={[{
              x: months,
              y: monthRevenues,
              type: "bar",
              marker: { color: "teal" },
              hovertemplate: "<b>Month:</b> %{x}<br><b>Revenue:</b> $%{y:,.0f}<extra></extra>",
            }]}
            layout={{
              title: "Monthly Sales Trend",
              paper_bgcolor: "#1E1E2F",
              plot_bgcolor: "#1E1E2F",
              font: { color: "white" },
              margin: { t: 50, b: 80, l: 60, r: 20 },
            }}
            config={{ displayModeBar: true, displaylogo: false, showTips: false }}
            style={{ width: "100%", height: "400px" }}
          />
        </div>
          
        {/* Top Vendors */}
        <div className="bg-[#1E1E2F] p-4 rounded-lg">
          <h2 className="text-gray-400 text-center">Top Vendors</h2>

          <Plot
            data={[{
              x: vendorRevenues,
              y: vendorNames,
              type: "bar",
              orientation: "h",
              marker: { color: "cornflowerblue" },
              hovertemplate: "<b>Vendor:</b> %{y}<br><b>Revenue:</b> $%{x:,.0f}<extra></extra>",
            }]}
            layout={{
              title: "Top Vendors by Revenue",
              paper_bgcolor: "#1E1E2F",
              plot_bgcolor: "#1E1E2F",
              font: { color: "white" },
              margin: { t: 50, b: 80, l: 150, r: 20 },
            }}
            config={{ displayModeBar: true, displaylogo: false, showTips: false }}
            style={{ width: "100%", height: "400px" }}
          />
        </div>
          
        {/* Top Products (Pie Chart) */}
        <div className="bg-[#1E1E2F] p-4 rounded-lg">
          <h2 className="text-gray-400 text-center">Top Products</h2>

          <Plot
            data={[{
              labels: productNames,
              values: productQty,
              type: "pie",
              hole: 0.6,
              marker: { colors: [
                "#00CC96", "#AB63FA", "#FFA15A", "#19D3F3", "#FF6692",
                "#B6E880", "#FF97FF", "#FECB52", "#636EFA", "#EF553B"
              ] },
              hovertemplate: "<b>%{label}</b><br>Qty: %{value}<br>Share: %{percent}<extra></extra>",
            }]}
            layout={{
              title: "Top Products by Quantity",
              paper_bgcolor: "#1E1E2F",
              plot_bgcolor: "#1E1E2F",
              font: { color: "white" },
              margin: { t: 50, b: 80, l: 60, r: 20 },
            }}
            config={{ displayModeBar: true, displaylogo: false, showTips: false }}
            style={{ width: "100%", height: "400px" }}
          />
        </div>
                 {/* All Vendors Overview (Pie) */}
        <div className="bg-[#1E1E2F] p-4 rounded-lg">
          <h2 className="text-gray-400 text-center">Vendor market share???</h2>

          <Plot
            data={[{
              labels: allVendorNames,
              values: allVendorRevenue,
              type: "pie",  
              hole: 0.4,
              marker: { colors: [
                "#636EFA","#EF553B","#00CC96","#AB63FA","#FFA15A",
                "#19D3F3","#FF6692","#B6E880","#FF97FF","#FECB52"
              ] },
              hovertemplate: "<b>%{label}</b><br>Revenue: $%{value:,.0f}<br>Share: %{percent}<extra></extra>",
            }]}
            layout={{
              title: "All Vendors Overview",
              paper_bgcolor: "#1E1E2F",
              plot_bgcolor: "#1E1E2F",
              font: { color: "white" },
              margin: { t: 50, b: 80, l: 60, r: 20 },
            }}
            config={{ displayModeBar: true, displaylogo: false, showTips: false }}
            style={{ width: "100%", height: "400px" }}
          />
        </div>

        {/* All Products by Quantity */}
        <div className="bg-[#1E1E2F] p-4 rounded-lg">
          <h2 className="text-gray-400 text-center">I dont even know what this is</h2>

          <Plot
            data={[{
              x: allProductQty,
              y: allProductNames,
              type: "bar",
              orientation: "h",
              marker: { color: "mediumpurple" },
              hovertemplate: "<b>Product:</b> %{y}<br><b>Qty:</b> %{x}<extra></extra>",
            }]}
            layout={{
              title: "All Products by Quantity",
              paper_bgcolor: "#1E1E2F",
              plot_bgcolor: "#1E1E2F",
              font: { color: "white" },
              margin: { t: 50, b: 80, l: 150, r: 20 },
            }}
            config={{ displayModeBar: true, displaylogo: false, showTips: false }}
            style={{ width: "100%", height: "400px" }}
          />
        </div>
          

      </div>
          
    </div>
  );
}