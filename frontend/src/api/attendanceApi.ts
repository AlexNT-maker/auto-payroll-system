import { API_URL } from "../config/api";

export async function loadAttendance(date: string) {
    const response = await fetch(`${API_URL}/attendance/${date}`); 

    if (!response.ok) {
        throw new Error("Failed to load attendance");
    }

    return response.json();
}

export interface LastAttendanceItem {
    employee_id: number;
    boat_id: number | null;
    present: boolean;
    is_half_day: boolean;
}

export interface LastAttendanceResponse {
    date: string;
    records: LastAttendanceItem[];
}

export async function getLastAttendanceBefore(
    targetDate: string
): Promise<LastAttendanceResponse> {
    const response = await fetch(
        `${API_URL}/attendance/last-before/${targetDate}`
    );
    if (!response.ok) throw new Error("Failed to fetch last attendance");
    return response.json();
}