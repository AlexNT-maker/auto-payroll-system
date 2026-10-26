import { getDashboardData } from "../api/dashboardApi";
import { API_URL } from "../config/api";
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

    const btnExport = document.getElementById("btn-export-full");
    btnExport?.addEventListener("click", () => {
        window.open(`${API_URL}/reports/full/pdf`, "_blank");
    });
}