import { store } from "../state/store";
import { showMessageModal } from "../utils/messageModal";
import { showConfirmModal } from "../utils/confirmModal";
import {
    createInvoice,
    updateInvoice,
    deleteInvoice,
} from "../api/invoiceApi";
import { fetchData } from "../services/appLoader";
import {
    renderInvoicesList,
    createInvoiceFormRow,
    invoiceFilters,
    setInvoiceView,
} from "../ui/renderInvoiceList";

const btnExportInvoices = document.querySelector<HTMLButtonElement>("#btn-export-invoices-pdf")!;

const invoiceListBody = document.querySelector<HTMLTableSectionElement>("#invoices-list")!;

const filterStart = document.querySelector<HTMLInputElement>("#inv-filter-start")!;
const filterEnd = document.querySelector<HTMLInputElement>("#inv-filter-end")!;
const filterSupplier = document.querySelector<HTMLSelectElement>("#inv-filter-supplier")!;
const filterBoat = document.querySelector<HTMLSelectElement>("#inv-filter-boat")!;
const filterClear = document.querySelector<HTMLButtonElement>("#inv-filter-clear")!;


function handleExportInvoicesPdf(): void {
    const start = filterStart.value;
    const end = filterEnd.value;

    if (!start || !end) {
        showMessageModal("Σφάλμα", "Παρακαλώ επιλέξτε ημερομηνίες.", "error");
        return;
    }

    let url = `http://127.0.0.1:8000/invoices/pdf?start=${start}&end=${end}`;
    if (filterSupplier.value) url += `&supplier_id=${filterSupplier.value}`;
    if (filterBoat.value)     url += `&boat_id=${filterBoat.value}`;

    window.open(url, "_blank");
}

export function initInvoiceEvents(): void {
    invoiceListBody.addEventListener("click", handleTableClick);

    filterStart.addEventListener("change", handleFilterChange);
    filterEnd.addEventListener("change", handleFilterChange);
    filterSupplier.addEventListener("change", handleFilterChange);
    filterBoat.addEventListener("change", handleFilterChange);
    filterClear.addEventListener("click", handleClearFilters);
    btnExportInvoices.addEventListener("click", handleExportInvoicesPdf);

    document.querySelectorAll<HTMLButtonElement>("#page-invoices .usage-view-toggle button").forEach((btn) => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view as "detail" | "aggregate";
            setInvoiceView(view);

            document.querySelectorAll("#page-invoices .usage-view-toggle button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            renderInvoicesList();
        });
    });
}


export function initInvoiceFilters(): void {
    if (!filterStart.value) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const today = new Date();

        filterStart.value = toISO(firstDay);
        filterEnd.value = toISO(today);
    }

    filterSupplier.innerHTML = '<option value="">Όλοι</option>';
    store.suppliers.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id.toString();
        opt.textContent = s.name;
        filterSupplier.appendChild(opt);
    });

    filterBoat.innerHTML = '<option value="">Όλα</option>';
    store.boats.forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b.id.toString();
        opt.textContent = b.name;
        filterBoat.appendChild(opt);
    });

    syncFiltersToState();
}

function handleFilterChange(): void {
    syncFiltersToState();
    renderInvoicesList();
}

function handleClearFilters(): void {
    filterStart.value = "";
    filterEnd.value = "";
    filterSupplier.value = "";
    filterBoat.value = "";

    syncFiltersToState();
    renderInvoicesList();
}

function syncFiltersToState(): void {
    invoiceFilters.start = filterStart.value;
    invoiceFilters.end = filterEnd.value;
    invoiceFilters.supplierId = filterSupplier.value;
    invoiceFilters.boatId = filterBoat.value;
}


async function handleTableClick(e: Event): Promise<void> {
    const target = e.target as HTMLElement;

    if (target.classList.contains("add-usage-btn")) {
        handleAddInvoice();
        return;
    }

    if (target.classList.contains("usage-edit-btn")) {
        handleEditInvoice(parseInt(target.dataset.id!));
        return;
    }

    if (target.classList.contains("usage-save-btn")) {
        await handleSaveInvoice(target.closest("tr")!);
        return;
    }

    if (target.classList.contains("usage-cancel-btn")) {
        renderInvoicesList();
        return;
    }
}

function handleAddInvoice(): void {
    const addRow = invoiceListBody.querySelector(".add-usage-row");
    if (!addRow) return;

    const formRow = createInvoiceFormRow();
    invoiceListBody.insertBefore(formRow, addRow);

    (formRow.querySelector(".inv-amount") as HTMLInputElement).focus();
}

function handleEditInvoice(id: number): void {
    const inv = store.invoices.find((i) => i.id === id);
    if (!inv) return;

    const lockedRow = invoiceListBody.querySelector(`tr.usage-locked-row[data-id="${id}"]`);
    if (!lockedRow) return;

    const formRow = createInvoiceFormRow(inv);
    lockedRow.replaceWith(formRow);
}

async function handleSaveInvoice(row: HTMLTableRowElement): Promise<void> {
    const id = row.dataset.id ? parseInt(row.dataset.id) : null;

    const date = (row.querySelector(".inv-date") as HTMLInputElement).value;
    const amount = parseFloat((row.querySelector(".inv-amount") as HTMLInputElement).value) || 0;
    const supplierId = (row.querySelector(".inv-supplier") as HTMLSelectElement).value;
    const boatId = (row.querySelector(".inv-boat") as HTMLSelectElement).value;

    // Validations
    if (!date) {
        showMessageModal("Σφάλμα", "Παρακαλώ επιλέξτε ημερομηνία.", "error");
        return;
    }
    if (!amount || amount <= 0) {
        showMessageModal("Σφάλμα", "Παρακαλώ εισάγετε ποσό μεγαλύτερο του 0.", "error");
        return;
    }
    if (!supplierId) {
        showMessageModal("Σφάλμα", "Παρακαλώ επιλέξτε προμηθευτή.", "error");
        return;
    }
    if (!boatId) {
        showMessageModal("Σφάλμα", "Παρακαλώ επιλέξτε σκάφος.", "error");
        return;
    }

    const payload = {
        date,
        amount,
        supplier_id: parseInt(supplierId),
        boat_id: parseInt(boatId),
    };

    try {
        if (id) {
            await updateInvoice(id, payload);
        } else {
            await createInvoice(payload);
        }

        await fetchData();
        renderInvoicesList();

        showMessageModal(
            "Επιτυχία",
            id ? "Το τιμολόγιο ενημερώθηκε." : "Το τιμολόγιο αποθηκεύτηκε.",
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