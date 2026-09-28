export interface Supplier {
    id: number;
    name: string;
    afm: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
}

export interface NamedItem {
    id: number;
    name: string;
}

export type NamedItemType = "invoice-categories" | "material-units" | "material-categories";