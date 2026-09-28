const menuToggle = document.querySelector<HTMLButtonElement>("#menu-toggle")!;
const sidebar = document.querySelector<HTMLElement>("#sidebar")!;
const sidebarClose = document.querySelector<HTMLButtonElement>("#sidebar-close")!;
const sidebarOverlay = document.querySelector<HTMLDivElement>("#sidebar-overlay")!;

const materialsButton = document.querySelector<HTMLButtonElement>("#sidebar-materials")!;
const homeButton = document.querySelector<HTMLButtonElement>("#sidebar-home")!;
const settingsButton = document.querySelector<HTMLButtonElement>("#sidebar-settings")!;

const pageLoader = document.querySelector<HTMLDivElement>('#page-loader')!;

function navigateWithLoader(url: string): void {
    pageLoader.classList.remove("hidden");
    setTimeout(() => {
        window.location.href = url;
    }, 2500);
}

function openHomePage(): void      { navigateWithLoader("index.html"); }
function openMaterialsPage(): void { navigateWithLoader("materials.html"); }
function openSettingsPage(): void  { navigateWithLoader("settings.html"); }

function openSidebar(): void {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("visible");
}

function closeSidebar(): void {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("visible");
}

function hidePageLoader(): void {
    pageLoader.classList.add("hidden");
}

export function initSidebarEvents(): void {
    menuToggle.addEventListener("click", openSidebar);
    sidebarClose.addEventListener("click", closeSidebar);
    sidebarOverlay.addEventListener("click", closeSidebar);

    materialsButton.addEventListener('click', openMaterialsPage);
    homeButton.addEventListener('click', openHomePage);
    settingsButton.addEventListener('click', openSettingsPage);

    window.addEventListener("load", hidePageLoader);
}