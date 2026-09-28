import { store } from "../state/store";
import type { Supplier, NamedItem } from "../models/settings";


const suppliersListBody = document.querySelector<HTMLTableSectionElement>("#suppliers-list")!;

export function renderSuppliersList(): void {
    suppliersListBody.innerHTML = "";

    store.suppliers.forEach((s: Supplier) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.afm || "—"}</td>
            <td>${s.phone || "—"}</td>
            <td>${s.email || "—"}</td>
            <td>${s.notes || "—"}</td>
            <td>
                <div class="materials-actions">
                    <button class="material-edit-btn" data-id="${s.id}">Επεξεργασία</button>
                    <button class="material-delete-btn" data-id="${s.id}">Διαγραφή</button>
                </div>
            </td>
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
            <td>${item.name}</td>
            <td>
                <div class="materials-actions">
                    <button class="material-edit-btn" data-id="${item.id}" data-type="${type}">Επεξεργασία</button>
                    <button class="material-delete-btn" data-id="${item.id}" data-type="${type}">Διαγραφή</button>
                </div>
            </td>
        `;
        entry.tbody.appendChild(row);
    });
}