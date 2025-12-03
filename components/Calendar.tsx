"use client";

import { useState } from "react";
import { 
  format, 
  startOfWeek, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO 
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Appointment {
  date: string;  
  title?: string; 
}
interface CalendarWidgetProps {
  appointments?: Appointment[];
}
const CalendarWidget = ({ appointments = [] }: CalendarWidgetProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

  // --- Helpers to navigate months ---
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // --- Check if a specific day has an appointment ---
    const getAppointments = (day: Date) => {
        return appointments.filter((appt) => 
        isSameDay(parseISO(appt.date), day)
        );
    };

  // --- Render the Header (Month Name + Arrows) ---
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-content text-lg font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-muted rounded transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-muted rounded transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  // --- Render Day Names (Mon, Tue, Wed...) ---
  const renderDays = () => {
    const days = [];
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-content text-xs font-medium uppercase text-center py-2">
          {format(addDays(startDate, i), "eee")}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

// --- Render the Actual Dates ---
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    // const monthEnd = endOfMonth(monthStart); // <--- No longer needed for loop limit
    const startDate = startOfWeek(monthStart);

    // FIXED: Force exactly 42 days (6 rows x 7 days) to prevent layout jumping
    // We add 41 because startDate is day 1.
    const endDate = addDays(startDate, 41);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        // 1. Get the actual data for the day
        const dayAppointments = getAppointments(day);
        const hasEvent = dayAppointments.length > 0;

        days.push(
          <div
            key={day.toString()}
            className={`
            relative group flex flex-col items-center justify-center h-14 w-full cursor-pointer rounded-lg transition
            ${!isCurrentMonth ? "text-content/40" : " text-content"}
            ${isSelected ? "bg-muted" : "hover:bg-muted/40"}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            {/* Date Number */}
            <span
              className={`text-sm z-10 ${
                isToday
                  ? "bg-accent text-content w-7 h-7 flex items-center justify-center rounded-full"
                  : ""
              }`}
            >
              {formattedDate}
            </span>

            {/* Blue Bar Indicator */}
            {hasEvent && (
              <div className="absolute bottom-2 w-5 h-1 rounded-full bg-accent mt-1"></div>
            )}

            {/* --- HOVER TOOLTIP --- */}
            {hasEvent && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max hidden group-hover:block z-50">
                <div className="bg-accent text-content text-xs rounded py-1 px-1 shadow-xl border border-border">
                  {dayAppointments.map((appt, idx) => (
                    <div key={idx} className="whitespace-nowrap">
                      {appt.title}
                    </div>
                  ))}
                </div>
                {/* Little Triangle Arrow pointing down */}
                <div className="w-2 h-2 bg-muted border-r border-b border-gray-600 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

    
  return (
    <div className="w-full 'bg-transparent' rounded-xl">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarWidget;