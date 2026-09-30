import { Chart, registerables } from "chart.js";
import type { DashboardData } from "../api/dashboardApi";

Chart.register(...registerables);


const MONTHS_EL = [
    "Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου",
    "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου",
];

const MONTHS_NOM = [
    "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
    "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];

function formatCurrency(n: number): string {
    return n.toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatDateLong(d: Date): string {
    return `${d.getDate()} ${MONTHS_EL[d.getMonth()]} ${d.getFullYear()}`;
}

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return "Καλημέρα";
    if (h < 18) return "Καλησπέρα";
    return "Καλησπέρα";
}

const verticalLinePlugin = {
    id: "verticalLine",
    afterDatasetsDraw(chart: any) {
        if (!chart.tooltip?._active?.length) return;

        const { ctx, chartArea, scales } = chart;
        const x = chart.tooltip._active[0].element.x;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(5, 64, 122, 0.45)";
        ctx.stroke();
        ctx.restore();
    },
};

let dashboardChart: Chart | null = null;

export function renderDashboard(data: DashboardData): void {
    renderHeader();
    renderHero(data);
    renderStatus(data);
    renderBoatsRanking(data);
    renderChart(data);
}


function renderHeader(): void {
    const greetingEl = document.getElementById("dashboard-greeting");
    const dateEl = document.getElementById("dashboard-date");

    if (greetingEl) greetingEl.textContent = `${getGreeting()} 👋`;
    if (dateEl) dateEl.textContent = formatDateLong(new Date());
}


function renderHero(data: DashboardData): void {
    const [year, month] = data.month.split("-").map(Number);

    const monthLabel = document.getElementById("hero-month-label");
    const total = document.getElementById("hero-total");
    const delta = document.getElementById("hero-delta");
    const payroll = document.getElementById("hero-payroll");
    const materials = document.getElementById("hero-materials");
    const invoices = document.getElementById("hero-invoices");

    if (monthLabel) monthLabel.textContent = MONTHS_NOM[month - 1].toUpperCase();
    if (total) total.textContent = formatCurrency(data.total);
    if (payroll) payroll.textContent = formatCurrency(data.breakdown.employees);
    if (materials) materials.textContent = formatCurrency(data.breakdown.materials);
    if (invoices) invoices.textContent = formatCurrency(data.breakdown.invoices);

    if (delta) {
        if (data.prev_month_total === 0) {
            delta.innerHTML = `<span class="delta-neutral">— πρώτος μήνας</span>`;
        } else {
            const diff = data.total - data.prev_month_total;
            const pct = (diff / data.prev_month_total) * 100;
            const up = diff >= 0;
            const arrow = up ? "↑" : "↓";
            const cls = up ? "delta-up" : "delta-down";
            delta.innerHTML = `<span class="${cls}">${arrow} ${Math.abs(pct).toFixed(1)}% vs προηγούμενο μήνα</span>`;
        }
    }
}


function renderStatus(data: DashboardData): void {
    const card = document.getElementById("status-card");
    if (!card) return;

    const ok = data.today_status.attendance_recorded;

    card.innerHTML = `
        <div class="status-icon ${ok ? "status-ok" : "status-warn"}">
            ${ok ? "✅" : "⚠️"}
        </div>
        <div class="status-text">
            <strong>${ok ? "Έτοιμο για σήμερα" : "Εκκρεμεί καταχώρηση"}</strong>
            <p>${ok
                ? "Η καταχώρηση εργαζομένων ολοκληρώθηκε."
                : "Δεν έχει γίνει καταχώρηση εργαζομένων για σήμερα."}</p>
        </div>
    `;
}

function renderBoatsRanking(data: DashboardData): void {
    const container = document.getElementById("boats-ranking");
    if (!container) return;

    if (data.boats_ranking.length === 0 || data.boats_ranking.every((b) => b.total === 0)) {
        container.innerHTML = `<div class="boats-empty">Δεν υπάρχουν δεδομένα για φέτος.</div>`;
        return;
    }

    const max = Math.max(...data.boats_ranking.map((b) => b.total));

    container.innerHTML = data.boats_ranking
        .map((b, idx) => {
            const pct = max > 0 ? (b.total / max) * 100 : 0;
            return `
                <div class="boat-rank-row">
                    <div class="boat-rank-num">${idx + 1}</div>
                    <div class="boat-rank-body">
                        <div class="boat-rank-name">
                            <span>${b.boat_name}</span>
                            <strong>${formatCurrency(b.total)}</strong>
                        </div>
                        <div class="boat-rank-bar"><div style="width:${pct}%"></div></div>
                    </div>
                </div>
            `;
        })
        .join("");
}

function renderChart(data: DashboardData): void {
    const canvas = document.getElementById("dashboard-chart") as HTMLCanvasElement | null;
    if (!canvas) return;

    // Destroy previous instance
    if (dashboardChart) dashboardChart.destroy();

    const labels = data.daily_trend.map((p) => {
        const d = new Date(p.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    dashboardChart = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Μισθοδοσία",
                    data: data.daily_trend.map((p) => p.payroll),
                    borderColor: "#05407a",
                    backgroundColor: "rgba(5, 64, 122, 0.10)",
                    borderWidth: 2.5,
                    tension: 0.35,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#05407a",
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 2,
                    fill: true,
                },
                {
                    label: "Υλικά",
                    data: data.daily_trend.map((p) => p.materials),
                    borderColor: "rgba(5, 64, 122, 0.55)",
                    backgroundColor: "transparent",
                    borderWidth: 2,
                    borderDash: [6, 4],
                    tension: 0.35,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(5, 64, 122, 0.75)",
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 2,
                    fill: false,
                },
                {
                    label: "Τιμολόγια",
                    data: data.daily_trend.map((p) => p.invoices),
                    borderColor: "rgba(5, 64, 122, 0.30)",
                    backgroundColor: "transparent",
                    borderWidth: 2,
                    borderDash: [2, 4],
                    tension: 0.35,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(5, 64, 122, 0.55)",
                    pointHoverBorderColor: "#ffffff",
                    pointHoverBorderWidth: 2,
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        boxWidth: 8,
                        padding: 16,
                        font: { size: 12, family: "Arial" },
                        color: "#1f2937",
                    },
                },
                tooltip: {
                    backgroundColor: "#111827",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    titleFont: { size: 12, weight: "bold" },
                    bodyFont: { size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    boxPadding: 6,
                    callbacks: {
                        label: (ctx) =>
                            ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y as number)}`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#9ca3af",
                        font: { size: 11 },
                        maxRotation: 0,
                        autoSkipPadding: 20,
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(148, 163, 184, 0.15)" },
                    ticks: {
                        color: "#9ca3af",
                        font: { size: 11 },
                        callback: (v: any) => `${v} €`,
                    },
                },
            },
        },
        plugins: [verticalLinePlugin],
    });
}