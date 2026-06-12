import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AttendanceCalendar from "../AttendanceCalendar";
import { useCalendarAttendance } from "@/hooks/api/useAttendance";

// Mock the React Query custom hook
jest.mock("@/hooks/api/useAttendance");

const mockUseCalendarAttendance = useCalendarAttendance as jest.Mock;

describe("AttendanceCalendar Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders loading state correctly", () => {
        mockUseCalendarAttendance.mockReturnValue({
            data: null,
            isLoading: true
        });

        render(<AttendanceCalendar employeeId="emp_123" />);

        expect(screen.getByText(/loading attendance data/i)).toBeInTheDocument();
    });

    test("renders calendar grid and records correctly", () => {
        mockUseCalendarAttendance.mockReturnValue({
            data: {
                month: 6,
                year: 2026,
                records: [
                    {
                        date: "2026-06-01",
                        status: "PRESENT",
                        checkIn: "09:00",
                        checkOut: "17:00",
                        isLate: false,
                        workFormat: "Office"
                    },
                    {
                        date: "2026-06-02",
                        status: "LATE",
                        checkIn: "09:45",
                        checkOut: "18:00",
                        isLate: true,
                        workFormat: "Office"
                    }
                ]
            },
            isLoading: false
        });

        render(<AttendanceCalendar employeeId="emp_123" />);

        // Verify headers, days, etc.
        expect(screen.getByText("Attendance Calendar")).toBeInTheDocument();
        
        // Month name header
        expect(screen.getByText(/June 2026/i)).toBeInTheDocument();

        // Check if weekdays are rendered
        expect(screen.getByText("Sun")).toBeInTheDocument();
        expect(screen.getByText("Mon")).toBeInTheDocument();
    });

    test("handles month navigation and prevents future navigation", () => {
        mockUseCalendarAttendance.mockReturnValue({
            data: {
                month: 6,
                year: 2026,
                records: []
            },
            isLoading: false
        });

        render(<AttendanceCalendar employeeId="emp_123" />);

        const prevButton = screen.getByRole("button", { name: /previous month/i });
        const nextButton = screen.getByRole("button", { name: /next month/i });

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();

        // Next month should be disabled because June 2026 is the future (current system date is June 7, 2026)
        // Let's verify next month's button state or click
        expect(nextButton).toBeDisabled();

        // Go to previous month
        fireEvent.click(prevButton);
        
        // It should request May 2026
        expect(mockUseCalendarAttendance).toHaveBeenLastCalledWith("emp_123", 5, 2026);
    });

    test("renders empty state correctly with weekend detection", () => {
        mockUseCalendarAttendance.mockReturnValue({
            data: {
                month: 6,
                year: 2026,
                records: [
                    // A weekend day with WEEKEND status
                    {
                        date: "2026-06-07",
                        status: "WEEKEND",
                        checkIn: null,
                        checkOut: null
                    }
                ]
            },
            isLoading: false
        });

        render(<AttendanceCalendar employeeId="emp_123" />);

        // June 7, 2026 is Sunday, should show grey/weekend styling or aria label
        const cell = screen.getByRole("gridcell", { name: /Date: 2026-06-07, Status: Weekend/i });
        expect(cell).toBeInTheDocument();
    });
});
