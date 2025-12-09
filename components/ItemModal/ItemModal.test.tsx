import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal";

// 1. Mock UUID to ensure consistent IDs in tests
vi.mock("uuid", () => ({
  v4: () => "mock-uuid-1234",
}));

describe("ItemModal Component", () => {
  const mockSetShouldOpen = vi.fn();
  const mockAddItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("closes when clicking the background overlay", () => {
    const { container } = render(
      <ItemModal setShouldOpen={mockSetShouldOpen} addItem={mockAddItem} />
    );
    
    // The overlay is the outermost div
    // We click the first child of the render container
    fireEvent.click(container.firstChild as Element);
    
    expect(mockSetShouldOpen).toHaveBeenCalledWith(false);
  });

  it("does not close when clicking inside the modal content", () => {
    render(
      <ItemModal setShouldOpen={mockSetShouldOpen} addItem={mockAddItem} />
    );
    
    // Click an input inside the modal
    const quantityInput = screen.getByPlaceholderText("Quantity");
    fireEvent.click(quantityInput); 
    
    // Should NOT have triggered the close function
    expect(mockSetShouldOpen).not.toHaveBeenCalled();
  });

  it("validates inputs and submits valid data", () => {
    render(
      <ItemModal setShouldOpen={mockSetShouldOpen} addItem={mockAddItem} />
    );
    
    const addBtn = screen.getByText("Add");

    // 1. Fill Form with VALID data
    // Description must be non-empty
    fireEvent.change(screen.getByPlaceholderText("Enter description..."), { target: { value: "New Item" } });
    
    // Quantity must be an Integer > 0
    fireEvent.change(screen.getByPlaceholderText("Quantity"), { target: { value: "5" } });
    
    // Price/Total must be regex match (2 decimals max)
    fireEvent.change(screen.getByPlaceholderText("Price"), { target: { value: "20.50" } });
    fireEvent.change(screen.getByPlaceholderText("Total"), { target: { value: "102.50" } });

    // 2. Check that "disabled" styling is removed
    expect(addBtn.className).not.toContain("cursor-not-allowed");

    // 3. Click Add
    fireEvent.click(addBtn);

    // 4. Verify payload passed to addItem
    expect(mockAddItem).toHaveBeenCalledWith({
      itemId: "mock-uuid-1234", // From our mock
      description: "New Item",
      quantity: "5",
      price: "20.50",
      total: "102.50"
    });
  });

  it("shows disabled styling for invalid inputs", () => {
    render(
      <ItemModal setShouldOpen={mockSetShouldOpen} addItem={mockAddItem} />
    );
    const addBtn = screen.getByText("Add");

    // Case 1: All Empty -> Should look disabled
    expect(addBtn.className).toContain("cursor-not-allowed");
    
    // Case 2: Invalid Quantity (Text instead of number)
    fireEvent.change(screen.getByPlaceholderText("Enter description..."), { target: { value: "Item" } });
    fireEvent.change(screen.getByPlaceholderText("Quantity"), { target: { value: "abc" } }); // Invalid
    expect(addBtn.className).toContain("cursor-not-allowed");
    
    // Case 3: Invalid Price (Too many decimals)
    fireEvent.change(screen.getByPlaceholderText("Quantity"), { target: { value: "1" } }); // Fix Qty
    fireEvent.change(screen.getByPlaceholderText("Price"), { target: { value: "10.123" } }); // Invalid regex
    expect(addBtn.className).toContain("cursor-not-allowed");
  });
});