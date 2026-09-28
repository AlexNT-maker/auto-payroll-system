import { fetchData } from "./services/appLoader";
import {
    renderSuppliersList,
    renderNamedItemsList
} from "./ui/renderSettingsList";
import { initSettingsEvents } from "./handlers/settingsEvents";
import { initSidebarEvents } from "./handlers/sidebarEvents";
import { initMessageModal } from "./utils/messageModal";


type TabId = "suppliers" | "invoice-categories" | "material-units" | "material-categories";

function showSettingsTab(tabId: TabId, btn: HTMLButtonElement): void {
    document.querySelectorAll(".settings-panel").forEach(p => p.classList.add("hidden"));
    document.querySelectorAll(".settings-tab").forEach(b => b.classList.remove("active"));

    document.getElementById("tab-" + tabId)!.classList.remove("hidden");
    btn.classList.add("active");

    if (tabId === "suppliers") renderSuppliersList();
    else renderNamedItemsList(tabId);
}

(window as any).showSettingsTab = showSettingsTab;


async function initApp(): Promise<void> {
    await fetchData();

    renderSuppliersList();

    initSidebarEvents();
    initSettingsEvents();
    initMessageModal();
}

initApp();