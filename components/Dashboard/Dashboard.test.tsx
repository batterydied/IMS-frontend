import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import Dashboard from "./Dashboard";

// --- 1. MOCK AXIOS ---
// We mock axios so we don't hit the real API
vi.mock("axios");

// --- 2. MOCK PLOTLY ---
// Plotly is hard to render in tests (Canvas/WebGL). 
// We replace it with a simple dummy component that prints the data it received.
vi.mock("react-plotly.js", () => ({
  default: ({ data, layout }: any) => (
    <div data-testid="mock-plot">
      Mock Plot
      <span data-testid="plot-data">{JSON.stringify(data)}</span>
    </div>
  ),
}));

// --- 3. MOCK CALENDAR WIDGET ---
// We already tested CalendarWidget separately. 
// Mocking it here simplifies the Dashboard test.
vi.mock("@/components/Calendar/Calendar", () => ({
  default: ({ appointments }: any) => (
    <div data-testid="mock-calendar">
      Mock Calendar with {appointments.length} appointments
    </div>
  ),
}));

// Sample Mock Data
const mockDashboardData = {
  total_revenue: 50000,
  unique_vendors: 12,
  monthly_sales: [
    { month: "Jan", revenue: 1000 },
    { month: "Feb", revenue: 2000 },
  ],
  top_products_qty: [
    { description: "Widget A", item_revenue: 500 },
  ],
  all_vendors: [
    { vendor_name: "Vendor 1", revenue: 300 },
    { vendor_name: "Vendor 2", revenue: 200 },
  ],
  all_appointments: [
    { vendor_name: "Vendor 1", invoice_date: "2023-10-01" },
  ],
};

describe("Dashboard Component", () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock getComputedStyle for CSS variables
    // This prevents errors when the component tries to read --accent, etc.
    Object.defineProperty(window, 'getComputedStyle', {
        value: () => ({
          getPropertyValue: (prop: string) => {
            if (prop === '--accent') return '#008080';
            if (prop === '--border') return '#888888';
            if (prop === '--content2') return '#000000';
            return '';
          }
        })
      });
  });

  it("shows loading state initially", async () => {
    // Make the promise never resolve instantly to catch the loading state
    (axios.get as any).mockImplementation(() => new Promise(() => {}));

    render(<Dashboard isCollapsed={false} />);
    
    expect(screen.getByText(/Loading data.../i)).toBeInTheDocument();
  });

  it("renders dashboard data after successful fetch", async () => {
    // Mock successful response
    (axios.get as any).mockResolvedValue({ data: mockDashboardData });

    render(<Dashboard isCollapsed={false} />);

    // 1. Wait for loading to vanish and data to appear
    await waitFor(() => {
        expect(screen.queryByText(/Loading data.../i)).not.toBeInTheDocument();
    });

    // 2. Check "Cards" data
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("$50,000")).toBeInTheDocument();
    
    expect(screen.getByText("Unique Vendors")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    // 3. Check Status
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("passes correct data to the Charts (Plotly)", async () => {
    (axios.get as any).mockResolvedValue({ data: mockDashboardData });

    render(<Dashboard isCollapsed={false} />);

    await waitFor(() => {
        expect(screen.queryByText(/Loading data.../i)).not.toBeInTheDocument();
    });

    // Get all mock plots
    const plots = screen.getAllByTestId("mock-plot");
    // You have 3 plots: Monthly Sales, Top Products, Vendor Share
    expect(plots).toHaveLength(3);

    // -- Test Monthly Sales Chart (First Plot) --
    // We check if the JSON data string contains our mock values
    const monthlySalesData = plots[0].textContent;
    expect(monthlySalesData).toContain('"x":["Jan","Feb"]');
    expect(monthlySalesData).toContain('"y":[1000,2000]');

    // -- Test Top Products Chart (Second Plot) --
    const productData = plots[1].textContent;
    expect(productData).toContain('"y":["Widget A"]');
    expect(productData).toContain('"x":[500]');
  });

  it("passes correct data to the CalendarWidget", async () => {
    (axios.get as any).mockResolvedValue({ data: mockDashboardData });

    render(<Dashboard isCollapsed={false} />);

    await waitFor(() => {
        expect(screen.getByTestId("mock-calendar")).toBeInTheDocument();
    });

    // Check if the mock calendar received the appointments
    expect(screen.getByTestId("mock-calendar")).toHaveTextContent(
        "Mock Calendar with 1 appointments"
    );
  });

  it("handles API errors gracefully", async () => {
    // Mock an error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (axios.get as any).mockRejectedValue(new Error("Network Error"));

    render(<Dashboard isCollapsed={false} />);

    // Wait for the fetch attempt
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Since your component stays in "Loading..." state on error (based on your code: `if (!data) return ...`),
    // we verify it is still loading or check if you add error handling UI later.
    expect(screen.getByText(/Loading data.../i)).toBeInTheDocument();
    
    // Optional: Check if error was logged
    expect(consoleSpy).toHaveBeenCalledWith("Error fetching dashboard data:", expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});