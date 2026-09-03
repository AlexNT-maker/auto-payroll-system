import { fetchData } from "./services/appLoader";
import { renderMaterialsList } from "./ui/renderMaterialsList";
import { initMaterialEvents, 
    attachMaterialListeners
 } from "./handlers/materialEvents";
import { initSidebarEvents } from "./handlers/sidebarEvents";
import { initMessageModal } from "./utils/messageModal";

async function initApp() {
    await fetchData();

    renderMaterialsList();
    attachMaterialListeners();

    initSidebarEvents();
    initMaterialEvents();
    initMessageModal();
}

initApp();