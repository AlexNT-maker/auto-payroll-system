export interface NavItem {
    id: string;
    label: string;
    href: string;
}

export interface NavCategory {
    label: string;
    items: NavItem[];
}

export type NavEntry = NavItem | NavCategory;

export interface PageMeta {
    activeId: string;
    title: string;
}

export const SIDEBAR_CONFIG: NavEntry[] = [
    { id: "nav-home", label: "Αρχική", href: "index.html" },

    {
        label: "Καταχωρήσεις",
        items: [
            { id: "nav-attendance", label: "Ημερήσια εργαζομένων", href: "index.html#home" },
            { id: "nav-materials",  label: "Υλικά και αποθήκη",    href: "materials.html#usage" },
            { id: "nav-invoices",   label: "Τιμολόγια",            href: "materials.html#invoices" },
        ],
    },

    {
        label: "Αναφορές",
        items: [
            { id: "nav-rep-employees", label: "Αναφορά εργαζομένων", href: "index.html#short-analysis" },
            {id: "nav-edit-boats", label: "Σκαφών", href: "index.html#boats"},
            { id: "nav-rep-materials", label: "Αναφορά υλικών",      href: "materials.html#report" },
            { id: "nav-rep-full",      label: "Πλήρες αναφορά",      href: "materials.html#full-report" },
        ],
    },

    {
        label: "Επεξεργασία δεδομένων",
        items: [
            { id: "nav-edit-employees", label: "Εργαζομένων", href: "index.html#employees" },
            { id: "nav-edit-materials", label: "Υλικών",       href: "materials.html#price-list" },
            { id: "nav-settings",       label: "Σταθερές",     href: "settings.html" },
        ],
    },

    {
        label: "Πληρωμές",
        items: [
            { id: "nav-payroll", label: "Υπολογισμός μισθοδοσίας", href: "index.html#payments" },
        ],
    },
];

export const ROUTE_META: Record<string, PageMeta> = {
    // ---------- index.html ----------
    "/index.html":                { activeId: "nav-home",           title: "Αρχική" },
    "/index.html#dashboard":      { activeId: "nav-home",           title: "Αρχική" },
    "/index.html#home":           { activeId: "nav-attendance",     title: "Ημερήσια εργαζομένων" },
    "/index.html#employees":      { activeId: "nav-edit-employees", title: "Διαχείριση εργαζομένων" },
    "/index.html#boats":          { activeId: "nav-edit-boats", title: "Διαχείριση Σκαφών" },
    "/index.html#short-analysis": { activeId: "nav-rep-employees",  title: "Αναφορά εργαζομένων" },
    "/index.html#payments":       { activeId: "nav-payroll",        title: "Μισθοδοσία & Πληρωμές" },

    // ---------- materials.html ----------
    "/materials.html":               { activeId: "nav-materials",      title: "Υλικά και αποθήκη" },
    "/materials.html#usage":         { activeId: "nav-materials",      title: "Καταχώρηση Υλικών" },
    "/materials.html#price-list":    { activeId: "nav-edit-materials", title: "Τιμοκατάλογος Υλικών" },
    "/materials.html#invoices":      { activeId: "nav-invoices",       title: "Καταχώρηση Τιμολογίων" },
    "/materials.html#report":        { activeId: "nav-rep-materials",  title: "Αναφορά Υλικών" },
    "/materials.html#full-report":   { activeId: "nav-rep-full",       title: "Πλήρης Αναφορά" },

    "/settings.html": { activeId: "nav-settings", title: "Σταθερές" },
};

export const DEFAULT_META: PageMeta = { activeId: "", title: "Auto Payroll" };