import { store } from "../state/store";

const shortBoatSelect = document.querySelector<HTMLSelectElement>('#short-boat-select')!;
const shortStart = document.querySelector<HTMLInputElement>('#short-start')!;
const shortEnd = document.querySelector<HTMLInputElement>('#short-end')!;
const shortIsCaptain = document.querySelector<HTMLInputElement>('#short-is-captain')!;
const btnPrintShort = document.querySelector<HTMLButtonElement>('#btn-print-short-analysis')!;

export function initShortAnalysisEvents() {
btnPrintShort.addEventListener(
    "click",
    printShortAnalysis
);

shortStart.addEventListener(
    "change",
    syncEndDate
);
}

function syncEndDate() {
       shortEnd.value = shortStart.value;
}

function printShortAnalysis() {
    const boatId = shortBoatSelect.value;
    const start = shortStart.value;
    const end = shortEnd.value;
    
    const isCaptain = shortIsCaptain ? shortIsCaptain.checked : false;

    if (!boatId) {
        alert("Παρακαλώ επιλέξτε σκάφος.");
        return;
    }
    if (!start || !end) {
        alert("Παρακαλώ επιλέξτε ημερομηνίες.");
        return;
    }

    const url = `http://127.0.0.1:8000/boats/${boatId}/short-analysis/pdf?start=${start}&end=${end}&is_captain=${isCaptain}`;
    window.open(url, '_blank');
}

export function initShortAnalysisPage() {
    shortBoatSelect.innerHTML = '<option value="">-- Επιλογή Σκάφους --</option>';
    store.boats.forEach(boat => {
        const opt = document.createElement('option');
        opt.value = boat.id.toString();
        opt.textContent = boat.name;
        shortBoatSelect.appendChild(opt);
    });

    if (!shortStart.value) {
        const now = new Date();
        shortStart.valueAsDate = now;
        shortEnd.valueAsDate = now; 
    }
}