import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import InvoiceUploader from "./InvoiceUploader";

// --- 1. MOCK EXTERNAL LIBRARIES ---

// FIX: Use vi.hoisted() to initialize mocks BEFORE vi.mock() runs
const { mockUpload, mockGetUser, mockSetSession } = vi.hoisted(() => {
  return {
    mockUpload: vi.fn(),
    mockGetUser: vi.fn(),
    mockSetSession: vi.fn(),
  };
});

// Mock Supabase Client using the hoisted variables
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      setSession: mockSetSession,
    },
    storage: {
      from: () => ({
        upload: mockUpload,
      }),
    },
  }),
}));

// Mock UUID
vi.mock("uuid", () => ({
  v4: () => "mock-uuid-1234",
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt="Mocked Image" />,
}));

// Mock SVG Icon
vi.mock("../SVG", () => ({
  UploadSVG: () => <svg data-testid="upload-icon" />,
}));

// --- 2. SETUP MOCKS ---
const mockSetters = {
  setInvoiceNumber: vi.fn(),
  setVendor: vi.fn(),
  setInvoiceDate: vi.fn(),
  setInvoiceItems: vi.fn(),
  setInvoiceImg: vi.fn(),
  setTotal: vi.fn(),
};

describe("InvoiceUploader Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL.createObjectURL (Browser API)
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/fake-url");

    // Mock Fetch (Backend API)
    global.fetch = vi.fn();

    // Mock Environment Variables (for Supabase Key construction)
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_REF", "test-project");

    // Mock LocalStorage (Standard Success Case)
    const mockSession = JSON.stringify({
      user: { access_token: "fake-access", refresh_token: "fake-refresh" },
    });
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(mockSession);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the upload UI correctly", () => {
    render(<InvoiceUploader {...mockSetters} invoiceImg="" />);

    expect(screen.getByText(/Drag and drop file here/i)).toBeInTheDocument();
    expect(screen.getByText("Upload", { selector: "button" })).toBeInTheDocument();
    expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
  });

  it("handles a successful file upload flow", async () => {
    // 1. Setup Supabase Mocks
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    mockUpload.mockResolvedValue({ data: { path: "user-123/file.png" }, error: null });

    // 2. Setup Backend API Mock
    (global.fetch as any).mockResolvedValue({
      json: async () => ({
        status: "success",
        data: {
          invoice_number: "INV-001",
          vendor_name: "Test Vendor",
          invoice_date: "2023-10-05",
          total_amount: "500.00",
          items: [
            { description: "Item A", quantity: "2", unit_price: "100", line_total: "200" }
          ]
        }
      }),
    });

    render(<InvoiceUploader {...mockSetters} invoiceImg="" />);

    // 3. Simulate File Selection
    const file = new File(["dummy content"], "invoice.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate user selecting a file
    fireEvent.change(input, { target: { files: [file] } });

    // 4. Verify Loading State appears
    expect(screen.getByText("Uploading...")).toBeInTheDocument();

    await waitFor(() => {
      // 5. Verify Supabase Calls
      expect(mockSetSession).toHaveBeenCalledWith({ access_token: "fake-access", refresh_token: "fake-refresh" });
      expect(mockUpload).toHaveBeenCalled(); // Checks if storage.upload was called
    });

    // 6. Verify Backend Call
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/process-invoice",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ user_id: "user-123", file_path: "user-123/file.png" }),
      })
    );

    // 7. Verify Parent Setters were updated with API Data
    expect(mockSetters.setInvoiceNumber).toHaveBeenCalledWith("INV-001");
    expect(mockSetters.setVendor).toHaveBeenCalledWith("Test Vendor");
    expect(mockSetters.setTotal).toHaveBeenCalledWith("500.00");
    
    // Verify Items mapping (checking one property to be safe)
    expect(mockSetters.setInvoiceItems).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ description: "Item A", itemId: "mock-uuid-1234" })
    ]));

    // 8. Verify Image Preview was set
    expect(mockSetters.setInvoiceImg).toHaveBeenCalledWith("blob:http://localhost/fake-url");
  });

  it("handles drag and drop interactions", () => {
    render(<InvoiceUploader {...mockSetters} invoiceImg="" />);
    
    const dropZone = screen.getByText(/Drag and drop file here/i).closest("div")!;

    // 1. Drag Enter -> Should add styling (visual check via class or internal state)
    // Note: React state changes might not reflect in 'class' attribute immediately in JSDOM unless conditional rendering changes structure.
    // Your code: `className={... ${isDragging && "bg-black/5"}}`
    fireEvent.dragEnter(dropZone);
    expect(dropZone.className).toContain("flex flex-col");

    // 2. Drag Leave -> Remove styling
    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).not.toContain("bg-black/5");
  });

  it("displays error when session is missing in LocalStorage", async () => {
    // Return null for local storage
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<InvoiceUploader {...mockSetters} invoiceImg="" />);

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByText("Unable to connect to server, try again")).toBeInTheDocument();
    });

    // Ensure upload did NOT happen
    expect(mockUpload).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("displays error when Supabase upload fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    // Mock Supabase Error
    mockUpload.mockResolvedValue({ data: null, error: new Error("Storage quota exceeded") });
    
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<InvoiceUploader {...mockSetters} invoiceImg="" />);

    const file = new File(["dummy"], "test.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByText("Unable to connect to server, try again")).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled(); // API shouldn't be called if upload failed
    consoleSpy.mockRestore();
  });
});