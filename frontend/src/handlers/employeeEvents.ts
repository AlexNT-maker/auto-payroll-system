import { store } from "../state/store";
import { 
    deleteEmployee,
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

export async function handleDeleteEmployee(id:number) {
try {
    await deleteEmployee(id);

    await fetchData();

    showMessageModal("Επιτυχία", "Ο εργαζόμενος διαγράφηκε επιτυχώς", "success");
} catch (error) {
    console.error(error);

    showMessageModal("Σφάλμα","Προέκυψε σφάλμα κατά τη διαγραφή του εργαζομένου", "error");
}
}

export function attachActionListeners() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            openEditModal(id);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            if(await showConfirmModal("Προειδοποίηση", "Είστε σίγουρος για τη διαγραφή;", "error")) {
                handleDeleteEmployee(id);
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
    showMessageModal("Επιτυχία","Τα στοιχεία ενημερώθηκαν","success");
}else showMessageModal("Επιτυχία","Ο εργαζόμενος προστέθηκε!", "success");

  }catch(error){
    console.error(typeof error);
    showMessageModal("Σφάλμα", "Δεν ήταν δυνατή η ενημέρωση του εργαζομένου", "error")
  }
};
