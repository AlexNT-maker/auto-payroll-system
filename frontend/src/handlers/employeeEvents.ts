import { store } from "../state/store";
import { 
    archiveEmployee,
    restoreEmployee,
    softDeleteEmployee,
updateEmployee,
createEmployee
 } from "../api/employeesApi";
 import { fetchData } from "../services/appLoader";
import { showMessageModal } from "../utils/messageModal";
import { showConfirmModal } from "../utils/confirmModal";


const btnAddEmployee = document.querySelector<HTMLButtonElement>('#btn-add-employee')!;
const btnCancel = document.querySelector<HTMLButtonElement>('#btn-cancel')!;
const employeeForm = document.querySelector<HTMLFormElement>('#employee-form')!;
const inputName = document.querySelector<HTMLInputElement>('#emp-name')!;
const inputWage = document.querySelector<HTMLInputElement>('#emp-wage')!;
const inputOvertime = document.querySelector<HTMLInputElement>('#emp-overtime')!;
const inputBank = document.querySelector<HTMLInputElement>('#emp-bank')!;
const inputId = document.querySelector<HTMLInputElement>('#emp-id')!;
const modal = document.querySelector<HTMLDivElement>('#modal-employee')!;



export function initEmployeeEvents() {
    btnAddEmployee.addEventListener("click", openModal);

    btnCancel.addEventListener("click", closeModal);

    employeeForm.addEventListener(
        "submit",
        handleEmployeeSubmit
    );

    attachActionListeners();
}

export function openModal() {
    modal.classList.remove('hidden');
    employeeForm.reset(); 
    inputId.value = '';   
    document.getElementById('modal-title')!.textContent = "Νέος Εργαζόμενος";
}

export function closeModal() {
    modal.classList.add('hidden');
}

export function openEditModal(id: number) {
    const emp = store.employees.find(e => e.id === id);
    if (!emp) return;
    inputName.value = emp.name;
    inputWage.value = emp.daily_wage.toString();
    inputOvertime.value = emp.overtime_rate.toString();
    inputBank.value = emp.bank_daily_amount.toString();
    inputId.value = emp.id.toString();

    document.getElementById('modal-title')!.textContent = "Επεξεργασία Εργαζόμενου";
    modal.classList.remove('hidden');
}

export async function handleArchiveEmployee(id: number) {
    try {
        await archiveEmployee(id);
        await fetchData();
        showMessageModal(
            "Επιτυχία",
            "Ο εργαζόμενος αρχειοθετήθηκε. Το ιστορικό και τα μεροκάματά του διατηρούνται.",
            "success",
            () => window.location.reload()
        );
    } catch (error) {
        console.error(error);
        showMessageModal("Σφάλμα", "Προέκυψε σφάλμα κατά την αρχειοθέτηση του εργαζομένου", "error");
    }
}

export async function handleRestoreEmployee(id: number) {
    try {
        await restoreEmployee(id);
        await fetchData();
        showMessageModal(
            "Επιτυχία",
            "Ο εργαζόμενος επανήλθε με το προηγούμενο ιστορικό και τα μεροκάματά του.",
            "success",
            () => window.location.reload()
        );
    } catch (error) {
        console.error(error);
        showMessageModal("Σφάλμα", "Δεν ήταν δυνατή η επαναφορά του εργαζομένου", "error");
    }
}

export async function handleSoftDeleteEmployee(id: number) {
    try {
        await softDeleteEmployee(id);
        await fetchData();
        showMessageModal(
            "Επιτυχία",
            "Ο εργαζόμενος αφαιρέθηκε από το παρόν και τις μελλοντικές ενέργειες. Τα ιστορικά μεροκάματα διατηρούνται.",
            "success",
            () => window.location.reload()
        );
    } catch (error) {
        console.error(error);
        showMessageModal("Σφάλμα", "Δεν ήταν δυνατή η διαγραφή του εργαζομένου από το παρόν", "error");
    }
}

export function attachActionListeners() {
    const list = document.getElementById("employees-list");
    if (!list) return;

    list.querySelectorAll<HTMLButtonElement>(".employee-edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
            openEditModal(id);
        });
    });

    list.querySelectorAll<HTMLButtonElement>(".employee-archive-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
            if (await showConfirmModal("Αρχειοθέτηση", "Να αρχειοθετηθεί ο εργαζόμενος; Το ιστορικό του θα διατηρηθεί.", "warning")) {
                handleArchiveEmployee(id);
            }
        });
    });

    list.querySelectorAll<HTMLButtonElement>(".employee-restore-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
            if (await showConfirmModal("Επαναφορά", "Να επανέλθει ο εργαζόμενος με το παλιό του ιστορικό;", "info")) {
                handleRestoreEmployee(id);
            }
        });
    });

    list.querySelectorAll<HTMLButtonElement>(".employee-delete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
            if (await showConfirmModal(
                "Διαγραφή από το παρόν",
                "Ο εργαζόμενος δεν θα εμφανίζεται πλέον στη διαχείριση ή σε νέες ενέργειες. Τα ιστορικά στοιχεία θα διατηρηθούν και δεν θα είναι δυνατή η επαναφορά του.",
                "error"
            )) {
                handleSoftDeleteEmployee(id);
            }
        });
    });
}

export async function handleEmployeeSubmit(e: Event){
  e.preventDefault();

  const formData = {
    name: inputName.value,
    daily_wage: parseFloat(inputWage.value),
    overtime_rate: parseFloat(inputOvertime.value),
    bank_daily_amount: parseFloat(inputBank.value)
  };

  const id = inputId.value;

  try {
 if (id) {
    await updateEmployee(Number(id), formData);
} else {
    await createEmployee(formData);
}

closeModal();

await fetchData();

if(id){
    showMessageModal("Επιτυχία","Τα στοιχεία ενημερώθηκαν","success", () => window.location.reload());

}else showMessageModal("Επιτυχία","Ο εργαζόμενος προστέθηκε!", "success", () => window.location.reload());

  }catch(error){
    console.error(typeof error);
    showMessageModal("Σφάλμα", "Δεν ήταν δυνατή η ενημέρωση του εργαζομένου", "error")
  }
};
