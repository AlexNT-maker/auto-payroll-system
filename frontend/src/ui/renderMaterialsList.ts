import { store } from "../state/store";

const materialsListBody = document.querySelector<HTMLTableSectionElement>("#materials-list")!;

export function renderMaterialsList(): void {
    materialsListBody.innerHTML = "";

    store.materials.forEach((material) => {
        const row = document.createElement("tr");
        const code = "ID" + material.id.toString().padStart(3, "0");

        row.innerHTML = `
            <td>${code}</td>
            <td>${material.name}</td>
            <td>${material.category}</td>
            <td>${material.unit}</td>
            <td>${material.price.toFixed(2)} €</td>
            <td>
                <div class="materials-actions">
                    <button class="material-edit-btn" data-id="${material.id}">
                        Επεξεργασία
                    </button>
                    <button class="material-delete-btn" data-id="${material.id}">
                        Διαγραφή
                    </button>
                </div>
            </td>
        `;

        materialsListBody.appendChild(row);
    });
}