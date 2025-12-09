import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InvoiceItem from "./InvoiceItem";

describe("InvoiceItem Component", () => {
  const mockProps = {
    id: "inv-123",
    vendor_name: "Office Supplies Co.",
    amount: 150.5, // Should format to $150.50
    date: "2023-10-15",
    isSelected: false,
    onToggle: vi.fn(), // Mock function to track calls
  };

  it("renders invoice details correctly", () => {
    render(<InvoiceItem {...mockProps} />);

    // 1. Check Vendor Name
    expect(screen.getByText("Office Supplies Co.")).toBeInTheDocument();

    // 2. Check Date
    expect(screen.getByText("2023-10-15")).toBeInTheDocument();

    // 3. Check Amount Formatting ($ + 2 decimal places)
    expect(screen.getByText("$150.50")).toBeInTheDocument();
  });

  it("reflects the checkbox selection state", () => {
    // Render as Selected
    const { rerender } = render(<InvoiceItem {...mockProps} isSelected={true} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();

    // Re-render as Unselected
    rerender(<InvoiceItem {...mockProps} isSelected={false} />);
    expect(checkbox).not.toBeChecked();
  });

  it("calls onToggle with the correct ID when clicked", () => {
    render(<InvoiceItem {...mockProps} />);

    const checkbox = screen.getByRole("checkbox");

    // Click the checkbox
    fireEvent.click(checkbox);

    // Verify the function was called exactly once with 'inv-123'
    expect(mockProps.onToggle).toHaveBeenCalledTimes(1);
    expect(mockProps.onToggle).toHaveBeenCalledWith("inv-123");
  });
});