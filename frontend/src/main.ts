import { renderBoatsList } from "./ui/renderBoatList";
import { renderEmployeesList } from "./ui/renderEmployeesList";
import { initEmployeeEvents } from "./handlers/employeeEvents";
import { initBoatEvents } from "./handlers/boatEvents";
import { initPayrollEvents, initPayrollPage } from "./handlers/payrollEvents";
import { initShortAnalysisEvents, initShortAnalysisPage } from "./handlers/shortAnalysisEvents";
import { fetchData } from "./services/appLoader";
import { initMessageModal } from "./utils/messageModal";
import { initAttendanceEvents, loadDayData } from "./handlers/attendanceEvents";
import { renderShell } from "./ui/renderShell";
import { initShellEvents } from "./handlers/shellEvents";
import { initDashboard } from "./handlers/dashboardEvents";

// -- Date picker default --
const datePicker = document.querySelector<HTMLInputElement>('#date-picker');
if (datePicker) datePicker.valueAsDate = new Date();

// -- Internal pages --
type PageName = 'dashboard' | 'home' | 'employees' | 'boats' | 'shortAnalysis' | 'payments';

const pages: Record<PageName, HTMLElement> = {
    dashboard:     document.getElementById('page-dashboard')!,
    home:          document.getElementById('page-home')!,
    employees:     document.getElementById('page-employees')!,
    boats:         document.getElementById('page-boats')!,
    shortAnalysis: document.getElementById('page-short-analysis')!,
    payments:      document.getElementById('page-payments')!,
};

const HASH_MAP: Record<string, PageName> = {
    "":               "dashboard",
    "dashboard":      "dashboard",
    "home":           "home",
    "employees":      "employees",
    "boats":          "boats",
    "short-analysis": "shortAnalysis",
    "payments":       "payments",
};

// -- Navigation --
function navigateTo(pageName: PageName): void {
    Object.values(pages).forEach(page => page.classList.add('hidden'));
    pages[pageName].classList.remove('hidden');

    const hash = pageName === 'dashboard'
        ? ''
        : `#${pageName === 'shortAnalysis' ? 'short-analysis' : pageName}`;

    if (window.location.hash !== hash) {
        history.replaceState(null, '', hash || window.location.pathname);
    }

    if (pageName === 'employees')     renderEmployeesList();
    if (pageName === 'boats')         renderBoatsList();
    if (pageName === 'payments')      initPayrollPage();
    if (pageName === 'shortAnalysis') initShortAnalysisPage();
    if (pageName === 'dashboard') initDashboard();
}

function handleHashChange(): void {
    const hash = window.location.hash.replace('#', '');
    const pageName = HASH_MAP[hash] ?? 'dashboard';
    navigateTo(pageName);
}

window.addEventListener('hashchange', handleHashChange);

// -- Init --
async function initApp(): Promise<void> {
    renderShell();
    initShellEvents();

    await fetchData();
    await loadDayData();
    renderEmployeesList();

    initAttendanceEvents();
    initEmployeeEvents();
    initBoatEvents();
    initPayrollEvents();
    initShortAnalysisEvents();
    initMessageModal();

    handleHashChange();
}

initApp();