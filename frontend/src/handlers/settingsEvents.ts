import { store } from "../state/store";
import { fetchData } from "../services/appLoader";
import {
    createSupplier, updateSupplier, deleteSupplier,
    createNamedItem, updateNamedItem, deleteNamedItem
} from "../api/settingsApi";
import {
    renderSuppliersList,
    renderNamedItemsList
} from "../ui/renderSettingsList";
import { showMessageModal } from "../utils/messageModal";
import { showConfirmModal } from "../utils/confirmModal";
import type { NamedItemType } from "../models/settings";


const supplierModal = document.querySelector<HTMLDivElement>("#modal-supplier")!;
const supplierForm = document.querySelector<HTMLFormElement>("#supplier-form")!;
const supplierId = document.querySelector<HTMLInputElement>("#supplier-id")!;
const supplierName = document.querySelector<HTMLInputElement>("#supplier-name")!;
const supplierAfm = document.querySelector<HTMLInputElement>("#supplier-afm")!;
const supplierPhone = document.querySelector<HTMLInputElement>("#supplier-phone")!;
const supplierEmail = document.querySelector<HTMLInputElement>("#supplier-email")!;
const supplierNotes = document.querySelector<HTMLTextAreaElement>("#supplier-notes")!;
const btnCancelSupplier = document.querySelector<HTMLButtonElement>("#btn-cancel-supplier")!;

const namedItemModal = document.querySelector<HTMLDivElement>("#modal-named-item")!;
const namedItemForm = document.querySelector<HTMLFormElement>("#named-item-form")!;
const namedItemId = document.querySelector<HTMLInputElement>("#named-item-id")!;
const namedItemType = document.querySelector<HTMLInputElement>("#named-item-type")!;
const namedItemName = document.querySelector<HTMLInputElement>("#named-item-name")!;
const namedItemTitle = document.querySelector<HTMLHeadingElement>("#modal-named-item-title")!;
const btnCancelNamedItem = document.querySelector<HTMLButtonElement>("#btn-cancel-named-item")!;

const suppliersListBody = document.querySelector<HTMLTableSectionElement>("#suppliers-list")!;


export function initSettingsEvents(): void {
    // Supplier form
    supplierForm.addEventListener("submit", handleSupplierSubmit);
    btnCancelSupplier.addEventListener("click", () => supplierModal.classList.add("hidden"));

    namedItemForm.addEventListener("submit", handleNamedItemSubmit);
    btnCancelNamedItem.addEventListener("click", () => namedItemModal.classList.add("hidden"));


    document.querySelectorAll<HTMLButtonElement>(".materials-primary-btn").forEach(btn => {
        const parentPanel = btn.closest(".settings-panel");
        if (!parentPanel) return;
        const panelId = parentPanel.id;

        btn.addEventListener("click", () => {
            if (panelId === "tab-suppliers") openSupplierModal();
            else if (panelId === "tab-invoice-categories") openNamedItemModal("invoice-categories");
            else if (panelId === "tab-material-units") openNamedItemModal("material-units");
            else if (panelId === "tab-material-categories") openNamedItemModal("material-categories");
        });
    });

    // Edit / delete: event delegation σε κάθε tbody
    suppliersListBody.addEventListener("click", handleSupplierTableClick);

    ["invoice-categories", "material-units", "material-categories"].forEach(type => {
        const tbody = document.querySelector<HTMLTableSectionElement>(`#${type}-list`);
        tbody?.addEventListener("click", (e) => handleNamedItemTableClick(e, type as NamedItemType));
    });
}



function openSupplierModal(supplier?: typeof store.suppliers[number]): void {
    supplierModal.classList.remove("hidden");
    supplierForm.reset();

    if (supplier) {
        supplierId.value = supplier.id.toString();
        supplierName.value = supplier.name;
        supplierAfm.value = supplier.afm ?? "";
        supplierPhone.value = supplier.phone ?? "";
        supplierEmail.value = supplier.email ?? "";
        supplierNotes.value = supplier.notes ?? "";
        document.querySelector<HTMLHeadingElement>("#modal-supplier-title")!.textContent = "Επεξεργασία Προμηθευτή";
    } else {
        supplierId.value = "";
        document.querySelector<HTMLHeadingElement>("#modal-supplier-title")!.textContent = "Νέος Προμηθευτής";
    }
}

async function handleSupplierSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const payload = {
        name: supplierName.value.trim(),
        afm: supplierAfm.value.trim() || null,
        phone: supplierPhone.value.trim() || null,
        email: supplierEmail.value.trim() || null,
        notes: supplierNotes.value.trim() || null
    };

    if (!payload.name) {
        showMessageModal("Σφάλμα", "Το όνομα είναι υποχρεωτικό.", "error");
        return;
    }

    const id = supplierId.value;

    try {
        if (id) await updateSupplier(Number(id), payload);
        else await createSupplier(payload);

        supplierModal.classList.add("hidden");
        await fetchData();
        renderSuppliersList();

        showMessageModal("Επιτυχία",
            id ? "Ο προμηθευτής ενημερώθηκε." : "Ο προμηθευτής προστέθηκε.",
            "success");
    } catch (err) {
        console.error(err);
        showMessageModal("Σφάλμα", "Πρόβλημα κατά την αποθήκευση.", "error");
    }
}

async function handleSupplierTableClick(e: Event): Promise<void> {
    const target = e.target as HTMLElement;
    const id = parseInt(target.dataset.id ?? "0");
    if (!id) return;

    if (target.classList.contains("material-edit-btn")) {
        const supplier = store.suppliers.find(s => s.id === id);
        if (supplier) openSupplierModal(supplier);
    }

    if (target.classList.contains("material-delete-btn")) {
        if (await showConfirmModal("Προειδοποίηση", "Διαγραφή προμηθευτή;", "error")) {
            try {
                await deleteSupplier(id);
                await fetchData();
                renderSuppliersList();
                showMessageModal("Επιτυχία", "Ο προμηθευτής διαγράφηκε.", "success");
            } catch (err) {
                console.error(err);
                showMessageModal("Σφάλμα", "Πρόβλημα κατά τη διαγραφή.", "error");
            }
        }
    }
}


const TYPE_TITLES: Record<NamedItemType, { single: string; many: string }> = {
    "invoice-categories": { single: "Κατηγορία Τιμολογίου", many: "Κατηγορίες Τιμολογίων" },
    "material-units":     { single: "Μονάδα Μέτρησης",     many: "Μονάδες Μέτρησης" },
    "material-categories":{ single: "Κατηγορία Υλικού",    many: "Κατηγορίες Υλικών" },
};

function getNamedItemsFromStore(type: NamedItemType) {
    switch (type) {
        case "invoice-categories": return store.invoiceCategories;
        case "material-units":     return store.materialUnits;
        case "material-categories":return store.materialCategories;
    }
}

function openNamedItemModal(type: NamedItemType, itemId?: number): void {
    namedItemModal.classList.remove("hidden");
    namedItemForm.reset();

    namedItemType.value = type;

    if (itemId) {
        namedItemId.value = itemId.toString();
        const items = getNamedItemsFromStore(type);
        const item = items.find(i => i.id === itemId);
        if (item) namedItemName.value = item.name;
        namedItemTitle.textContent = `Επεξεργασία ${TYPE_TITLES[type].single}`;
    } else {
        namedItemId.value = "";
        namedItemTitle.textContent = `Νέα ${TYPE_TITLES[type].single}`;
    }
}

async function handleNamedItemSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const type = namedItemType.value as NamedItemType;
    const name = namedItemName.value.trim();
    const id = namedItemId.value;

    if (!name) {
        showMessageModal("Σφάλμα", "Το όνομα είναι υποχρεωτικό.", "error");
        return;
    }

    try {
        if (id) await updateNamedItem(type, Number(id), name);
        else await createNamedItem(type, name);

        namedItemModal.classList.add("hidden");
        await fetchData();
        renderNamedItemsList(type);

        showMessageModal("Επιτυχία",
            id ? "Η εγγραφή ενημερώθηκε." : "Η εγγραφή προστέθηκε.",
            "success");
    } catch (err) {
        console.error(err);
        showMessageModal("Σφάλμα", "Πρόβλημα κατά την αποθήκευση.", "error");
    }
}

async function handleNamedItemTableClick(e: Event, type: NamedItemType): Promise<void> {
    const target = e.target as HTMLElement;
    const id = parseInt(target.dataset.id ?? "0");
    if (!id) return;

    if (target.classList.contains("material-edit-btn")) {
        openNamedItemModal(type, id);
    }

    if (target.classList.contains("material-delete-btn")) {
        if (await showConfirmModal("Προειδοποίηση", "Διαγραφή εγγραφής;", "error")) {
            try {
                await deleteNamedItem(type, id);
                await fetchData();
                renderNamedItemsList(type);
                showMessageModal("Επιτυχία", "Η εγγραφή διαγράφηκε.", "success");
            } catch (err) {
                console.error(err);
                showMessageModal("Σφάλμα", "Πρόβλημα κατά τη διαγραφή.", "error");
            }
        }
    }
}