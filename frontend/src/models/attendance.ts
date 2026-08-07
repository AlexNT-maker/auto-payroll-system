export interface AttendanceRecord {
    employee_id: number;
    boat_id: number | null;
    overtime_boat_id: number | null;
    present: boolean;
    is_half_day: boolean;
    overtime_hours: number;
}