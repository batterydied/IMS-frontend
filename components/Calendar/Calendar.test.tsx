import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import CalendarWidget from "./Calendar";

// Mock Data matching the shape used in your component
const mockAppointments = [
  {
    invoice_date: "2023-10-15T10:00:00Z", // Middle of the month
    vendor_name: "Acme Supplies",
  },
  {
    invoice_date: "2023-10-15T14:00:00Z", // Same day, different appt
    vendor_name: "Tech Corp",
  },
  {
    invoice_date: "2023-10-20T09:00:00Z", // Different day
    vendor_name: "Clean Co",
  },
];

describe("CalendarWidget", () => {
  // 1. FREEZE TIME
  // We set the "current date" to Oct 1st, 2023. 
  // This ensures consistent results regardless of when you run the test.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-10-01"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the current month and year correctly", () => {
    render(<CalendarWidget appointments={[]} />);
    
    // Should show "October 2023" based on our frozen time
    expect(screen.getByText("October 2023")).toBeInTheDocument();
  });

  it("navigates to the next and previous months", () => {
    render(<CalendarWidget appointments={[]} />);

    // Get buttons (Prev is first, Next is second based on DOM order)
    const buttons = screen.getAllByRole("button");
    const prevBtn = buttons[0];
    const nextBtn = buttons[1];

    // 1. Click Next -> November
    fireEvent.click(nextBtn);
    expect(screen.getByText("November 2023")).toBeInTheDocument();

    // 2. Click Prev -> Back to October
    fireEvent.click(prevBtn);
    expect(screen.getByText("October 2023")).toBeInTheDocument();

    // 3. Click Prev again -> September
    fireEvent.click(prevBtn);
    expect(screen.getByText("September 2023")).toBeInTheDocument();
  });

  it("renders indicators for days with appointments", () => {
    render(<CalendarWidget appointments={mockAppointments} />);

    // Find the cell for the 15th
    // Note: We look for text "15" that has the specific date class structure
    // Since "15" might appear in adjacent months, strict testing might require more specificity,
    // but for this unit test, finding the visible "15" is usually sufficient.
    const day15 = screen.getByText("15").closest("div"); 
    
    // Check if the indicator bar exists inside this day
    // Your code renders: <div className="absolute bottom-2 w-5 h-1... bg-accent"></div>
    // We can check if the day container has a child with that specific styling logic 
    // or simply check if the day is rendered.
    // A better way given your code structure is to query inside the day element:
    
    // The indicator is an empty div, so we can't find it by text. 
    // We can rely on the fact that your component only renders that specific div if hasEvent is true.
    // Let's check the HTML structure or class presence.
    expect(day15?.innerHTML).toContain("bg-accent"); 
  });

  it("shows tooltip with vendor name on hover", () => {
    render(<CalendarWidget appointments={mockAppointments} />);

    // 1. Find the element for the 15th
    const day15Text = screen.getByText("15");
    const day15Container = day15Text.closest("div");

    if (!day15Container) throw new Error("Day 15 not found");

    // 2. Tooltip is usually hidden/renders conditionally. 
    // Your code renders the tooltip in the DOM but hides it via CSS (group-hover:block) 
    // or logic. Actually, looking at your code:
    // {hasEvent && (<div className="... group-hover:block ..."> ... </div>)}
    // It IS in the DOM, just hidden visually. RTL can still see it.

    expect(screen.getByText("Acme Supplies")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    
    // 3. Verify it is associated with the correct day (Contextual check)
    // We simulate a hover just to be thorough, though RTL mostly cares if it exists in DOM.
    fireEvent.mouseOver(day15Container);
    
    // Ensure "Clean Co" (on the 20th) is NOT inside the 15th's container
    expect(day15Container.innerHTML).not.toContain("Clean Co");
  });

  it("highlights the selected date on click", () => {
    render(<CalendarWidget appointments={[]} />);

    // FIX: Use getAllByText and grab the first one [0]
    // This selects October 10th, ignoring November 10th which is at the end of the grid
    const allTens = screen.getAllByText("10");
    const day10Text = allTens[0]; 
    
    const day10Container = day10Text.closest("div");
    
    if (!day10Container) throw new Error("Day 10 not found");

    fireEvent.click(day10Container);

    // 2. Check for the "bg-muted" class
    expect(day10Container.className).toContain("bg-muted");
    
    // FIX: Same logic for the 11th (October 11 vs November 11)
    const allElevens = screen.getAllByText("11");
    const day11Container = allElevens[0].closest("div");

    if (!day11Container) throw new Error("Day 11 not found");
    
    fireEvent.click(day11Container);
    
    expect(day11Container.className).toContain("bg-muted");
  });
});