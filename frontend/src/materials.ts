import { fetchData } from "./services/appLoader";
import { renderMaterialsList } from "./ui/renderMaterialsList";
import { initMaterialEvents, attachMaterialListeners } from "./handlers/materialEvents";
import { initMessageModal } from "./utils/messageModal";
import { initMaterialUsageEvents, initUsageFilters } from "./handlers/materialsUsageEvents";
import { renderMaterialUsagesList } from "./ui/renderMaterialUsageList";
import { renderShell } from "./ui/renderShell";
import { initShellEvents } from "./handlers/shellEvents";

// -- Internal pages --
type PageKey = "usage" | "priceList" | "invoices" | "report" | "fullReport";

const pages: Record<PageKey, HTMLElement> = {
    usage:      document.getElementById("page-usage")!,
    priceList:  document.getElementById("page-price-list")!,
    invoices:   document.getElementById("page-invoices")!,
    report:     document.getElementById("page-report")!,
    fullReport: document.getElementById("page-full-report")!,
};

const HASH_MAP: Record<string, PageKey> = {
    "":             "usage",        // ← default = Καταχώρηση
    "usage":        "usage",
    "price-list":   "priceList",
    "invoices":     "invoices",
    "report":       "report",
    "full-report":  "fullReport",
};

// -- Navigation --
function navigateTo(pageKey: PageKey): void {
    Object.values(pages).forEach(p => p.classList.add("hidden"));
    pages[pageKey].classList.remove("hidden");

    const hash = pageKey === "usage" ? "" : `#${pageKey === "priceList" ? "price-list" : pageKey === "fullReport" ? "full-report" : pageKey}`;
    if (window.location.hash !== hash) {
        history.replaceState(null, '', hash || window.location.pathname);
    }

    if (pageKey === "usage") {
        initUsageFilters();
        renderMaterialUsagesList();
    }
}

function handleHashChange(): void {
    const hash = window.location.hash.replace("#", "");
    const pageKey = HASH_MAP[hash] ?? "usage";
    navigateTo(pageKey);
}

window.addEventListener("hashchange", handleHashChange);

// -- Init --
async function initApp(): Promise<void> {
    renderShell();
    initShellEvents();

    await fetchData();

    renderMaterialsList();
    attachMaterialListeners();

    initMaterialEvents();
    initMaterialUsageEvents();
    initMessageModal();

    handleHashChange();
}

initApp();