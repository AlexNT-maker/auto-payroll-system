import {
    SIDEBAR_CONFIG,
    ROUTE_META,
    DEFAULT_META,
    type NavEntry,
    type NavItem,
    type NavCategory,
    type PageMeta,
} from "../config/navigation";

// ============================================================
// PUBLIC
// ============================================================

export function renderShell(): void {
    updateShell();

    // Re-render topbar + sidebar active state when hash changes
    window.addEventListener("hashchange", updateShell);
}

// ============================================================
// INTERNAL
// ============================================================

function updateShell(): void {
    const meta = detectRouteMeta();
    renderSidebarInto(meta);
    renderTopbarInto(meta);
}

function detectRouteMeta(): PageMeta {
    const path = window.location.pathname;
    const hash = window.location.hash;

    // Try exact match: path + hash (e.g. "/index.html#employees")
    const full = path + hash;
    if (ROUTE_META[full]) return ROUTE_META[full];

    // Try path only (e.g. "/index.html")
    if (ROUTE_META[path]) return ROUTE_META[path];

    // Try by filename alone (in case Vite serves from different path)
    const file = path.split("/").pop() || "index.html";
    const byFile = "/" + file;
    if (ROUTE_META[byFile + hash]) return ROUTE_META[byFile + hash];
    if (ROUTE_META[byFile]) return ROUTE_META[byFile];

    return DEFAULT_META;
}

// ============================================================
// SIDEBAR
// ============================================================

function renderSidebarInto(meta: PageMeta): void {
    const menu = document.querySelector<HTMLDivElement>(".sidebar-menu");
    if (!menu) return;

    menu.innerHTML = SIDEBAR_CONFIG.map((entry) =>
        isCategory(entry)
            ? renderCategory(entry, meta.activeId)
            : renderItem(entry, meta.activeId)
    ).join("");
}

function renderCategory(cat: NavCategory, activeId: string): string {
    return `
        <div class="sidebar-category">
            <div class="sidebar-category-label">${cat.label}</div>
            <div class="sidebar-category-items">
                ${cat.items.map((item) => renderItem(item, activeId)).join("")}
            </div>
        </div>
    `;
}

function renderItem(item: NavItem, activeId: string): string {
    const isActive = item.id === activeId;
    return `
        <button class="sidebar-item ${isActive ? "sidebar-item-active" : ""}"
                id="${item.id}"
                data-href="${item.href}"
                type="button">
            ${item.label}
        </button>
    `;
}


function renderTopbarInto(meta: PageMeta): void {
    const topbar = document.querySelector<HTMLElement>(".topbar");
    if (!topbar) return;

    topbar.innerHTML = `
        <button id="menu-toggle" class="menu-toggle" type="button" aria-label="Άνοιγμα μενού">☰</button>
        <div class="topbar-title">${meta.title}</div>
        <div class="topbar-spacer"></div>
    `;
}



function isCategory(entry: NavEntry): entry is NavCategory {
    return "items" in entry;
}