import { store } from "../state/store";
import { getAttendanceReport } from "../api/employeeReportApi";
import {
    renderEmployeeReport,
    setReportView,
} from "../ui/renderEmployeeReport"
import { showMessageModal } from "../utils/messageModal";

const filterStart = document.getElementById("emp-rep-filter-start") as HTMLInputElement;
const filterEnd = document.getElementById("emp-rep-filter-end") as HTMLInputElement;
const filterEmp = document.getElementById("emp-rep-filter-employee") as HTMLSelectElement;
const filterClear = document.getElementById("emp-rep-filter-clear") as HTMLButtonElement;
const toggle = document.getElementById("emp-rep-view-toggle") as HTMLDivElement;

let initialized = false;

export function initEmployeeReportEvents(): void {
    if (initialized) {
        handleFilterChange();
        return;
    }

    filterStart.addEventListener("change", handleFilterChange);
    filterEnd.addEventListener("change", handleFilterChange);
    filterEmp.addEventListener("change", handleFilterChange);
    filterClear.addEventListener("click", handleClear);

    toggle.querySelectorAll<HTMLButtonElement>("button").forEach((btn) => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view as "detail" | "aggregate";
            setReportView(view);

            toggle.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            handleFilterChange();
        });
    });

    initFilters();
    initialized = true;
}


function initFilters(): void {
    if (!filterStart.value) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        filterStart.value = toISO(firstDay);
        filterEnd.value = toISO(now);
    }

    // Populate employee dropdown
    filterEmp.innerHTML = '<option value="">Όλοι</option>';
    store.employees.forEach((e) => {
        const opt = document.createElement("option");
        opt.value = e.id.toString();
        opt.textContent = e.name;
        filterEmp.appendChild(opt);
    });

    handleFilterChange();
}


async function handleFilterChange(): Promise<void> {
    const start = filterStart.value;
    const end = filterEnd.value;

    if (!start || !end) {
        return;
    }

    try {
        const data = await getAttendanceReport(start, end, filterEmp.value);
        renderEmployeeReport(data.records);
    } catch (err) {
        console.error(err);
        showMessageModal("Σφάλμα", "Πρόβλημα κατά τη φόρτωση.", "error");
    }
}


function handleClear(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    filterStart.value = toISO(firstDay);
    filterEnd.value = toISO(now);
    filterEmp.value = "";

    handleFilterChange();
}


function toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}