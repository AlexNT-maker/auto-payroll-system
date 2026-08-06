import { store } from "../state/store";


const btnRunAnalysis = document.querySelector<HTMLButtonElement>('#btn-run-analysis')!;
const inputStart = document.querySelector<HTMLInputElement>('#analysis-start')!;
const inputEnd = document.querySelector<HTMLInputElement>('#analysis-end')!;
const resultsDiv = document.querySelector<HTMLDivElement>('#analysis-results')!;
const totalCostSpan = document.querySelector<HTMLSpanElement>('#total-cost')!;
const analysisListBody = document.querySelector<HTMLTableSectionElement>('#analysis-list')!;
const analysisTitle = document.querySelector<HTMLHeadingElement>('#analysis-title')!;
const btnPrintBoatPdf = document.querySelector<HTMLButtonElement>('#btn-print-boat-pdf')!
const modalAnalysis = document.querySelector<HTMLDivElement>('#modal-boat-analysis')!;
const btnCloseAnalysis = document.querySelector<HTMLButtonElement>('#btn-close-analysis')!;





let currentAnalysisBoatId: number | null = null;

export function initBoatAnalysisEvents(){
    btnRunAnalysis.addEventListener('click', handleBoatAnalysis);
    btnPrintBoatPdf.addEventListener('click', printBoatPdf);
    btnCloseAnalysis.addEventListener('click', closeAnalysisModal);
}


function printBoatPdf() {
        if (!currentAnalysisBoatId) return;
        const start = inputStart.value;
        const end = inputEnd.value;
        const url = `http://127.0.0.1:8000/boats/${currentAnalysisBoatId}/analysis/pdf?start=${start}&end=${end}`;
        window.open(url, '_blank');
    }

async function handleBoatAnalysis() {
        if (!currentAnalysisBoatId) return;
        
        const start = inputStart.value;
        const end = inputEnd.value;
    
        if (!start || !end) {
            alert("Παρακαλώ επιλέξτε ημερομηνίες.");
            return;
        }
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/boats/${currentAnalysisBoatId}/analysis?start=${start}&end=${end}`);
            
            if (response.ok) {
                const data = await response.json();
                
                analysisTitle.textContent = `Ανάλυση: ${data.boat_name}`;
                totalCostSpan.textContent = `${data.total_cost.toFixed(2)} €`;
    
                analysisListBody.innerHTML = ''; 
                
                data.analysis_data.forEach((item: any) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.date}</td>
                        <td>${item.employee_name}</td>
                        <td style="font-weight: bold;">${item.total_cost.toFixed(2)} €</td>
                    `;
                    analysisListBody.appendChild(row);
                });
    
                resultsDiv.classList.remove('hidden');
                btnPrintBoatPdf.classList.remove('hidden');
    
            } else {
                alert("Σφάλμα κατά τη λήψη δεδομένων.");
            }
        } catch (error) {
            console.error(error);
            alert("Σφάλμα σύνδεσης.");
        }
    }
    

 export function openAnalysisModal(boatId: number){
   currentAnalysisBoatId = boatId;
  const boat = store.boats.find(b => b.id === boatId);
    analysisTitle.textContent = `Ανάλυση: ${boat ? boat.name : ''}`;

    const now = new Date() ;
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() +1, 0) ;
    inputStart.valueAsDate = firstDay; 
    inputEnd.valueAsDate = lastDay;

    btnPrintBoatPdf.classList.add('hidden');
    resultsDiv.classList.add('hidden'); 
    modalAnalysis.classList.remove('hidden');
}

 function closeAnalysisModal() {
  modalAnalysis.classList.add('hidden');
}