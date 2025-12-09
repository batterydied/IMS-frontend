import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import InvoiceList from "./InvoiceList";

// --- 1. MOCK CHILD COMPONENT ---
// We mock InvoiceItem to make selecting checkboxes easier in tests.
// We expose the 'onToggle' prop via the input's onChange event.
vi.mock("../InvoiceItem/InvoiceItem", () => ({
  default: ({ vendor_name, onToggle, id, isSelected }: any) => (
    <div data-testid="invoice-item">
      <span>{vendor_name}</span>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(id)}
        aria-label={`Select ${vendor_name}`}
      />
    </div>
  ),
}));

// --- 2. MOCK DATA ---
const mockInvoices = [
  { id: "1", vendor_name: "Amazon", invoice_date: "2023-10-01", total_amount: 100 },
  { id: "2", vendor_name: "Google", invoice_date: "2023-10-05", total_amount: 250 },
  { id: "3", vendor_name: "Azure", invoice_date: "2023-10-10", total_amount: 500 },
];

describe("InvoiceList Component", () => {
  const mockFetch = vi.fn();
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Stub Global Fetch
    global.fetch = mockFetch;
    
    // Stub URL.createObjectURL (Browser API not in JSDOM)
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and displays the list of invoices on mount", async () => {
    // Mock the GET request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvoices,
    });

    render(<InvoiceList />);

    // Wait for the data to load
    await waitFor(() => {
        expect(screen.getByText("Amazon")).toBeInTheDocument();
    });

    // Check all items are present
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("Azure")).toBeInTheDocument();

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith("http://127.0.0.1:5000/api/all-invoices", {
      cache: "no-store",
    });
  });

  it("filters the invoice list when searching", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvoices,
    });

    render(<InvoiceList />);
    await waitFor(() => expect(screen.getByText("Amazon")).toBeInTheDocument());

    // 1. Search for "Goog"
    const searchInput = screen.getByPlaceholderText("Search invoices...");
    fireEvent.change(searchInput, { target: { value: "Goog" } });

    // 2. Google should remain, Amazon should disappear
    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.queryByText("Amazon")).not.toBeInTheDocument();
  });

  it("toggles invoice selection and updates the export button", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvoices,
    });

    render(<InvoiceList />);
    await waitFor(() => expect(screen.getByText("Amazon")).toBeInTheDocument());

    const exportBtn = screen.getByText(/Export CSV/);

    // Initial State: Button disabled
    expect(exportBtn).toBeDisabled();

    // 1. Select Amazon
    const amazonCheckbox = screen.getByLabelText("Select Amazon");
    fireEvent.click(amazonCheckbox);

    // Button enabled, count is 1
    expect(exportBtn).not.toBeDisabled();
    expect(screen.getByText("(1)")).toBeInTheDocument();

    // 2. Select Google
    const googleCheckbox = screen.getByLabelText("Select Google");
    fireEvent.click(googleCheckbox);
    expect(screen.getByText("(2)")).toBeInTheDocument();

    // 3. Deselect Amazon
    fireEvent.click(amazonCheckbox);
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("handles the CSV export process correctly", async () => {
    // --- Step A: Setup Initial Render ---
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvoices,
    });

    render(<InvoiceList />);
    await waitFor(() => expect(screen.getByText("Amazon")).toBeInTheDocument());

    // --- Step B: Select an item ("Amazon", id: "1") ---
    fireEvent.click(screen.getByLabelText("Select Amazon"));

    // --- Step C: Mock the Export API Response ---
    // The component makes a second fetch call to 'api/invoices-by-id'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: "1", vendor_name: "Amazon", details: "Full Export Data" }
      ],
    });

    // --- Step D: Spy on the Anchor Link Creation ---
    // We need to intercept document.createElement to verify the download link is clicked
    const linkClickSpy = vi.fn();
    const mockLink = { 
        href: "", 
        setAttribute: vi.fn(), 
        click: linkClickSpy, 
        remove: vi.fn() // Used in document.body.removeChild
    } as unknown as HTMLAnchorElement;

    // We only want to mock 'createElement' for 'a' tags, but simpler is just to return our mock
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

    // --- Step E: Click Export ---
    fireEvent.click(screen.getByText(/Export CSV/));

    // --- Step F: Assertions ---
    await waitFor(() => {
        // 1. Verify the POST request was sent with the correct ID
        expect(mockFetch).toHaveBeenCalledWith("http://127.0.0.1:5000/api/invoices-by-id", 
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: ["1"] })
            })
        );
    });

    // 2. Verify Blob URL was created (CSV generation happened)
    expect(mockCreateObjectURL).toHaveBeenCalled();

    // 3. Verify the link was set up and clicked
    expect(mockLink.setAttribute).toHaveBeenCalledWith("download", "full_export.csv");
    expect(linkClickSpy).toHaveBeenCalled(); // THIS confirms the file would download in a real browser

    // Cleanup spies
    createElementSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});