"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import CalendarWidget from '@/components/Calendar'; // Adjust path
import { AnyColor, Colord, colord } from "colord";

// Dynamically import Plot
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// --- Interfaces ---
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
  top_products_qty: Product[];
  product_sales: Product[];
  all_vendors: Vendor[];
}

// --- Helper Functions ---
export const generatePalette = (baseColor: AnyColor | Colord, steps = 5) => {
  const palette = [];
  for (let i = 0; i < steps; i++) {
    // Lighten logic: Step 0 is original, Step 5 is much lighter
    const newColor = colord(baseColor).lighten(0.05 * i).toHex(); 
    palette.push(newColor);
  }
  return palette;
};

export default function Dashboard() {
  const [data, setData] = useState<InvoiceData | null>(null);
  
  // Default colors (will be overwritten by CSS vars on mount)
  const [accentColor, setAccentColor] = useState("#008080"); 
  const [mutedColor, setMutedColor] = useState("#888888");
  const [contentColor, setContentColor] = useState("#000000");

  // 1. Initial Setup: Get CSS Vars and Start Polling
  useEffect(() => {
    // -- CSS Variable Extraction --
    const style = getComputedStyle(document.documentElement);
    
    const rawAccent = style.getPropertyValue("--accent").trim();
    if (rawAccent) setAccentColor(colord(rawAccent).toHex());
    
    const rawMuted = style.getPropertyValue("--muted").trim();
    if (rawMuted) setMutedColor(colord(rawMuted).toHex());
    
    const rawContent = style.getPropertyValue("--content").trim();
    if (rawContent) setContentColor(colord(rawContent).toHex());

    // -- Data Fetching --
    const fetchData = async () => {
      try {
        const res = await axios.get<InvoiceData>("http://127.0.0.1:5000/api/invoices");
        setData(res.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 60000); // Poll every 60s

    return () => clearInterval(interval);
  }, []);

  // 2. Early Return if no data (Must happen before we try to map arrays)
  if (!data) return <div className="p-8 text-gray-400">Loading dashboard data...</div>;

  // 3. Destructure Data
  const {
    total_revenue,
    unique_vendors,
    monthly_sales = [],
    top_vendors = [],
    all_vendors = [],
  } = data;

  // 4. Prepare Arrays for Plotly
  const months = monthly_sales.map((d) => d.month);
  const monthRevenues = monthly_sales.map((d) => d.revenue ?? 0);

  const vendorNames = top_vendors.map((d) => d.vendor_name);
  const vendorRevenues = top_vendors.map((d) => d.revenue ?? 0);

  const allVendorNames = all_vendors.map((d) => d.vendor_name);
  const allVendorRevenue = all_vendors.map((d) => d.revenue ?? 0);

  // 5. Generate Palette dynamically based on the actual data length
  // We use the length of 'all_vendors' because that's where we use the palette
  const pieChartColors = generatePalette(accentColor, all_vendors.length || 1);

  const appointments = [
    { date: "2025-12-05", title: "Vendor Meeting" },
    { date: "2025-12-12", title: "Inventory Audit" },
    { date: "2025-12-25", title: "Tax Deadline" },
    { date: "2025-12-26", title: "Follow up" },
  ];

  return (
    <div className="flex flex-col w-[95%] justify-center mx-auto items-center">
      <h1 className="text-center text-3xl font-bold p-8 color-content">
        Store Dashboard
      </h1>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 p-6 w-full">
        
        {/* KPI Cards */}
        <div className="md:col-span-2 bg-secondary rounded-xl p-4 border border-border shadow-sm">
          <h2 className="text-content font-bold">Total Revenue</h2>
          <p className="text-4xl font-bold text-accent">
            ${total_revenue.toLocaleString()}
          </p>
        </div>
        <div className="md:col-span-2 bg-secondary rounded-xl p-4 border border-border shadow-sm">
          <h2 className="text-content font-bold">Unique Vendors</h2>
          <p className="text-4xl font-bold text-accent">
            {unique_vendors}
          </p>
        </div>
        <div className="md:col-span-2 bg-secondary rounded-xl p-4 border border-border shadow-sm">
          <h2 className="text-content font-bold">Status</h2>
          <p className="text-4xl font-bold text-accent">Active</p>
        </div>

        {/* Row 2: Monthly Sales (Big Chart) */}
        <div className="col-span-4 bg-secondary rounded-xl p-4 border border-border shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-content">Monthly Sales</h2>
          <Plot
            data={[{
              x: months,
              y: monthRevenues,
              type: "lines+markers",
              line: { width: 3, shape: "spline", color: accentColor },
              marker: { color: accentColor },
              hovertemplate: "<b>Month:</b> %{x}<br><b>Revenue:</b> $%{y:,.0f}<extra></extra>",
            }]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: mutedColor },
              xaxis: { showgrid: false },
              yaxis: { 
                showgrid: true, 
                gridcolor: "rgba(128,128,128,0.2)", // Subtle grid
                zeroline: false, 
                tickfont: { color: mutedColor } 
              },
              margin: { t: 20, b: 40, l: 60, r: 20 },
              height: 350,
              autosize: true
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Row 2: Calendar */}
        <div className="col-span-2 bg-secondary rounded-xl p-4 border border-border shadow-sm flex flex-col items-center">
           {/* Passed appointments correctly */}
          <CalendarWidget appointments={appointments} />
        </div>

        {/* Row 3: Top Vendors Bar Chart */}
        <div className="col-span-3 bg-secondary rounded-xl p-4 border border-border shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-content">Top Vendors</h2>
          <Plot
            data={[{
              x: vendorRevenues,
              y: vendorNames,
              type: "bar",
              orientation: "h",
              marker: { color: accentColor },
              hovertemplate: "<b>Vendor:</b> %{y}<br><b>Revenue:</b> $%{x:,.0f}<extra></extra>",
            }]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: mutedColor },
              margin: { t: 20, b: 40, l: 120, r: 20 }, // Increased left margin for long names
              yaxis: { automargin: true },
              height: 350,
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Row 3: All Vendors Pie Chart */}
        <div className="col-span-3 min-h-100 bg-secondary rounded-xl p-4 border border-border shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-content">Vendor Share</h2>
          <Plot
            data={[{
              labels: allVendorNames,
              values: allVendorRevenue,
              type: "pie",
              hole: 0.5,
              marker: {
                colors: pieChartColors, // <--- Now uses the CORRECT generated palette
              },
              hovertemplate: "<b>%{label}</b><br>Revenue: $%{value:,.0f}<br>Share: %{percent}<extra></extra>",
            }]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: mutedColor },
              margin: { t: 20, b: 20, l: 20, r: 20 },
              height: 350,
              showlegend: true
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

      </div>
    </div>
  );
}