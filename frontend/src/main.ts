import { store } from "./state/store";
import { renderTable } from "./ui/renderTable";
import { renderBoatsList } from "./ui/renderBoatList";
import { getEmployees } from "./api/employeesApi";
import { getBoats } from "./api/boatsApi";
import {
     unlockForm,
    loadDayData,
 } from "./handlers/attendanceEvents"
import { renderEmployeesList } from "./ui/renderEmployeesList";
import { initEmployeeEvents } from "./handlers/employeeEvents";
import { initBoatAnalysisEvents } from "./handlers/boatAnalysisEvents";
import { initBoatEvents } from "./handlers/boatEvents";
import {
    initExpensesEvents,
    initExpensesPage,
} from "./handlers/expenseEvents"
import { initPayrollEvents } from "./handlers/payrollEvents";

const datePicker = document.querySelector<HTMLInputElement>('#date-picker')!;
const btnEditDaily = document.querySelector<HTMLButtonElement>('#btn-edit-daily')!;
const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;
const payStart = document.querySelector<HTMLInputElement>('#pay-start')!;
const payEnd = document.querySelector<HTMLInputElement>('#pay-end')!;

// Set as default today
datePicker.valueAsDate = new Date();

// -- 6. Navigation logic --
const pages={
  home: document.getElementById('page-home')!,
  employees: document.getElementById('page-employees')!,
  boats: document.getElementById('page-boats')!,
  shortAnalysis: document.getElementById('page-short-analysis')!,
  expenses: document.getElementById('page-expenses')!,
  payments: document.getElementById('page-payments')!,
};

const navButtons = {
  home: document.getElementById('nav-home')!,
  employees: document.getElementById('nav-employees')!,
  boats: document.getElementById('nav-boats')!,
  shortAnalysis: document.getElementById('nav-short-analysis')!,
  expenses: document.getElementById('nav-expenses')!,
  payments: document.getElementById('nav-payments')!,
};

function navigateTo(pageName: 'home' | 'employees' | 'boats'| 'expenses'| 'payments'| 'shortAnalysis') {
  Object.values(pages).forEach(page => {
    if (page) page.classList.add('hidden');
  });
  pages[pageName].classList.remove('hidden');

  Object.values(navButtons).forEach(btn => btn.classList.remove('active'));
  navButtons[pageName].classList.add('active');

  if (pageName === 'employees') renderEmployeesList();
  if (pageName === 'boats') renderBoatsList() ;
  if (pageName === 'expenses') initExpensesPage();
  if (pageName === 'payments') initPayrollPage();
  if (pageName === 'shortAnalysis') initShortAnalysisPage();
}


btnEditDaily.addEventListener('click', () => {
    unlockForm();
    alert("Η φόρμα ξεκλείδωσε. Μην ξεχάσετε να πατήσετε 'Αποθήκευση' μετά τις αλλαγές!");
});

navButtons.home.addEventListener('click',() => navigateTo('home'));
navButtons.employees.addEventListener('click',() => navigateTo('employees'));
navButtons.boats.addEventListener('click',() => navigateTo('boats'));
navButtons.expenses.addEventListener('click',() => navigateTo('expenses'));
navButtons.payments.addEventListener('click', () => navigateTo('payments'));
navButtons.shortAnalysis.addEventListener('click', () => navigateTo('shortAnalysis'));

// 7. -- Employee management logic -- 



renderEmployeesList();

initEmployeeEvents();

initBoatEvents();

initBoatAnalysisEvents();

initExpensesEvents();

initPayrollEvents();


function initPayrollPage(){
  if (!payStart.value){
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
    payStart.value = firstDay.toISOString().split('T')[0];
    payEnd.value = lastDay.toISOString().split('T')[0];
  }
}


// --- SHORT ANALYSIS LOGIC ---
const shortBoatSelect = document.querySelector<HTMLSelectElement>('#short-boat-select')!;
const shortStart = document.querySelector<HTMLInputElement>('#short-start')!;
const shortEnd = document.querySelector<HTMLInputElement>('#short-end')!;
const shortIsCaptain = document.querySelector<HTMLInputElement>('#short-is-captain')!; // ΝΕΟ
const btnPrintShort = document.querySelector<HTMLButtonElement>('#btn-print-short-analysis')!;

function initShortAnalysisPage() {
    shortBoatSelect.innerHTML = '<option value="">-- Επιλογή Σκάφους --</option>';
    store.boats.forEach(boat => {
        const opt = document.createElement('option');
        opt.value = boat.id.toString();
        opt.textContent = boat.name;
        shortBoatSelect.appendChild(opt);
    });

    if (!shortStart.value) {
        const now = new Date();
        shortStart.valueAsDate = now;
        shortEnd.valueAsDate = now; 
    }
}

shortStart.addEventListener('change', () => {
     shortEnd.value = shortStart.value;
});

btnPrintShort.addEventListener('click', () => {
    const boatId = shortBoatSelect.value;
    const start = shortStart.value;
    const end = shortEnd.value;
    
    // ΝΕΟ: Ελέγχουμε αν το checkbox είναι τικαρισμένο
    const isCaptain = shortIsCaptain ? shortIsCaptain.checked : false;

    if (!boatId) {
        alert("Παρακαλώ επιλέξτε σκάφος.");
        return;
    }
    if (!start || !end) {
        alert("Παρακαλώ επιλέξτε ημερομηνίες.");
        return;
    }

    // ΝΕΟ: Προσθέτουμε το is_captain στο URL
    const url = `http://127.0.0.1:8000/boats/${boatId}/short-analysis/pdf?start=${start}&end=${end}&is_captain=${isCaptain}`;
    window.open(url, '_blank');
});



export async function fetchData() {
    try {
        store.boats = await getBoats(); 

        store.employees = await getEmployees();

        renderTable();

        await loadDayData();

    } catch (error) {
        console.error(error);
    }
}


const syncDOMToState = (): void => {
  const rows = document.querySelectorAll('#attendance-list tr');

  for (const row of rows) {
    // SOS: Το data attribute που βάζεις στο checkbox σου είναι dataset.empId (γραμμή 61), όχι στη γραμμή (tr)!
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


const lockFormInputs = (): void => {
  const attendanceList = document.getElementById('attendance-list');
  const inputs = attendanceList?.querySelectorAll('input, select');
  
  if (inputs) {
    for (const input of inputs) {
      (input as HTMLInputElement | HTMLSelectElement).disabled = true;
    }
  }
};


const handleSortChange = (event: Event): void => {
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

sortSelect?.addEventListener('change', handleSortChange);


// Start App
fetchData();