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
    createUsageFormRow
} from "../ui/renderMaterialUsageList";

const usageListBody = document.querySelector<HTMLTableSectionElement>("#usage-list")!;

export function initMaterialUsageEvents(): void {
    usageListBody.addEventListener("click", handleTableClick);
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


    if (id && quantity <= 0) {
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

    if (!id && quantity <= 0) {
        showMessageModal("Σφάλμα", "Η ποσότητα πρέπει να είναι μεγαλύτερη από 0.", "error");
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