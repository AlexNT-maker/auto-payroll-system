import { store } from "../state/store";
import type { MaterialUsage } from "../models/materialsUsage";

const usageListBody = document.querySelector<HTMLTableSectionElement>("#usage-list")!;
const usageThead = document.querySelector<HTMLTableSectionElement>("#usage-thead")!;

// -- Filter state --
export interface UsageFilters {
    start: string;
    end: string;
    materialId: string;
    category: string;
    boatId: string;
}

export const usageFilters: UsageFilters = {
    start: "",
    end: "",
    materialId: "",
    category: "",
    boatId: "",
};

// -- View mode --
export type UsageView = "detail" | "aggregate";
let currentView: UsageView = "detail";

export function getCurrentView(): UsageView { return currentView; }
export function setCurrentView(v: UsageView): void { currentView = v; }



export function renderMaterialUsagesList(): void {
    
    const filtered = getFilteredUsages();

    renderThead();

    usageListBody.innerHTML = "";

    if (currentView === "detail") {
        renderDetailView(filtered);
    } else {
        renderAggregateView(filtered);
    }

    if (currentView === "detail") {
        usageListBody.appendChild(createAddUsageRow());
    }
}


function getFilteredUsages(): MaterialUsage[] {
    return store.materialUsages.filter((u) => {

        if (usageFilters.start && u.date < usageFilters.start) return false;
        if (usageFilters.end && u.date > usageFilters.end) return false;

        if (usageFilters.materialId && u.material_id !== parseInt(usageFilters.materialId)) return false;

        if (usageFilters.category) {
            const mat = store.materials.find((m) => m.id === u.material_id);
            if (!mat || mat.category !== usageFilters.category) return false;
        }

        if (usageFilters.boatId && u.boat_id !== parseInt(usageFilters.boatId)) return false;

        return true;
    });
}


function renderThead(): void {
    const headers = currentView === "detail"
        ? ["Ημερομηνία", "Υλικό", "Μονάδα", "Κατηγορία", "Ποσότητα", "Παραχωρήθηκε", "Σύνολο", "Ενέργειες"]
        : ["Υλικό", "Μονάδα", "Κατηγορία", "Ποσότητα", "Παραχωρήθηκε"];

    usageThead.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
}


function renderDetailView(usages: MaterialUsage[]): void {
    if (usages.length === 0) {
        usageListBody.innerHTML = `<tr><td colspan="8" class="usage-empty">Δεν βρέθηκαν καταχωρήσεις για τα επιλεγμένα φίλτρα.</td></tr>`;
        return;
    }

    usages.forEach((usage) => {
        usageListBody.appendChild(createLockedUsageRow(usage));
    });
}

function createLockedUsageRow(usage: MaterialUsage): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.classList.add("usage-locked-row");
    row.dataset.id = usage.id.toString();

    const material = store.materials.find((m) => m.id === usage.material_id);
    const boat = store.boats.find((b) => b.id === usage.boat_id);

    row.innerHTML = `
        <td>${formatDate(usage.date)}</td>
        <td>${material?.name ?? "-"}</td>
        <td>${material?.unit ?? "-"}</td>
        <td>${material?.category ?? "-"}</td>
        <td>${usage.quantity}</td>
        <td>${boat?.name ?? "-"}</td>
        <td style="font-weight: 700;">${usage.total_price.toFixed(2)} €</td>
        <td>
            <button class="usage-edit-btn" data-id="${usage.id}">Επεξεργασία</button>
        </td>
    `;

    return row;
}

interface AggregatedRow {
    material_id: number;
    boat_id: number;
    quantity: number;
    total_price: number;
}

function aggregateUsages(usages: MaterialUsage[]): AggregatedRow[] {
    const map = new Map<string, AggregatedRow>();

    usages.forEach((u) => {
        const key = `${u.material_id}-${u.boat_id}`;
        const existing = map.get(key);

        if (existing) {
            existing.quantity += u.quantity;
            existing.total_price += u.total_price;
        } else {
            map.set(key, {
                material_id: u.material_id,
                boat_id: u.boat_id,
                quantity: u.quantity,
                total_price: u.total_price,
            });
        }
    });

    return Array.from(map.values());
}

function renderAggregateView(usages: MaterialUsage[]): void {
    const aggregated = aggregateUsages(usages);

    if (aggregated.length === 0) {
        usageListBody.innerHTML = `<tr><td colspan="5" class="usage-empty">Δεν βρέθηκαν καταχωρήσεις για τα επιλεγμένα φίλτρα.</td></tr>`;
        return;
    }

    aggregated.sort((a, b) => {
        const matA = store.materials.find((m) => m.id === a.material_id)?.name ?? "";
        const matB = store.materials.find((m) => m.id === b.material_id)?.name ?? "";
        if (matA !== matB) return matA.localeCompare(matB, "el");

        const boatA = store.boats.find((boat) => boat.id === a.boat_id)?.name ?? "";
        const boatB = store.boats.find((boat) => boat.id === b.boat_id)?.name ?? "";
        return boatA.localeCompare(boatB, "el");
    });

    aggregated.forEach((agg) => {
        const row = document.createElement("tr");
        row.classList.add("usage-locked-row", "aggregate-row");

        const material = store.materials.find((m) => m.id === agg.material_id);
        const boat = store.boats.find((b) => b.id === agg.boat_id);

        row.innerHTML = `
            <td style="font-weight: 600;">${material?.name ?? "-"}</td>
            <td>${material?.unit ?? "-"}</td>
            <td>${material?.category ?? "-"}</td>
            <td style="font-weight: 700;">${agg.quantity}</td>
            <td>${boat?.name ?? "-"}</td>
        `;
        usageListBody.appendChild(row);
    });
}

export function createUsageFormRow(usage?: MaterialUsage): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.classList.add("usage-form-row");
    if (usage) row.dataset.id = usage.id.toString();

    const today = new Date().toISOString().split("T")[0];
    const dateVal = usage ? usage.date : today;

    const materialOptions = store.materials
        .map((m) => {
            const selected = usage && usage.material_id === m.id ? "selected" : "";
            return `<option value="${m.id}" data-price="${m.price}" data-unit="${m.unit}" data-category="${m.category}" ${selected}>${m.name}</option>`;
        })
        .join("");

    const boatOptions = store.boats
        .map((b) => {
            const selected = usage && usage.boat_id === b.id ? "selected" : "";
            return `<option value="${b.id}" ${selected}>${b.name}</option>`;
        })
        .join("");

    const selectedMaterial = usage
        ? store.materials.find((m) => m.id === usage.material_id)
        : null;

    const unitText = selectedMaterial?.unit ?? "-";
    const quantityVal = usage ? usage.quantity : 0;
    const totalText = usage ? usage.total_price.toFixed(2) + " €" : "0.00 €";

    row.innerHTML = `
        <td><input type="date" class="usage-date" value="${dateVal}"></td>
        <td>
            <select class="usage-material">
                <option value="">-- Επιλογή --</option>
                ${materialOptions}
            </select>
        </td>
        <td><span class="usage-unit">${unitText}</span></td>
        <td><span class="usage-category">${selectedMaterial?.category ?? "-"}</span></td>
        <td><input type="number" class="usage-quantity" step="0.01" value="${quantityVal}"></td>
        <td>
            <select class="usage-boat">
                <option value="">-- Επιλογή --</option>
                ${boatOptions}
            </select>
        </td>
        <td><span class="usage-total">${totalText}</span></td>
        <td>
            <button class="usage-save-btn" type="button">Αποθήκευση</button>
            <button class="usage-cancel-btn" type="button">Άκυρο</button>
        </td>
    `;

    const materialSelect = row.querySelector(".usage-material") as HTMLSelectElement;
    const quantityInput = row.querySelector(".usage-quantity") as HTMLInputElement;
    const priceSpan = row.querySelector(".usage-price") as HTMLSpanElement | null;
    const unitSpan = row.querySelector(".usage-unit") as HTMLSpanElement;
    const categorySpan = row.querySelector(".usage-category") as HTMLSpanElement;
    const totalSpan = row.querySelector(".usage-total") as HTMLSpanElement;

    function updateDerived(): void {
        const opt = materialSelect.selectedOptions[0];
        const price = parseFloat(opt?.dataset.price ?? "0") || 0;
        const unit = opt?.dataset.unit ?? "-";
        const category = opt?.dataset.category ?? "-";

        unitSpan.textContent = materialSelect.value ? unit : "-";
        categorySpan.textContent = materialSelect.value ? category : "-";
        if (priceSpan) priceSpan.textContent = price.toFixed(2) + " €";

        const qty = parseFloat(quantityInput.value) || 0;
        totalSpan.textContent = (price * qty).toFixed(2) + " €";
    }

    materialSelect.addEventListener("change", updateDerived);
    quantityInput.addEventListener("input", updateDerived);

    return row;
}

function createAddUsageRow(): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.className = "add-usage-row";
    row.innerHTML = `
        <td colspan="8">
            <button class="add-usage-btn" type="button">+ Προσθέστε προϊόν</button>
        </td>
    `;
    return row;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
}