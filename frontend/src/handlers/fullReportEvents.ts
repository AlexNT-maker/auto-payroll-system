import { store } from "../state/store";
import { openFullReportPdf } from "../api/fullReportApi";
import { showMessageModal } from "../utils/messageModal";

const boatSelect = document.querySelector<HTMLSelectElement>("#full-rep-boat")!;
const dateStart = document.querySelector<HTMLInputElement>("#full-rep-start")!;
const dateEnd = document.querySelector<HTMLInputElement>("#full-rep-end")!;
const btnExport = document.querySelector<HTMLButtonElement>("#btn-export-full-report")!;


export function initFullReportEvents(): void {
    btnExport.addEventListener("click", handleExport);
}


export function initFullReportPage(): void {
    if (!dateStart.value) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        dateStart.value = toISO(firstDay);
        dateEnd.value = toISO(now);
    }

    // Populate boats
    boatSelect.innerHTML = '<option value="">-- Επιλογή --</option>';
    store.boats.forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b.id.toString();
        opt.textContent = b.name;
        boatSelect.appendChild(opt);
    });
}


function handleExport(): void {
    const boatId = boatSelect.value;
    const start = dateStart.value;
    const end = dateEnd.value;

    if (!boatId) {
        showMessageModal("Προσοχή", "Παρακαλώ επιλέξτε σκάφος.", "warning");
        return;
    }
    if (!start || !end) {
        showMessageModal("Προσοχή", "Παρακαλώ επιλέξτε ημερομηνίες.", "warning");
        return;
    }

    openFullReportPdf(parseInt(boatId), start, end);
}


function toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}