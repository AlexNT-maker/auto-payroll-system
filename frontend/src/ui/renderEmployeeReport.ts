import type { AttendanceReportItem } from "../api/employeeReportApi";

const theadEl = document.getElementById("emp-rep-thead")!;
const listEl = document.getElementById("emp-rep-list")!;

export type ReportView = "detail" | "aggregate";
let currentView: ReportView = "detail";

export function setReportView(v: ReportView): void { currentView = v; }
export function getReportView(): ReportView { return currentView; }


export function renderEmployeeReport(records: AttendanceReportItem[]): void {
    renderThead();
    listEl.innerHTML = "";

    if (records.length === 0) {
        const cols = currentView === "detail" ? 7 : 7;
        listEl.innerHTML = `<tr><td colspan="${cols}" class="usage-empty">Δεν βρέθηκαν εγγραφές για τα επιλεγμένα φίλτρα.</td></tr>`;
        return;
    }

    if (currentView === "detail") {
        renderDetail(records);
    } else {
        renderAggregate(records);
    }
}


function renderThead(): void {
    if (currentView === "detail") {
        theadEl.innerHTML = `
            <tr>
                <th>Ημερομηνία</th>
                <th>Εργαζόμενος</th>
                <th>Σκάφος</th>
                <th>Μισθός</th>
                <th>Υπερωρία</th>
                <th>Πρόσθετα</th>
                <th>Σύνολο</th>
            </tr>
        `;
    } else {
        theadEl.innerHTML = `
            <tr>
                <th>Εργαζόμενος</th>
                <th>Μεροκάματα</th>
                <th>Μισθός</th>
                <th>Ώρες Υπ.</th>
                <th>Υπερωρία</th>
                <th>Πρόσθετα</th>
                <th>Σύνολο</th>
            </tr>
        `;
    }
}


function renderDetail(records: AttendanceReportItem[]): void {
    records.forEach((r) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${formatDate(r.date)}</td>
            <td>${r.employee_name}</td>
            <td>${r.boat_name ?? "-"}</td>
            <td>${r.daily_wage.toFixed(2)} €</td>
            <td>${r.overtime_cost.toFixed(2)} €</td>
            <td>${r.extra_amount > 0 ? r.extra_amount.toFixed(2) + " €" : "-"}</td>
            <td style="font-weight:700;">${r.total_cost.toFixed(2)} €</td>
        `;
        listEl.appendChild(row);
    });
}


interface AggregateRow {
    employee_id: number;
    employee_name: string;
    days: number;
    wage: number;
    ot_hours: number;
    overtime: number;
    extra: number;
    total: number;
}

function renderAggregate(records: AttendanceReportItem[]): void {
    const map = new Map<number, AggregateRow>();

    records.forEach((r) => {
        let agg = map.get(r.employee_id);
        if (!agg) {
            agg = {
                employee_id: r.employee_id,
                employee_name: r.employee_name,
                days: 0,
                wage: 0,
                ot_hours: 0,
                overtime: 0,
                extra: 0,
                total: 0,
            };
            map.set(r.employee_id, agg);
        }

        if (r.daily_wage > 0) {
            agg.days += r.is_half_day ? 0.5 : 1.0;
        }
        agg.wage += r.daily_wage;
        agg.ot_hours += r.overtime_hours;
        agg.overtime += r.overtime_cost;
        agg.extra += r.extra_amount;
        agg.total += r.total_cost;
    });

    const rows = Array.from(map.values()).sort((a, b) =>
        a.employee_name.localeCompare(b.employee_name, "el")
    );

    rows.forEach((a) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="font-weight:600;">${a.employee_name}</td>
            <td>${a.days}</td>
            <td>${a.wage.toFixed(2)} €</td>
            <td>${a.ot_hours.toFixed(1)}</td>
            <td>${a.overtime.toFixed(2)} €</td>
            <td>${a.extra > 0 ? a.extra.toFixed(2) + " €" : "-"}</td>
            <td style="font-weight:700;">${a.total.toFixed(2)} €</td>
        `;
        listEl.appendChild(row);
    });
}


function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
}