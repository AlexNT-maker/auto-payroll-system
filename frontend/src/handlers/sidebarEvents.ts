const menuToggle = document.querySelector<HTMLButtonElement>("#menu-toggle")!;

const sidebar = document.querySelector<HTMLElement>("#sidebar")!;

const sidebarClose = document.querySelector<HTMLButtonElement>("#sidebar-close")!;

const sidebarOverlay = document.querySelector<HTMLDivElement>("#sidebar-overlay")!;



const materialsButton = document.querySelector<HTMLButtonElement>("#sidebar-materials")!;
const pageLoader = document.querySelector<HTMLDivElement>('#page-loader')!;

function openMaterialsPage(): void {
pageLoader.classList.remove("hidden");
    setTimeout(() => {
        window.location.href = "materials.html";
    }, 2500);
};


function openSidebar(): void {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("visible");
}

function closeSidebar(): void {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("visible");
}


export function initSidebarEvents(): void {
    menuToggle.addEventListener("click", openSidebar);
    sidebarClose.addEventListener("click", closeSidebar);
    sidebarOverlay.addEventListener("click", closeSidebar);
    materialsButton.addEventListener('click', openMaterialsPage);
}

