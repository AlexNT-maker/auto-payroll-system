import { API_URL } from "../config/api";

const BASE_URL = API_URL;

export interface DashboardData {
    month: string;
    total: number;
    prev_month_total: number;
    breakdown: {
        employees: number;
        materials: number;
        invoices: number;
    };
    daily_trend: {
        date: string;
        payroll: number;
        materials: number;
        invoices: number;
    }[];
    today_status: {
        date: string;
        attendance_recorded: boolean;
    };
    boats_ranking: {
        boat_id: number;
        boat_name: string;
        total: number;
    }[];
}

export async function getDashboardData(month?: string): Promise<DashboardData> {
    const url = month
        ? `${BASE_URL}/dashboard/?target_month=${month}`
        : `${BASE_URL}/dashboard/`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    return res.json();
}