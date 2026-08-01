import { store } from "../state/store";
import { loadAttendance } from "../api/attendanceApi";
import { renderTable } from "../ui/renderTable";    

const btnEditDaily = document.querySelector<HTMLButtonElement>('#btn-edit-daily')!;
const datePicker = document.querySelector<HTMLInputElement>('#date-picker')!;
const form = document.querySelector<HTMLFormElement>('#attendance-form')!;
const tableBody = document.querySelector<HTMLTableSectionElement>("#attendance-list")!;
const btnSubmitDaily = document.querySelector<HTMLButtonElement>('#btn-submit-daily')!;
const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;






export function initAttendanceEvents() {

    btnEditDaily.addEventListener(
        "click",
        handleUnlockForm
    );

    datePicker.addEventListener(
        "change",
        loadDayData
    );

    form.addEventListener(
        "submit",
        handleAttendanceSubmit
    );

 sortSelect?.addEventListener(
    'change', handleSortChange
);

btnEditDaily.addEventListener('click', handleUnlockForm);

}


export function handleUnlockForm() {
    unlockForm();
    alert("Η φόρμα ξεκλείδωσε. Μην ξεχάσετε να πατήσετε 'Αποθήκευση' μετά τις αλλαγές!");
}

export async function handleAttendanceSubmit(e: Event) {
    e.preventDefault();
    const date = datePicker.value; 
    if(!date){ 
        alert('Παρακαλώ επιλέξτε ημερομηνία'); 
        return ;
}

  const rows = tableBody.querySelectorAll('tr');

  for (const row of rows) {
    const checkbox = row.querySelector('.presence-checkbox') as HTMLInputElement;
    const halfbox = row.querySelector('.half-checkbox') as HTMLInputElement;
    const boatSelect = row.querySelector('.boat-select') as HTMLSelectElement;
    const otBoatSelect = row.querySelector('.ot-boat-select') as HTMLSelectElement;
    const overtimeInput = row.querySelector('.overtime-input') as HTMLInputElement;
    const otHours = parseFloat(overtimeInput.value) || 0;

    const empId = parseInt(checkbox.dataset.empId!);
    const isPresent = checkbox.checked;
    const isHalf = halfbox.checked;

    if((isPresent || isHalf) && !boatSelect.value){
      alert ('Παρακαλώ επιλέξτε σκάφος, για όλους τους παρόντες');
      return ;
    }

    if (otHours > 0 && !otBoatSelect.value && !boatSelect.value) {
      alert ('Παρακαλώ επιλέξτε Σκάφος Υπερωρίας, για όσους έχουν ώρες.');
      return;
    }

    const finalOtBoat = otBoatSelect.value ? parseInt(otBoatSelect.value) : (boatSelect.value ? parseInt(boatSelect.value) : null);

    const payload = {
      date: date,
      employee_id: empId,
      boat_id: boatSelect.value ? parseInt(boatSelect.value) : null, 
      overtime_boat_id: finalOtBoat, 
      present: isPresent,
      is_half_day: isHalf,
      overtime_hours: otHours,
      extra_amount: 0,
      extra_reason: ""
    }; 

    try {
        await fetch('http://127.0.0.1:8000/attendance/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Error saving row', err);
    }
  }
  alert('Η αποθήκευση ολοκληρώθηκε!');

  window.location.reload();
}


export function lockForm() {
  const inputs = tableBody.querySelectorAll('input, select');
  inputs.forEach((input: any) => input.disabled = true);
  btnSubmitDaily.classList.add('hidden');
  btnEditDaily.classList.remove('hidden');
}

export function unlockForm() {
  const inputs = tableBody.querySelectorAll('input, select');
  inputs.forEach((input: any) => input.disabled = false);
  btnSubmitDaily.classList.remove('hidden');
  btnEditDaily.classList.add('hidden');
}

export async function loadDayData() {
    const date = datePicker.value;

    if (!date) return;

    try {

        const data = await loadAttendance(date);

        if (data.length > 0) {
            renderTable(data);
            lockForm();
        } else {
            renderTable([]);
            unlockForm();
        }

    } catch (error) {
        console.error("Error loading day data", error);
    }
}

export function lockFormInputs(): void {
  const attendanceList = document.getElementById('attendance-list');
  const inputs = attendanceList?.querySelectorAll('input, select');
  
  if (inputs) {
    for (const input of inputs) {
      (input as HTMLInputElement | HTMLSelectElement).disabled = true;
    }
  };
}

export function syncDOMToState(): void{
  const rows = document.querySelectorAll('#attendance-list tr');

  for (const row of rows) {
    const checkbox = row.querySelector('.presence-checkbox') as HTMLInputElement | null;
    if (!checkbox) continue; 
    
    const empId = Number(checkbox.dataset.empId);
    const employee = store.employees.find(emp => emp.id === empId);

    if (employee) {
      employee.tempPresent = checkbox.checked;
      employee.tempHalfDay = (row.querySelector('.half-checkbox') as HTMLInputElement)?.checked ?? false;
      employee.tempBoat = (row.querySelector('.boat-select') as HTMLSelectElement)?.value ?? "";
      employee.tempOtBoat = (row.querySelector('.ot-boat-select') as HTMLSelectElement)?.value ?? "";
      employee.tempOvertime = (row.querySelector('.overtime-input') as HTMLInputElement)?.value ?? "0";
    }
  }
};


export function handleSortChange(event: Event): void{
  const value = (event.target as HTMLSelectElement).value;
  console.log('Επιλέχθηκε το:', value);

  syncDOMToState();

  value === 'asc' 
    ? store.employees.sort((a, b) => a.name.localeCompare(b.name, 'el'))
    : value === 'desc'
      ? store.employees.sort((a, b) => b.name.localeCompare(a.name, 'el'))
      : store.employees.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)); 

  renderTable();

  const isLocked = !(btnEditDaily?.classList.contains('hidden') ?? true);
  
  isLocked ? lockFormInputs() : null; 
};

