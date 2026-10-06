import type { Supplier, NamedItem, NamedItemType } from "../models/settings";
import { API_URL } from "../config/api";

const BASE_URL = API_URL;

type SupplierPayload = {
    name: string;
    afm: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
};


export async function getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${BASE_URL}/suppliers/`);
    if (!res.ok) throw new Error("Failed to fetch suppliers");
    return res.json();
}

export async function createSupplier(supplier: SupplierPayload): Promise<Supplier> {
    const res = await fetch(`${BASE_URL}/suppliers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier)
    });
    if (!res.ok) throw new Error("Failed to create supplier");
    return res.json();
}

export async function updateSupplier(id: number, supplier: SupplierPayload): Promise<Supplier> {
    const res = await fetch(`${BASE_URL}/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier)
    });
    if (!res.ok) throw new Error("Failed to update supplier");
    return res.json();
}

export async function deleteSupplier(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/suppliers/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete supplier");
}


export async function getNamedItems(type: NamedItemType): Promise<NamedItem[]> {
    const res = await fetch(`${BASE_URL}/${type}/`);
    if (!res.ok) throw new Error(`Failed to fetch ${type}`);
    return res.json();
}

export async function createNamedItem(type: NamedItemType, name: string): Promise<NamedItem> {
    const res = await fetch(`${BASE_URL}/${type}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error(`Failed to create ${type}`);
    return res.json();
}

export async function updateNamedItem(type: NamedItemType, id: number, name: string): Promise<NamedItem> {
    const res = await fetch(`${BASE_URL}/${type}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error(`Failed to update ${type}`);
    return res.json();
}

export async function deleteNamedItem(type: NamedItemType, id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/${type}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete ${type}`);
}