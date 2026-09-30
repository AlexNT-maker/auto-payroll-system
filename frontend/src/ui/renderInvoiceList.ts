import { store } from "../state/store";
import type { Invoice } from "../models/invoice";

const invoiceListBody = document.querySelector<HTMLTableSectionElement>("#invoices-list")!;
const invoiceThead = document.querySelector<HTMLTableSectionElement>("#invoices-thead")!;

// -- Filter state --
export interface InvoiceFilters {
    start: string;
    end: string;
    supplierId: string;
    boatId: string;
}

export const invoiceFilters: InvoiceFilters = {
    start: "",
    end: "",
    supplierId: "",
    boatId: "",
};

// -- View mode --
export type InvoiceView = "detail" | "aggregate";
let currentView: InvoiceView = "detail";

export function setInvoiceView(v: InvoiceView): void { currentView = v; }


export function renderInvoicesList(): void {
    const filtered = getFilteredInvoices();
    renderThead();
    invoiceListBody.innerHTML = "";

    if (currentView === "detail") {
        renderDetailView(filtered);
        invoiceListBody.appendChild(createAddInvoiceRow());
    } else {
        renderAggregateView(filtered);
    }
}


function getFilteredInvoices(): Invoice[] {
    return store.invoices.filter((inv) => {
        if (invoiceFilters.start && inv.date < invoiceFilters.start) return false;
        if (invoiceFilters.end && inv.date > invoiceFilters.end) return false;
        if (invoiceFilters.supplierId && inv.supplier_id !== parseInt(invoiceFilters.supplierId)) return false;
        if (invoiceFilters.boatId && inv.boat_id !== parseInt(invoiceFilters.boatId)) return false;
        return true;
    });
}


function renderThead(): void {
    const headers = currentView === "detail"
        ? ["Ημερομηνία", "Ποσό", "Προμηθευτής", "Χρεώνεται σε", "Ενέργειες"]
        : ["Προμηθευτής", "Χρεώνεται σε", "Σύνολο Τιμολογίων", "Πλήθος"];

    invoiceThead.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
}


function renderDetailView(invoices: Invoice[]): void {
    if (invoices.length === 0) {
        invoiceListBody.innerHTML = `<tr><td colspan="5" class="usage-empty">Δεν βρέθηκαν τιμολόγια για τα επιλεγμένα φίλτρα.</td></tr>`;
        return;
    }

    invoices.forEach((inv) => {
        invoiceListBody.appendChild(createLockedInvoiceRow(inv));
    });
}

function createLockedInvoiceRow(inv: Invoice): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.classList.add("usage-locked-row");
    row.dataset.id = inv.id.toString();

    const supplier = store.suppliers.find((s) => s.id === inv.supplier_id);
    const boat = store.boats.find((b) => b.id === inv.boat_id);

    row.innerHTML = `
        <td>${formatDate(inv.date)}</td>
        <td style="font-weight: 700;">${inv.amount.toFixed(2)} €</td>
        <td>${supplier?.name ?? "-"}</td>
        <td>${boat?.name ?? "-"}</td>
        <td>
            <button class="usage-edit-btn" data-id="${inv.id}">Επεξεργασία</button>
        </td>
    `;

    return row;
}


interface AggregatedRow {
    supplier_id: number;
    boat_id: number;
    total: number;
    count: number;
}

function aggregateInvoices(invoices: Invoice[]): AggregatedRow[] {
    const map = new Map<string, AggregatedRow>();

    invoices.forEach((inv) => {
        const key = `${inv.supplier_id}-${inv.boat_id}`;
        const existing = map.get(key);

        if (existing) {
            existing.total += inv.amount;
            existing.count += 1;
        } else {
            map.set(key, {
                supplier_id: inv.supplier_id,
                boat_id: inv.boat_id,
                total: inv.amount,
                count: 1,
            });
        }
    });

    return Array.from(map.values());
}

function renderAggregateView(invoices: Invoice[]): void {
    const aggregated = aggregateInvoices(invoices);

    if (aggregated.length === 0) {
        invoiceListBody.innerHTML = `<tr><td colspan="4" class="usage-empty">Δεν βρέθηκαν τιμολόγια για τα επιλεγμένα φίλτρα.</td></tr>`;
        return;
    }

    aggregated.sort((a, b) => {
        const supA = store.suppliers.find((s) => s.id === a.supplier_id)?.name ?? "";
        const supB = store.suppliers.find((s) => s.id === b.supplier_id)?.name ?? "";
        if (supA !== supB) return supA.localeCompare(supB, "el");

        const boatA = store.boats.find((boat) => boat.id === a.boat_id)?.name ?? "";
        const boatB = store.boats.find((boat) => boat.id === b.boat_id)?.name ?? "";
        return boatA.localeCompare(boatB, "el");
    });

    aggregated.forEach((agg) => {
        const row = document.createElement("tr");
        row.classList.add("usage-locked-row", "aggregate-row");

        const supplier = store.suppliers.find((s) => s.id === agg.supplier_id);
        const boat = store.boats.find((b) => b.id === agg.boat_id);

        row.innerHTML = `
            <td style="font-weight: 600;">${supplier?.name ?? "-"}</td>
            <td>${boat?.name ?? "-"}</td>
            <td style="font-weight: 700;">${agg.total.toFixed(2)} €</td>
            <td>${agg.count}</td>
        `;
        invoiceListBody.appendChild(row);
    });
}


export function createInvoiceFormRow(inv?: Invoice): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.classList.add("usage-form-row");
    if (inv) row.dataset.id = inv.id.toString();

    const today = new Date().toISOString().split("T")[0];
    const dateVal = inv ? inv.date : today;
    const amountVal = inv ? inv.amount : "";
    const supplierVal = inv ? inv.supplier_id : "";
    const boatVal = inv ? inv.boat_id : "";

    const supplierOptions = store.suppliers
        .map((s) => `<option value="${s.id}" ${supplierVal === s.id ? "selected" : ""}>${s.name}</option>`)
        .join("");

    const boatOptions = store.boats
        .map((b) => `<option value="${b.id}" ${boatVal === b.id ? "selected" : ""}>${b.name}</option>`)
        .join("");

    row.innerHTML = `
        <td><input type="date" class="inv-date" value="${dateVal}"></td>
        <td><input type="number" class="inv-amount" step="0.01" min="0.01" value="${amountVal}" placeholder="0.00"></td>
        <td>
            <select class="inv-supplier">
                <option value="">-- Επιλογή --</option>
                ${supplierOptions}
            </select>
        </td>
        <td>
            <select class="inv-boat">
                <option value="">-- Επιλογή --</option>
                ${boatOptions}
            </select>
        </td>
        <td>
            <button class="usage-save-btn" type="button">Αποθήκευση</button>
            <button class="usage-cancel-btn" type="button">Άκυρο</button>
        </td>
    `;

    return row;
}

function createAddInvoiceRow(): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.className = "add-usage-row";
    row.innerHTML = `
        <td colspan="5">
            <button class="add-usage-btn" type="button">+ Προσθέστε τιμολόγιο</button>
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