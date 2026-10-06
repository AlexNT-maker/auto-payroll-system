import { store } from "../state/store";
import { showMessageModal } from "../utils/messageModal";
import { showConfirmModal } from "../utils/confirmModal";
import {
    createMaterialUsage,
    updateMaterialUsage,
    deleteMaterialUsage
} from "../api/materialsUsageApi";
import { fetchData } from "../services/appLoader";
import {
    renderMaterialUsagesList,
    createUsageFormRow,
    usageFilters,
    setCurrentView,
} from "../ui/renderMaterialUsageList";
import { API_URL } from "../config/api";

const usageListBody = document.querySelector<HTMLTableSectionElement>("#usage-list")!;

// -- Filter DOM refs --
const filterStart = document.querySelector<HTMLInputElement>("#usage-filter-start")!;
const filterEnd = document.querySelector<HTMLInputElement>("#usage-filter-end")!;
const filterMaterial = document.querySelector<HTMLSelectElement>("#usage-filter-material")!;
const filterCategory = document.querySelector<HTMLSelectElement>("#usage-filter-category")!;
const filterBoat = document.querySelector<HTMLSelectElement>("#usage-filter-boat")!;
const filterClear = document.querySelector<HTMLButtonElement>("#usage-filter-clear")!;

const btnExportPdf = document.querySelector<HTMLButtonElement>("#btn-export-usage-pdf")!;

function handleExportPdf(): void {
    const start = filterStart.value;
    const end = filterEnd.value;

    if (!start || !end) {
        showMessageModal("Σφάλμα", "Παρακαλώ επιλέξτε ημερομηνίες.", "error");
        return;
    }

    let url = `${API_URL}/material-usages/pdf?start=${start}&end=${end}`;
    if (filterMaterial.value) url += `&material_id=${filterMaterial.value}`;
    if (filterCategory.value) url += `&category=${encodeURIComponent(filterCategory.value)}`;
    if (filterBoat.value)     url += `&boat_id=${filterBoat.value}`;

    window.open(url, "_blank");
}


export function initMaterialUsageEvents(): void {
    usageListBody.addEventListener("click", handleTableClick);

    filterStart.addEventListener("change", handleFilterChange);
    filterEnd.addEventListener("change", handleFilterChange);
    filterMaterial.addEventListener("change", handleFilterChange);
    filterCategory.addEventListener("change", handleFilterChange);
    filterBoat.addEventListener("change", handleFilterChange);
    filterClear.addEventListener("click", handleClearFilters);
    btnExportPdf.addEventListener("click", handleExportPdf);

    document.querySelectorAll<HTMLButtonElement>(".usage-view-toggle button").forEach((btn) => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view as "detail" | "aggregate";
            setCurrentView(view);

            document.querySelectorAll(".usage-view-toggle button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            renderMaterialUsagesList();
        });
    });
}


export function initUsageFilters(): void {
    if (!filterStart.value) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const today = new Date();

        filterStart.value = toISO(firstDay);
        filterEnd.value = toISO(today);
    }

    filterMaterial.innerHTML = '<option value="">Όλα</option>';
    store.materials.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id.toString();
        opt.textContent = m.name;
        filterMaterial.appendChild(opt);
    });

    // Populate Category options (unique)
    const categories = Array.from(new Set(store.materials.map((m) => m.category))).sort((a, b) => a.localeCompare(b, "el"));
    filterCategory.innerHTML = '<option value="">Όλες</option>';
    categories.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        filterCategory.appendChild(opt);
    });

    // Populate Boat options
    filterBoat.innerHTML = '<option value="">Όλα</option>';
    store.boats.forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b.id.toString();
        opt.textContent = b.name;
        filterBoat.appendChild(opt);
    });

    // Sync στο state
    syncFiltersToState();
}

function handleFilterChange(): void {
    syncFiltersToState();
    renderMaterialUsagesList();
}

function handleClearFilters(): void {
    filterStart.value = "";
    filterEnd.value = "";
    filterMaterial.value = "";
    filterCategory.value = "";
    filterBoat.value = "";

    syncFiltersToState();
    renderMaterialUsagesList();
}

function syncFiltersToState(): void {
    usageFilters.start = filterStart.value;
    usageFilters.end = filterEnd.value;
    usageFilters.materialId = filterMaterial.value;
    usageFilters.category = filterCategory.value;
    usageFilters.boatId = filterBoat.value;
}


async function handleTableClick(e: Event): Promise<void> {
    const target = e.target as HTMLElement;

    if (target.classList.contains("add-usage-btn")) {
        handleAddUsage();
        return;
    }

    if (target.classList.contains("usage-edit-btn")) {
        handleEditUsage(parseInt(target.dataset.id!));
        return;
    }

    if (target.classList.contains("usage-save-btn")) {
        await handleSaveUsage(target.closest("tr")!);
        return;
    }

    if (target.classList.contains("usage-cancel-btn")) {
        renderMaterialUsagesList();
        return;
    }
}

function handleAddUsage(): void {
    const addRow = usageListBody.querySelector(".add-usage-row");
    if (!addRow) return;

    const formRow = createUsageFormRow();
    usageListBody.insertBefore(formRow, addRow);

    (formRow.querySelector(".usage-material") as HTMLSelectElement).focus();
}

function handleEditUsage(id: number): void {
    const usage = store.materialUsages.find((u) => u.id === id);
    if (!usage) return;

    const lockedRow = usageListBody.querySelector(`tr.usage-locked-row[data-id="${id}"]`);
    if (!lockedRow) return;

    const formRow = createUsageFormRow(usage);
    lockedRow.replaceWith(formRow);
}

async function handleSaveUsage(row: HTMLTableRowElement): Promise<void> {
    const id = row.dataset.id ? parseInt(row.dataset.id) : null;

    const date = (row.querySelector(".usage-date") as HTMLInputElement).value;
    const materialId = (row.querySelector(".usage-material") as HTMLSelectElement).value;
    const boatId = (row.querySelector(".usage-boat") as HTMLSelectElement).value;
    const quantity = parseFloat((row.querySelector(".usage-quantity") as HTMLInputElement).value) || 0;

    if (!date) {
        showMessageModal("Σφάλμα", "Παρακαλώ επιλέξτε ημερομηνία.", "error");
        return;
    }
    if (!materialId) {
        showMessageModal("Σφάλμα", "Παρακαλώ επιλέξτε υλικό.", "error");
        return;
    }
    if (!boatId) {
        showMessageModal("Σφάλμα", "Παρακαλώ επιλέξτε σκάφος.", "error");
        return;
    }

    if (id && quantity === 0) {
        const ok = await showConfirmModal(
            "Προειδοποίηση",
            "Η ποσότητα είναι 0. Θέλετε να διαγραφεί η καταχώρηση;",
            "warning"
        );
        if (!ok) return;

        try {
            await deleteMaterialUsage(id);
            await fetchData();
            renderMaterialUsagesList();
            showMessageModal("Επιτυχία", "Η καταχώρηση διαγράφηκε.", "success");
        } catch (err) {
            console.error(err);
            showMessageModal("Σφάλμα", "Πρόβλημα κατά τη διαγραφή.", "error");
        }
        return;
    }

    if (!id && quantity === 0) {
        showMessageModal("Σφάλμα", "Η ποσότητα δεν μπορεί να είναι 0.", "error");
        return;
    }

    const material = store.materials.find((m) => m.id === parseInt(materialId));
    if (!material) {
        showMessageModal("Σφάλμα", "Το υλικό δεν βρέθηκε.", "error");
        return;
    }

    const unitPrice = material.price;
    const totalPrice = unitPrice * quantity;

    const payload = {
        date,
        material_id: parseInt(materialId),
        boat_id: parseInt(boatId),
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice
    };

    try {
        if (id) {
            await updateMaterialUsage(id, payload);
        } else {
            await createMaterialUsage(payload);
        }

        await fetchData();
        renderMaterialUsagesList();

        showMessageModal(
            "Επιτυχία",
            id ? "Η καταχώρηση ενημερώθηκε." : "Η καταχώρηση αποθηκεύτηκε.",
            "success"
        );
    } catch (err) {
        console.error(err);
        showMessageModal("Σφάλμα", "Πρόβλημα κατά την αποθήκευση.", "error");
    }
}


function toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}