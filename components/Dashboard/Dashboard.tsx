"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import CalendarWidget from '@/components/Calendar/Calendar';
import { AnyColor, Colord, colord } from "colord";
import { TailSpin } from 'react-loader-spinner'
import type { InvoiceData } from "@/types/dashboard";
// Dynamically import Plot
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });


export const generatePalette = (baseColor: AnyColor | Colord, steps = 5) => {
  const palette = [];
  for (let i = 0; i < steps; i++) {
    const newColor = colord(baseColor).lighten(0.05 * i).toHex(); 
    palette.push(newColor);
  }
  return palette;
};

export default function Dashboard({ isCollapsed }: { isCollapsed: boolean }) {
  const [data, setData] = useState<InvoiceData | null>(null);
  
  const [accentColor, setAccentColor] = useState("#008080"); 
  const [borderColor, setBorderColor] = useState("#888888");
  const [contentColor, setContentColor] = useState("#000000");

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    
    const rawAccent = style.getPropertyValue("--accent").trim();
    if (rawAccent) setAccentColor(colord(rawAccent).toHex());
    
    const rawBorder = style.getPropertyValue("--border").trim();
    if (rawBorder) setBorderColor(colord(rawBorder).toHex());
    
    const rawContent = style.getPropertyValue("--content2").trim();
    if (rawContent) setContentColor(colord(rawContent).toHex());

    const fetchData = async () => {
      try {
        const res = await axios.get<InvoiceData>("http://127.0.0.1:5000/api/invoices");
        setData(res.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData(); 
    const interval = setInterval(fetchData, 60000); 

    return () => clearInterval(interval);
  }, [isCollapsed]);

 if (!data) return (
  <div className="page">
    <span className="text-content2 animate-pulse">Loading data...</span>
  </div>
 )


  const {
    total_revenue,
    unique_vendors,
    monthly_sales = [],
    top_products_qty = [],
    all_vendors = [],
    all_appointments = [],
  } = data;
  const months = monthly_sales.map((d) => d.month);
  const monthRevenues = monthly_sales.map((d) => d.revenue ?? 0);

  const productNames = top_products_qty.map((d) => d.description);
  const productRevenues = top_products_qty.map((d) => d.item_revenue ?? 0);

  const allVendorNames = all_vendors.map((d) => d.vendor_name);
  const allVendorRevenue = all_vendors.map((d) => d.revenue ?? 0);

  const pieChartColors = generatePalette(accentColor, all_vendors.length || 1);

  const allAppointments = all_appointments.map((d) => ({
    vendor_name: d.vendor_name, // Ensure this matches your API key (likely 'vendor_name')
    invoice_date: d.invoice_date           // Ensure this matches your API key (likely 'date' or 'invoice_date')
  }));
  return (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 p-6 w-full overflow-y-scroll h-full overflow-x-hidden">
          
          {/* Cards */}
          <div className="md:col-span-2 bg-secondary rounded-xl p-4 border border-border shadow-sm">
            <h2 className="text-content2 font-bold">Total Revenue</h2>
            <p className="text-4xl font-bold text-accent">
              ${total_revenue.toLocaleString()}
            </p>
          </div>
          <div className="md:col-span-2 bg-secondary rounded-xl p-4 border border-border shadow-sm">
            <h2 className="text-content2 font-bold">Unique Vendors</h2>
            <p className="text-4xl font-bold text-accent">
              {unique_vendors}
            </p>
          </div>
          <div className="md:col-span-2 bg-secondary rounded-xl p-4 border border-border shadow-sm">
            <h2 className="text-content2 font-bold">Status</h2>
            <p className="text-4xl font-bold text-accent">Active</p>
          </div>

          {/* Row 2: Monthly Sales (Big Chart) */}
          <div className="col-span-4 bg-secondary rounded-xl p-4 border border-border shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-content2">Monthly Sales</h2>
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
                font: { color: contentColor },
                xaxis: { showgrid: false },
                yaxis: { 
                  showgrid: true, 
                  gridcolor: borderColor, 
                  zeroline: false, 
                  tickfont: { color: borderColor } 
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
          <CalendarWidget appointments={allAppointments} />
        </div>

          {/* Row 3: Top Vendors Bar Chart */}
          <div className="col-span-3 bg-secondary rounded-xl p-4 border border-border shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-content2">Top Products</h2>
            <Plot
              data={[{
                x: productRevenues,
                y: productNames,
                type: "bar",
                orientation: "h",
                marker: { color: accentColor },
                hovertemplate: "<b>Vendor:</b> %{y}<br><b>Revenue:</b> $%{x:,.0f}<extra></extra>",
              }]}
              layout={{
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: contentColor },
                margin: { t: 20, b: 40, l: 120, r: 20 }, 
                yaxis: { automargin: true },
                height: 350,
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          {/* Row 3: All Vendors Pie Chart */}
          <div className="col-span-3 min-h-100 bg-secondary rounded-xl p-4 border border-border shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-content2">Vendor Share</h2>
            <Plot
              data={[{
                labels: allVendorNames,
                values: allVendorRevenue,
                type: "pie",
                hole: 0.5,
                marker: {
                  colors: pieChartColors, 
                },
                hovertemplate: "<b>%{label}</b><br>Revenue: $%{value:,.0f}<br>Share: %{percent}<extra></extra>",
              }]}
              layout={{
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: contentColor },
                margin: { t: 20, b: 20, l: 20, r: 20 },
                height: 350,
                showlegend: true
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
      </div>
  );
}