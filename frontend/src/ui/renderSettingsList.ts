import { store } from "../state/store";
import type { Supplier, NamedItem } from "../models/settings";


const suppliersListBody = document.querySelector<HTMLTableSectionElement>("#suppliers-list")!;

export function renderSuppliersList(): void {
    suppliersListBody.innerHTML = "";

    store.suppliers.forEach((s: Supplier) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                ${s.name}
                <div class="table-row-actions">
                    <button class="material-edit-btn" data-id="${s.id}" title="Επεξεργασία" aria-label="Επεξεργασία">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="material-delete-btn" data-id="${s.id}" title="Διαγραφή" aria-label="Διαγραφή">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
                    </button>
                </div>
            </td>
            <td>${s.afm || "—"}</td>
            <td>${s.phone || "—"}</td>
            <td>${s.email || "—"}</td>
            <td>${s.notes || "—"}</td>
        `;
        suppliersListBody.appendChild(row);
    });
}


const namedItemsMap: Record<string, { tbody: HTMLTableSectionElement; getData: () => NamedItem[] }> = {
    "invoice-categories": {
        tbody: document.querySelector<HTMLTableSectionElement>("#invoice-categories-list")!,
        getData: () => store.invoiceCategories
    },
    "material-units": {
        tbody: document.querySelector<HTMLTableSectionElement>("#material-units-list")!,
        getData: () => store.materialUnits
    },
    "material-categories": {
        tbody: document.querySelector<HTMLTableSectionElement>("#material-categories-list")!,
        getData: () => store.materialCategories
    },
};

export function renderNamedItemsList(type: string): void {
    const entry = namedItemsMap[type];
    if (!entry) return;

    entry.tbody.innerHTML = "";

    entry.getData().forEach((item: NamedItem) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                ${item.name}
                <div class="table-row-actions">
                    <button class="material-edit-btn" data-id="${item.id}" data-type="${type}" title="Επεξεργασία" aria-label="Επεξεργασία">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="material-delete-btn" data-id="${item.id}" data-type="${type}" title="Διαγραφή" aria-label="Διαγραφή">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
                    </button>
                </div>
            </td>
        `;
        entry.tbody.appendChild(row);
    });
}