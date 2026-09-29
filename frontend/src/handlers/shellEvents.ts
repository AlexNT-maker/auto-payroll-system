const pageLoader = document.querySelector<HTMLDivElement>("#page-loader")!;
const sidebar = document.querySelector<HTMLElement>("#sidebar")!;
const sidebarOverlay = document.querySelector<HTMLDivElement>("#sidebar-overlay")!;

const LOADER_DURATION = 700;

// ============================================================
// PUBLIC
// ============================================================

export function initShellEvents(): void {
    initGlobalClickHandler();
    hideLoaderOnLoad();
}

// ============================================================
// GLOBAL CLICK — delegation γιατί το sidebar/topbar re-render
// ============================================================

function initGlobalClickHandler(): void {
    document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;

        // 1) Hamburger (topbar re-render → delegation)
        if (target.id === "menu-toggle" || target.closest("#menu-toggle")) {
            openSidebar();
            return;
        }

        // 2) Close button (sidebar-close)
        if (target.classList.contains("sidebar-close")) {
            closeSidebar();
            return;
        }

        // 3) Overlay click
        if (target.id === "sidebar-overlay") {
            closeSidebar();
            return;
        }

        // 4) Sidebar item navigation (delegation — το κλειδί!)
        const item = target.closest<HTMLButtonElement>(".sidebar-item");
        if (item) {
            const href = item.dataset.href;
            if (href) navigateWithLoader(href);
            return;
        }
    });
}

// ============================================================
// NAVIGATION
// ============================================================

function navigateWithLoader(href: string): void {
    const [path, hash] = href.split("#");
    const currentFile = window.location.pathname.split("/").pop() || "index.html";

    // Ίδια σελίδα → μόνο hash change (χωρίς reload, χωρίς loader)
    const isSamePage =
        path === "" ||
        path === currentFile ||
        path === `/${currentFile}` ||
        path === currentFile.replace(/\.html$/, "");

    if (isSamePage) {
        const newHash = hash ? `#${hash}` : "";
        if (window.location.hash !== newHash) {
            history.pushState(null, "", newHash || window.location.pathname);
            window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
        return;
    }

    // Διαφορετική σελίδα → loader + redirect
    pageLoader?.classList.remove("hidden");
    setTimeout(() => {
        window.location.href = href;
    }, LOADER_DURATION);
}

// ============================================================
// SIDEBAR (mobile)
// ============================================================

function openSidebar(): void {
    sidebar?.classList.add("open");
    sidebarOverlay?.classList.add("visible");
}

function closeSidebar(): void {
    sidebar?.classList.remove("open");
    sidebarOverlay?.classList.remove("visible");
}

// ============================================================
// LOADER
// ============================================================

function hideLoaderOnLoad(): void {
    window.addEventListener("load", () => {
        pageLoader?.classList.add("hidden");
    });
}