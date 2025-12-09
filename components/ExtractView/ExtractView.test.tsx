import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExtractView } from "./ExtractView";

// --- 1. MOCK CHILD COMPONENTS ---

// Mock InvoiceUploader: Expose buttons to trigger parent state changes
vi.mock("../InvoiceUploader/InvoiceUploader", () => ({
  default: ({ setInvoiceImg, setInvoiceNumber, setVendor }: any) => (
    <div data-testid="mock-uploader">
      <button onClick={() => setInvoiceImg("fake-base64-img")}>Simulate Upload</button>
      <button onClick={() => setInvoiceNumber("INV-123")}>Simulate OCR Number</button>
    </div>
  ),
}));

// Mock ItemModal: Expose a button to "Add" a hardcoded item
vi.mock("../ItemModal/ItemModal", () => ({
  default: ({ addItem, setShouldOpen }: any) => (
    <div data-testid="mock-item-modal">
      <button
        onClick={() =>
          addItem({
            itemId: "1",
            description: "Test Item",
            quantity: "2", // Changed quantity to 2
            price: "50",   // Changed price to 50 (Unique!)
            total: "100",  // Total remains 100
          })
        }
      >
        Confirm Add Item
      </button>
      <button onClick={() => setShouldOpen(false)}>Close</button>
    </div>
  ),
}));
// Mock UpdateItemModal: Expose buttons to Update or Delete
vi.mock("../UpdateItemModal/UpdateItemModal", () => ({
  default: ({ updateItem, deleteItem, selectedItem }: any) => (
    <div data-testid="mock-update-modal">
      <span>Editing: {selectedItem.description}</span>
      <button
        onClick={() =>
          updateItem({ ...selectedItem, description: "Updated Item", total: "200" })
        }
      >
        Confirm Update
      </button>
      <button onClick={() => deleteItem(selectedItem.itemId)}>Confirm Delete</button>
    </div>
  ),
}));

// --- 2. SETUP MOCKS ---
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ExtractView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Environment Variable for LocalStorage key
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_REF", "supabase-auth-token");
    
    // Mock LocalStorage for User ID
    const mockSession = JSON.stringify({ user: { id: "user-123" } });
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockSession);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders initial empty state with disabled button", () => {
    render(<ExtractView />);

    expect(screen.getByText("Extracted Invoice Information")).toBeInTheDocument();
    
    // Inputs should be empty
    expect(screen.getByPlaceholderText("Invoice number")).toHaveValue("");
    expect(screen.getByPlaceholderText("Vendor")).toHaveValue("");
    
    // Button should be disabled (styling check or functionality check)
    const btn = screen.getByText("Push to Dashboard");
    expect(btn).toHaveClass("cursor-not-allowed");
  });

  it("allows manual input of invoice details", () => {
    render(<ExtractView />);

    const numInput = screen.getByPlaceholderText("Invoice number");
    const vendorInput = screen.getByPlaceholderText("Vendor");
    const totalInput = screen.getByPlaceholderText("Total");

    fireEvent.change(numInput, { target: { value: "INV-001" } });
    fireEvent.change(vendorInput, { target: { value: "Amazon" } });
    fireEvent.change(totalInput, { target: { value: "50.00" } });

    expect(numInput).toHaveValue("INV-001");
    expect(vendorInput).toHaveValue("Amazon");
    expect(totalInput).toHaveValue("50.00");
  });
it("opens ItemModal and adds an item to the list", () => {
    render(<ExtractView />);

    // ... (opening the modal logic remains the same) ...
    const itemsHeader = screen.getByText("Items");
    fireEvent.click(itemsHeader.nextElementSibling as Element);
    
    // Click the button in our updated mock
    fireEvent.click(screen.getByText("Confirm Add Item"));

    // ASSERTIONS
    expect(screen.queryByTestId("mock-item-modal")).not.toBeInTheDocument();
    
    // Check for the Description
    expect(screen.getByText("Test Item")).toBeInTheDocument();
    
    // Check for the unique Price (Now "50", so it won't clash)
    expect(screen.getByText("50")).toBeInTheDocument();
    
    // Check for the Total ("100")
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("selects, updates, and deletes an item", () => {
    render(<ExtractView />);

    // --- SETUP: Add an item first (same as above) ---
    const itemsHeader = screen.getByText("Items");
    fireEvent.click(itemsHeader.nextElementSibling as Element);
    fireEvent.click(screen.getByText("Confirm Add Item"));

    // --- TEST SELECTION ---
    const itemRow = screen.getByText("Test Item").closest("li");
    fireEvent.click(itemRow as Element);

    // Update Modal should appear
    expect(screen.getByTestId("mock-update-modal")).toBeInTheDocument();
    expect(screen.getByText("Editing: Test Item")).toBeInTheDocument();

    // --- TEST UPDATE ---
    fireEvent.click(screen.getByText("Confirm Update"));
    // Modal closes, item text changes
    expect(screen.queryByTestId("mock-update-modal")).not.toBeInTheDocument();
    expect(screen.getByText("Updated Item")).toBeInTheDocument();

    // --- TEST DELETE ---
    // Open modal again
    fireEvent.click(screen.getByText("Updated Item").closest("li") as Element);
    fireEvent.click(screen.getByText("Confirm Delete"));

    // List should be empty (header remains, item gone)
    expect(screen.queryByText("Updated Item")).not.toBeInTheDocument();
  });

  it("submits valid data correctly", async () => {
    // Mock a successful API response
    mockFetch.mockResolvedValueOnce({
        json: async () => ({ success: true }),
    });

    render(<ExtractView />);

    // 1. FILL INVOICE INFO
    fireEvent.change(screen.getByPlaceholderText("Invoice number"), { target: { value: "INV-100" } });
    fireEvent.change(screen.getByPlaceholderText("Vendor"), { target: { value: "Acme Corp" } });
    fireEvent.change(screen.getByPlaceholderText("Total"), { target: { value: "100.00" } }); // Matches regex
    
    // 2. FILL DATE (Must match YYYY-MM-DD regex)
    // Assuming the date input is the only type="date"
    const dateInput = document.querySelector('input[type="date"]');
    if(!dateInput) throw new Error("Date input not found");
    fireEvent.change(dateInput, { target: { value: "2023-10-01" } });

    // 3. SIMULATE IMAGE UPLOAD (Required for validation)
    // We click the hidden button in our Mock InvoiceUploader
    fireEvent.click(screen.getByText("Simulate Upload"));

    // 4. ADD AN ITEM (Required for validation: items.length > 0)
    const itemsHeader = screen.getByText("Items");
    fireEvent.click(itemsHeader.nextElementSibling as Element);
    fireEvent.click(screen.getByText("Confirm Add Item"));

    // 5. CLICK CONFIRM BUTTON
    const confirmBtn = screen.getByText("Push to Dashboard");
    
    // Check it's enabled now (class check)
    expect(confirmBtn).not.toHaveClass("cursor-not-allowed");
    
    fireEvent.click(confirmBtn);

    // 6. VERIFY API CALL
    expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/confirm-invoice', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String) // We parse this below to be sure
    }));

    // Verify Body Content
    const callArgs = mockFetch.mock.calls[0]; // [url, options]
    const body = JSON.parse(callArgs[1].body);

    expect(body).toEqual({
        user_id: "user-123", // From mocked localstorage
        invoice: {
            invoice_number: "INV-100",
            vendor_name: "Acme Corp",
            invoice_date: "2023-10-01",
            total_amount: "100.00",
            items: [
                { description: "Test Item", quantity: "2", price: "50" }
            ]
        }
    });
  });
});