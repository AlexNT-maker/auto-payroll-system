import { API_URL } from "../config/api";

const BASE_URL = API_URL;

export interface AttendanceReportItem {
    id: number;
    date: string;
    employee_id: number;
    employee_name: string;
    boat_id: number | null;
    boat_name: string | null;
    is_half_day: boolean;
    overtime_hours: number;
    daily_wage: number;
    overtime_cost: number;
    extra_amount: number;
    extra_reason: string | null;
    total_cost: number;
}

export interface AttendanceReport {
    start: string;
    end: string;
    total: number;
    records: AttendanceReportItem[];
}

export async function getAttendanceReport(
    start: string,
    end: string,
    employeeId?: string
): Promise<AttendanceReport> {
    let url = `${BASE_URL}/attendance-report/?start=${start}&end=${end}`;
    if (employeeId) url += `&employee_id=${employeeId}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch attendance report");
    return res.json();
}