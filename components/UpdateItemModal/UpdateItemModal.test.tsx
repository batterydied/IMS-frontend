import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UpdateItemModal from "./UpdateItemModal";

// Standard mock data for the selected item
const mockItem = {
  itemId: "123-abc",
  description: "Graphic Card",
  quantity: "1",
  price: "500.00",
  total: "500.00",
};

describe("UpdateItemModal Component", () => {
  const mockSetSelectedItem = vi.fn();
  const mockUpdateItem = vi.fn();
  const mockDeleteItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes inputs with the selected item's data", () => {
    render(
      <UpdateItemModal
        selectedItem={mockItem}
        setSelectedItem={mockSetSelectedItem}
        updateItem={mockUpdateItem}
        deleteItem={mockDeleteItem}
      />
    );

    expect(screen.getByDisplayValue("Graphic Card")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Price")).toHaveValue("500.00");
    expect(screen.getByPlaceholderText("Total")).toHaveValue("500.00");  });

  it("closes the modal when clicking the background overlay", () => {
    const { container } = render(
      <UpdateItemModal
        selectedItem={mockItem}
        setSelectedItem={mockSetSelectedItem}
        updateItem={mockUpdateItem}
        deleteItem={mockDeleteItem}
      />
    );

    // Click the overlay (outermost div)
    fireEvent.click(container.firstChild as Element);

    expect(mockSetSelectedItem).toHaveBeenCalledWith(null);
  });

  it("does not close when clicking inside the modal form", () => {
    render(
      <UpdateItemModal
        selectedItem={mockItem}
        setSelectedItem={mockSetSelectedItem}
        updateItem={mockUpdateItem}
        deleteItem={mockDeleteItem}
      />
    );

    // Click an input field
    fireEvent.click(screen.getByDisplayValue("Graphic Card"));

    expect(mockSetSelectedItem).not.toHaveBeenCalled();
  });

  it("updates state and calls updateItem with new values", () => {
    render(
      <UpdateItemModal
        selectedItem={mockItem}
        setSelectedItem={mockSetSelectedItem}
        updateItem={mockUpdateItem}
        deleteItem={mockDeleteItem}
      />
    );

    const updateBtn = screen.getByText("Update");

    // 1. Change the Description
    const descInput = screen.getByDisplayValue("Graphic Card");
    fireEvent.change(descInput, { target: { value: "Updated Card" } });

    // 2. Change the Price
    const priceInput = screen.getByPlaceholderText("Price");
    fireEvent.change(priceInput, { target: { value: "600.00" } });

    // 3. Click Update
    fireEvent.click(updateBtn);

    // 4. Verify Payload: ID should match original, data should match new inputs
    expect(mockUpdateItem).toHaveBeenCalledWith({
      itemId: "123-abc", // Persisted ID
      description: "Updated Card",
      quantity: "1", // Unchanged
      price: "600.00",
      total: "500.00", // Unchanged
    });
  });

  it("calls deleteItem with the correct ID", () => {
    render(
      <UpdateItemModal
        selectedItem={mockItem}
        setSelectedItem={mockSetSelectedItem}
        updateItem={mockUpdateItem}
        deleteItem={mockDeleteItem}
      />
    );

    const deleteBtn = screen.getByText("Delete");
    fireEvent.click(deleteBtn);

    expect(mockDeleteItem).toHaveBeenCalledWith("123-abc");
  });

    it("applies disabled styling for invalid inputs", () => {
        render(
        <UpdateItemModal
            selectedItem={mockItem}
            setSelectedItem={mockSetSelectedItem}
            updateItem={mockUpdateItem}
            deleteItem={mockDeleteItem}
        />
        );

        const updateBtn = screen.getByText("Update");

        // 1. Initial state is valid
        expect(updateBtn.className).not.toContain("cursor-not-allowed");

        // 2. Make Invalid: Empty Description
        fireEvent.change(screen.getByDisplayValue("Graphic Card"), { target: { value: "" } });
        expect(updateBtn.className).toContain("cursor-not-allowed");

        // 3. Fix Description, Break Quantity
        fireEvent.change(screen.getByPlaceholderText("Enter description..."), { target: { value: "Fixed" } });
        // Use placeholder for Quantity too, it's safer
        fireEvent.change(screen.getByPlaceholderText("Quantity"), { target: { value: "1.5" } });
        expect(updateBtn.className).toContain("cursor-not-allowed");

        // 4. Fix Quantity, Break Price
        fireEvent.change(screen.getByPlaceholderText("Quantity"), { target: { value: "5" } });
        
        // FIX HERE: Use placeholder "Price" instead of value "500.00"
        fireEvent.change(screen.getByPlaceholderText("Price"), { target: { value: "500.999" } });
        
        expect(updateBtn.className).toContain("cursor-not-allowed");
    });
});