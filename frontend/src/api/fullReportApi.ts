const BASE_URL = "http://127.0.0.1:8000";

export interface FullReportPersonnel {
    name: string;
    days: number;
    ot_hours: number;
}

export interface FullReportMaterial {
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface FullReportSupplier {
    name: string;
    amount: number;
    count: number;
}

export interface FullReportData {
    boat_name: string;
    start_date: string;
    end_date: string;
    personnel: FullReportPersonnel[];
    total_days: number;
    total_ot_hours: number;
    materials: FullReportMaterial[];
    materials_total: number;
    suppliers: FullReportSupplier[];
    suppliers_total: number;
}

export function openFullReportPdf(
    boatId: number,
    start: string,
    end: string
): void {
    const url = `${BASE_URL}/boats/${boatId}/full-report/pdf?start=${start}&end=${end}`;
    window.open(url, "_blank");
}