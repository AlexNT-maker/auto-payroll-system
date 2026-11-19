import { store } from "../state/store";

const materialsListBody = document.querySelector<HTMLTableSectionElement>("#materials-list")!;

export function renderMaterialsList(): void {
    materialsListBody.innerHTML = "";

    store.materials.forEach((material) => {
        const row = document.createElement("tr");
        const code = "ID" + material.id.toString().padStart(3, "0");

        row.innerHTML = `
            <td>
                ${code}
                <div class="table-row-actions">
                    <button class="material-edit-btn" data-id="${material.id}" title="Επεξεργασία" aria-label="Επεξεργασία">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="material-delete-btn" data-id="${material.id}" title="Διαγραφή" aria-label="Διαγραφή">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
                    </button>
                </div>
            </td>
            <td>${material.name}</td>
            <td>${material.category}</td>
            <td>${material.unit}</td>
            <td class="amount-cell">${material.price.toFixed(2)} €</td>
        `;

        materialsListBody.appendChild(row);
    });
}