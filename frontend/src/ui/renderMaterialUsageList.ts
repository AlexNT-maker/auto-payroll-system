import { store } from "../state/store";
import type { MaterialUsage } from "../models/materialsUsage";

const usageListBody = document.querySelector<HTMLTableSectionElement>("#usage-list")!;

export function renderMaterialUsagesList(): void {
    usageListBody.innerHTML = "";

    store.materialUsages.forEach((usage) => {
        usageListBody.appendChild(createLockedUsageRow(usage));
    });

    // Το "+ Προσθέστε προϊόν" είναι πάντα τελευταίο
    usageListBody.appendChild(createAddUsageRow());
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
        <td>${usage.unit_price.toFixed(2)} €</td>
        <td>${usage.quantity}</td>
        <td>${boat?.name ?? "-"}</td>
        <td style="font-weight: 700;">${usage.total_price.toFixed(2)} €</td>
        <td>
            <button class="usage-edit-btn" data-id="${usage.id}">Επεξεργασία</button>
        </td>
    `;

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

// -- Form row (νέα καταχώρηση ή edit) --
export function createUsageFormRow(usage?: MaterialUsage): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.classList.add("usage-form-row");
    if (usage) row.dataset.id = usage.id.toString();

    const today = new Date().toISOString().split("T")[0];
    const dateVal = usage ? usage.date : today;

    const materialOptions = store.materials
        .map((m) => {
            const selected = usage && usage.material_id === m.id ? "selected" : "";
            return `<option value="${m.id}" data-price="${m.price}" data-unit="${m.unit}" ${selected}>${m.name}</option>`;
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
    const priceText = selectedMaterial ? selectedMaterial.price.toFixed(2) + " €" : "0.00 €";
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
        <td><span class="usage-price">${priceText}</span></td>
        <td><input type="number" class="usage-quantity" min="0" step="0.01" value="${quantityVal}"></td>
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

    // Auto-fill price / unit / total όταν αλλάζει υλικό ή ποσότητα
    const materialSelect = row.querySelector(".usage-material") as HTMLSelectElement;
    const quantityInput = row.querySelector(".usage-quantity") as HTMLInputElement;
    const priceSpan = row.querySelector(".usage-price") as HTMLSpanElement;
    const unitSpan = row.querySelector(".usage-unit") as HTMLSpanElement;
    const totalSpan = row.querySelector(".usage-total") as HTMLSpanElement;

    function updateDerived(): void {
        const opt = materialSelect.selectedOptions[0];
        const price = parseFloat(opt?.dataset.price ?? "0") || 0;
        const unit = opt?.dataset.unit ?? "-";

        unitSpan.textContent = materialSelect.value ? unit : "-";
        priceSpan.textContent = price.toFixed(2) + " €";

        const qty = parseFloat(quantityInput.value) || 0;
        totalSpan.textContent = (price * qty).toFixed(2) + " €";
    }

    materialSelect.addEventListener("change", updateDerived);
    quantityInput.addEventListener("input", updateDerived);

    return row;
}

// -- Helpers --
function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
}