import { store } from "../state/store";
import { fetchData } from "../services/appLoader";
import { renderMaterialsList } from "../ui/renderMaterialsList";
import {
    createMaterial,
    updateMaterial,
    deleteMaterial
} from "../api/materialsApi";
import { MATERIAL_UNITS, MATERIAL_CATEGORIES } from "../models/material";
import { showMessageModal } from "../utils/messageModal";
import { showConfirmModal } from "../utils/confirmModal";

const modal = document.querySelector<HTMLDivElement>("#modal-material")!;
const materialForm = document.querySelector<HTMLFormElement>("#material-form")!;

const inputId = document.querySelector<HTMLInputElement>("#material-id")!;
const inputName = document.querySelector<HTMLInputElement>("#material-name")!;
const selectCategory = document.querySelector<HTMLSelectElement>("#material-category")!;
const selectUnit = document.querySelector<HTMLSelectElement>("#material-unit")!;
const inputPrice = document.querySelector<HTMLInputElement>("#material-price")!;

const btnAddMaterial = document.querySelector<HTMLButtonElement>("#btn-add-material")!;
const btnCancelMaterial = document.querySelector<HTMLButtonElement>("#btn-cancel-material")!;

function populateSelect(select: HTMLSelectElement, options: string[]): void {
    select.innerHTML = "";

    options.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

export function initMaterialEvents(): void {
    populateSelect(selectCategory, MATERIAL_CATEGORIES);
    populateSelect(selectUnit, MATERIAL_UNITS);

    btnAddMaterial.addEventListener("click", openModal);
    btnCancelMaterial.addEventListener("click", closeModal);
    materialForm.addEventListener("submit", handleMaterialSubmit);

    attachMaterialListeners();
}

export function openModal(): void {
    modal.classList.remove("hidden");
    materialForm.reset();
    inputId.value = "";
    document.getElementById("modal-material-title")!.textContent = "Νέο Υλικό";
}

export function closeModal(): void {
    modal.classList.add("hidden");
}

export function openEditModal(id: number): void {
    const material = store.materials.find((m) => m.id === id);
    if (!material) return;

    inputId.value = material.id.toString();
    inputName.value = material.name;
    selectCategory.value = material.category;
    selectUnit.value = material.unit;
    inputPrice.value = material.price.toString();

    document.getElementById("modal-material-title")!.textContent = "Επεξεργασία Υλικού";
    modal.classList.remove("hidden");
}

export async function handleMaterialSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const formData = {
        name: inputName.value,
        category: selectCategory.value,
        unit: selectUnit.value,
        price: parseFloat(inputPrice.value)
    };

    const id = inputId.value;

    try {
        if (id) {
            await updateMaterial(Number(id), formData);
        } else {
            await createMaterial(formData);
        }

        closeModal();
        await fetchData();
        renderMaterialsList();

        showMessageModal(
            "Επιτυχία",
            id ? "Τα στοιχεία ενημερώθηκαν" : "Το υλικό προστέθηκε!",
            "success"
        );
    } catch (error) {
        console.error(error);
        showMessageModal("Σφάλμα", "Δεν ήταν δυνατή η αποθήκευση του υλικού", "error");
    }
}

export async function handleDeleteMaterial(id: number): Promise<void> {
    try {
        await deleteMaterial(id);
        await fetchData();
        renderMaterialsList();

        showMessageModal("Επιτυχία", "Το υλικό διαγράφηκε επιτυχώς", "success");
    } catch (error) {
        console.error(error);
        showMessageModal("Σφάλμα", "Προέκυψε σφάλμα κατά τη διαγραφή", "error");
    }
}

export function attachMaterialListeners(): void {
    document.querySelectorAll(".material-edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            openEditModal(id);
        });
    });

    document.querySelectorAll(".material-delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            if (await showConfirmModal("Προειδοποίηση", "Είστε σίγουρος για τη διαγραφή;", "error")) {
                handleDeleteMaterial(id);
            }
        });
    });
}