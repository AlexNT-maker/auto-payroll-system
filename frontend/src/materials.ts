import { fetchData } from "./services/appLoader";
import { renderMaterialsList } from "./ui/renderMaterialsList";
import { initMaterialEvents, 
    attachMaterialListeners
 } from "./handlers/materialEvents";
import { initSidebarEvents } from "./handlers/sidebarEvents";
import { initMessageModal } from "./utils/messageModal";
import { initMaterialUsageEvents,
    initUsageFilters
 } from "./handlers/materialsUsageEvents";
import { renderMaterialUsagesList } from "./ui/renderMaterialUsageList";


const pages = {
    priceList: document.querySelector<HTMLDivElement>("#page-price-list")!,
    usage:     document.querySelector<HTMLDivElement>("#page-usage")!,
    report:    document.querySelector<HTMLDivElement>("#page-report")!,
};

const navBtns = {
    priceList: document.querySelector<HTMLButtonElement>("#nav-home")!,
    usage:     document.querySelector<HTMLButtonElement>("#nav-employees")!,
    report:    document.querySelector<HTMLButtonElement>("#nav-boats")!,
};

function navigateTo(page: "priceList" | "usage" | "report"): void {
    Object.values(pages).filter((p): p is HTMLDivElement => p !== null)
    .forEach((p) => p.classList.add("hidden"));
    pages[page].classList.remove("hidden");

    Object.values(navBtns).forEach((b) => b.classList.remove("active"));
    navBtns[page].classList.add("active");

    if (page === "usage") {
        initUsageFilters(); 
        renderMaterialUsagesList();
    }   
}

navBtns.priceList.addEventListener("click", () => navigateTo("priceList"));
navBtns.usage.addEventListener("click",     () => navigateTo("usage"));
navBtns.report.addEventListener("click",    () => navigateTo("report"));


async function initApp() {
    await fetchData();

    renderMaterialsList();
    attachMaterialListeners();

    initSidebarEvents();
    initMaterialEvents();
    initMaterialUsageEvents();
    initMessageModal();
}

initApp();