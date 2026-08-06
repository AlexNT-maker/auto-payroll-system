import { renderBoatsList } from "./ui/renderBoatList";
import { renderEmployeesList } from "./ui/renderEmployeesList";
import { initEmployeeEvents } from "./handlers/employeeEvents";
import { initBoatAnalysisEvents } from "./handlers/boatAnalysisEvents";
import { initBoatEvents } from "./handlers/boatEvents";
import {
    initExpensesEvents,
    initExpensesPage,
} from "./handlers/expenseEvents"
import { 
    initPayrollEvents,
    initPayrollPage
 } from "./handlers/payrollEvents";
import { 
    initShortAnalysisEvents,
    initShortAnalysisPage } from "./handlers/shortAnalysisEvents";
import { fetchData } from "./services/appLoader";

const datePicker = document.querySelector<HTMLInputElement>('#date-picker')!;
datePicker.valueAsDate = new Date();

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

navButtons.home.addEventListener('click',() => navigateTo('home'));
navButtons.employees.addEventListener('click',() => navigateTo('employees'));
navButtons.boats.addEventListener('click',() => navigateTo('boats'));
navButtons.expenses.addEventListener('click',() => navigateTo('expenses'));
navButtons.payments.addEventListener('click', () => navigateTo('payments'));
navButtons.shortAnalysis.addEventListener('click', () => navigateTo('shortAnalysis'));


renderEmployeesList();

initEmployeeEvents();

initBoatEvents();

initBoatAnalysisEvents();

initExpensesEvents();

initPayrollEvents();

initShortAnalysisEvents();

// Start App
fetchData();