const menuToggle = document.querySelector<HTMLButtonElement>("#menu-toggle")!;

const sidebar = document.querySelector<HTMLElement>("#sidebar")!;

const sidebarClose = document.querySelector<HTMLButtonElement>("#sidebar-close")!;

const sidebarOverlay = document.querySelector<HTMLDivElement>("#sidebar-overlay")!;



const materialsButton =
    document.querySelector<HTMLButtonElement>("#sidebar-materials")!;

materialsButton.addEventListener("click", () => {
    document.body.classList.add("page-transition");

    setTimeout(() => {
        window.location.href = "materials.html";
    }, 600);
});


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
}

