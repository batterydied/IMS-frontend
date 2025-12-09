import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sidebar } from "./Sidebar";

// Mock SVG components since they are imported from a separate file
vi.mock("../SVG", () => ({
  MenuSVG: () => <svg data-testid="menu-icon" />,
  LogOutSVG: () => <svg data-testid="logout-icon" />,
}));

describe("Sidebar Component", () => {
  // Mock handler functions
  const mockHandleToggle = vi.fn();
  const mockHandleSelectView = vi.fn();
  const mockHandleSignOut = vi.fn();

  // Reset mocks before every test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly in expanded state", () => {
    render(
      <Sidebar
        isCollapsed={false}
        handleToggle={mockHandleToggle}
        handleSelectView={mockHandleSelectView}
        handleSignOut={mockHandleSignOut}
      />
    );

    // 1. Check for navigation links
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("Extraction")).toBeInTheDocument();

    // 2. Check for Icons
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
    expect(screen.getByTestId("logout-icon")).toBeInTheDocument();

    // 3. Check container width (Expanded = w-[250px])
    // We find the container by looking for a parent of "Dashboard"
    const menuContainer = screen.getByText("Dashboard").closest("div.transition-all");
    expect(menuContainer).toHaveClass("w-[250px]");
    expect(menuContainer).not.toHaveClass("w-0");
  });

  it("applies collapsed styling when isCollapsed is true", () => {
    render(
      <Sidebar
        isCollapsed={true} // <--- Setting to TRUE
        handleToggle={mockHandleToggle}
        handleSelectView={mockHandleSelectView}
        handleSignOut={mockHandleSignOut}
      />
    );

    // Find the container again
    const menuContainer = screen.getByText("Dashboard").closest("div.transition-all");
    
    // 1. Check collapsed classes
    expect(menuContainer).toHaveClass("w-0");
    expect(menuContainer).toHaveClass("!p-0");
    
    // 2. Check opacity class on the inner wrapper
    const innerWrapper = screen.getByText("Dashboard").closest("div.transition-opacity");
    expect(innerWrapper).toHaveClass("opacity-0");
  });

  it("calls handleToggle when the menu icon is clicked", () => {
    render(
      <Sidebar
        isCollapsed={false}
        handleToggle={mockHandleToggle}
        handleSelectView={mockHandleSelectView}
        handleSignOut={mockHandleSignOut}
      />
    );

    // Click the menu icon container
    const menuIcon = screen.getByTestId("menu-icon");
    // The onClick is on the parent div of the SVG
    fireEvent.click(menuIcon.parentElement!);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
  });

  it("calls handleSelectView with correct arguments when links are clicked", () => {
    render(
      <Sidebar
        isCollapsed={false}
        handleToggle={mockHandleToggle}
        handleSelectView={mockHandleSelectView}
        handleSignOut={mockHandleSignOut}
      />
    );

    // 1. Click Dashboard
    fireEvent.click(screen.getByText("Dashboard"));
    expect(mockHandleSelectView).toHaveBeenCalledWith("dashboard");

    // 2. Click Invoices
    fireEvent.click(screen.getByText("Invoices"));
    expect(mockHandleSelectView).toHaveBeenCalledWith("search");

    // 3. Click Extraction
    fireEvent.click(screen.getByText("Extraction"));
    expect(mockHandleSelectView).toHaveBeenCalledWith("extract");
  });

  it("calls handleSignOut when the sign out button is clicked", () => {
    render(
      <Sidebar
        isCollapsed={false}
        handleToggle={mockHandleToggle}
        handleSelectView={mockHandleSelectView}
        handleSignOut={mockHandleSignOut}
      />
    );

    // Find button by text (it contains the text "Sign Out")
    const signOutBtn = screen.getByText("Sign Out", { selector: "button" });
    fireEvent.click(signOutBtn);

    expect(mockHandleSignOut).toHaveBeenCalledTimes(1);
  });
});