import { getDashboardData } from "../api/dashboardApi";
import { renderDashboard } from "../ui/renderDashboard";
import { showMessageModal } from "../utils/messageModal";

export async function initDashboard(): Promise<void> {
    try {
        const data = await getDashboardData();
        renderDashboard(data);
    } catch (err) {
        console.error(err);
        showMessageModal("Σφάλμα", "Δεν ήταν δυνατή η φόρτωση του dashboard.", "error");
    }

    // Export full report
    const btnExport = document.getElementById("btn-export-full");
    btnExport?.addEventListener("click", () => {
        window.open("http://127.0.0.1:8000/reports/full/pdf", "_blank");
    });
}