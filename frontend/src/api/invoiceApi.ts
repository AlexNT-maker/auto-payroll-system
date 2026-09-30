import type { Invoice } from "../models/invoice";

const BASE_URL = "http://127.0.0.1:8000/invoices";

type InvoicePayload = {
    date: string;
    amount: number;
    supplier_id: number;
    boat_id: number;
};

export async function getInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${BASE_URL}/`);
    if (!response.ok) throw new Error("Failed to fetch invoices");
    return response.json();
}

export async function createInvoice(inv: InvoicePayload): Promise<Invoice> {
    const response = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inv)
    });
    if (!response.ok) throw new Error("Failed to create invoice");
    return response.json();
}

export async function updateInvoice(id: number, inv: InvoicePayload): Promise<Invoice> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inv)
    });
    if (!response.ok) throw new Error("Failed to update invoice");
    return response.json();
}

export async function deleteInvoice(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete invoice");
}