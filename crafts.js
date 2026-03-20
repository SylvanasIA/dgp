// Helper formatters
const fmt = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (num) => num.toLocaleString('en-US');

const recipeId = window.location.pathname.split('/').pop().replace('.html', '') || 'unknown_recipe';

let currentCalculation = {
    quantity: 0,
    obtained: 0,
    investment: 0,
    savings: 0,
    profit: 0
};

const craftElements = {
    quantityInput: document.getElementById('craft-quantity'),
    obtainedQuantityInput: document.getElementById('obtained-quantity'),
    sellPriceInput: document.getElementById('sell-price'),
    matInputs: document.querySelectorAll('.mat-input'),
    savedMatInputs: document.querySelectorAll('.saved-mat-input'),
    
    // Displays
    costPerUnit: document.getElementById('cost-per-unit'),
    displayQuantity: document.getElementById('display-quantity'),
    totalInvestment: document.getElementById('total-investment'),
    
    displayObtained: document.getElementById('display-obtained'),
    grossRevenue: document.getElementById('gross-revenue'),
    ahCut: document.getElementById('ah-cut'),
    resourcefulnessSavings: document.getElementById('resourcefulness-savings'),
    netRevenue: document.getElementById('net-revenue'),
    netProfit: document.getElementById('net-profit')
};

// Auto-sync obtained with crafted ONLY when user types in crafted, 
// and if they haven't manually decoupled them.
let manualObtained = false;

if (craftElements.obtainedQuantityInput) {
    craftElements.obtainedQuantityInput.addEventListener('input', () => {
        manualObtained = true;
    });
}

function updateCraftUI() {
    const quantity = parseInt(craftElements.quantityInput.value) || 1;
    let obtainedQuantity = quantity;
    
    if (craftElements.obtainedQuantityInput) {
        if (!manualObtained && document.activeElement === craftElements.quantityInput) {
            // Auto-sync if typing in quantity and hasn't manually touched obtained
            craftElements.obtainedQuantityInput.value = quantity;
        }
        obtainedQuantity = parseInt(craftElements.obtainedQuantityInput.value) || quantity;
    }
    
    const sellPrice = parseFloat(craftElements.sellPriceInput.value) || 0;
    
    // Calculate cost per unit based on materials
    let unitCost = 0;
    
    // Use a Map to easily look up mat prices for resourcefulness savings
    const currentMatPrices = new Map();
    
    craftElements.matInputs.forEach(input => {
        const matPrice = parseFloat(input.value) || 0;
        const requiredQty = parseInt(input.dataset.qty) || 0;
        unitCost += (matPrice * requiredQty);
        
        currentMatPrices.set(input.id, matPrice);
        
        // Save individual mat prices
        localStorage.setItem(`mat_${input.id}`, matPrice);
    });
    
    // Calculate Resourcefulness Savings
    let savingsTotal = 0;
    craftElements.savedMatInputs.forEach(input => {
        const savedQty = parseInt(input.value) || 0;
        const linkedMatId = input.dataset.mat;
        const matPrice = currentMatPrices.get(linkedMatId) || 0;
        
        savingsTotal += (savedQty * matPrice);
        localStorage.setItem(`saved_${input.id}`, savedQty);
    });

    // Investment (Based on what you attempt to craft)
    const totalInvestment = unitCost * quantity;
    
    // Revenue (Based on what you actually obtain, multicraft procs)
    const grossRevenue = sellPrice * obtainedQuantity;
    const ahCut = grossRevenue * 0.05; // 5% AH Cut
    
    // Net Revenue now includes the gold value of materials you saved/didn't consume
    const netRevenue = grossRevenue - ahCut + savingsTotal;
    
    // Profit
    const netProfit = netRevenue - totalInvestment;

    // Formatters are now global

    // Update UI
    if (craftElements.costPerUnit) craftElements.costPerUnit.textContent = fmt(unitCost);
    if (craftElements.displayQuantity) craftElements.displayQuantity.textContent = fmtInt(quantity);
    if (craftElements.totalInvestment) craftElements.totalInvestment.textContent = fmt(totalInvestment);
    
    if (craftElements.displayObtained) craftElements.displayObtained.textContent = fmtInt(obtainedQuantity);
    if (craftElements.grossRevenue) craftElements.grossRevenue.textContent = fmt(grossRevenue);
    if (craftElements.ahCut) craftElements.ahCut.textContent = `-${fmt(ahCut)}`;
    
    if (craftElements.resourcefulnessSavings) {
        craftElements.resourcefulnessSavings.textContent = `+${fmt(savingsTotal)}`;
    }
    
    if (craftElements.netRevenue) craftElements.netRevenue.textContent = fmt(netRevenue);
    
    if (craftElements.netProfit) {
        craftElements.netProfit.textContent = fmt(netProfit);
        // Change color based on profit/loss
        if (netProfit > 0) {
            craftElements.netProfit.style.color = 'var(--accent-blue)';
        } else if (netProfit < 0) {
            craftElements.netProfit.style.color = 'rgba(255, 100, 100, 0.9)'; // Red for loss
        } else {
            craftElements.netProfit.style.color = 'var(--text-main)';
        }
    }

    // Save main settings
    localStorage.setItem('craftQuantity', quantity);
    if (manualObtained) localStorage.setItem('craftObtained', obtainedQuantity);
    localStorage.setItem('craftSellPrice', sellPrice);

    // Save calculation state for ledger
    currentCalculation = {
        quantity: quantity,
        obtained: obtainedQuantity,
        investment: totalInvestment,
        savings: savingsTotal,
        profit: netProfit
    };
}

// Event Listeners
craftElements.quantityInput?.addEventListener('input', () => {
    if(!manualObtained && craftElements.obtainedQuantityInput) {
        craftElements.obtainedQuantityInput.value = craftElements.quantityInput.value;
    }
    updateCraftUI();
});
craftElements.obtainedQuantityInput?.addEventListener('input', updateCraftUI);
craftElements.sellPriceInput?.addEventListener('input', updateCraftUI);
craftElements.matInputs.forEach(input => {
    input.addEventListener('input', updateCraftUI);
});
craftElements.savedMatInputs.forEach(input => {
    input.addEventListener('input', updateCraftUI);
});

function initCrafts() {
    // Load saved settings
    const savedQty = localStorage.getItem('craftQuantity');
    const savedObtained = localStorage.getItem('craftObtained');
    const savedSell = localStorage.getItem('craftSellPrice');
    
    if (savedQty && craftElements.quantityInput) craftElements.quantityInput.value = savedQty;
    if (savedObtained && craftElements.obtainedQuantityInput) {
        craftElements.obtainedQuantityInput.value = savedObtained;
        manualObtained = true;
    } else if (savedQty && craftElements.obtainedQuantityInput) {
        craftElements.obtainedQuantityInput.value = savedQty;
    }
    
    if (savedSell && craftElements.sellPriceInput) craftElements.sellPriceInput.value = savedSell;
    
    // Load saved mat prices
    craftElements.matInputs.forEach(input => {
        const savedMat = localStorage.getItem(`mat_${input.id}`);
        if (savedMat !== null) {
            input.value = savedMat;
        }
    });

    // Load saved resourcefulness savings
    craftElements.savedMatInputs.forEach(input => {
        const savedQty = localStorage.getItem(`saved_${input.id}`);
        if (savedQty !== null) {
            input.value = savedQty;
        }
    });

    updateCraftUI();
}

initCrafts();

// --- LEDGER / HISTORY MODULE ---

const ledgerElements = {
    btnSave: document.getElementById('btn-save-record'),
    btnExport: document.getElementById('btn-export-json'),
    btnImport: document.getElementById('btn-import-json'),
    tbody: document.getElementById('history-tbody'),
    totalCrafts: document.getElementById('total-history-crafts'),
    totalObtained: document.getElementById('total-history-obtained'),
    totalInvestment: document.getElementById('total-history-investment'),
    totalSavings: document.getElementById('total-history-savings'),
    totalProfit: document.getElementById('total-history-profit')
};

function loadHistory() {
    try {
        const stored = localStorage.getItem(`history_${recipeId}`);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveHistory(data) {
    localStorage.setItem(`history_${recipeId}`, JSON.stringify(data));
}

function renderHistory() {
    if (!ledgerElements.tbody) return;
    
    const history = loadHistory();
    ledgerElements.tbody.innerHTML = '';
    
    let sumCrafts = 0;
    let sumObtained = 0;
    let sumInvestment = 0;
    let sumSavings = 0;
    let sumProfit = 0;
    
    history.forEach(record => {
        const obs = record.obtained || record.quantity;
        sumCrafts += record.quantity;
        sumObtained += obs;
        sumInvestment += record.investment;
        sumSavings += record.savings;
        sumProfit += record.profit;
        
        const tr = document.createElement('tr');
        
        // Colores para ganancia/pérdida
        let profitColor = record.profit > 0 ? 'var(--accent-blue)' : (record.profit < 0 ? 'rgba(255, 100, 100, 0.9)' : 'var(--text-main)');
        
        // Retro-compatibilidad para registros viejos sin 'obtained'
        const obsDisplay = record.obtained || record.quantity;

        tr.innerHTML = `
            <td style="color: var(--text-muted);">${record.date}</td>
            <td style="text-align: right; color: var(--text-muted); font-weight: bold;">${fmtInt(record.quantity)}</td>
            <td style="text-align: right; color: var(--accent-blue); font-weight: bold;">${fmtInt(obsDisplay)}</td>
            <td style="text-align: right; color: var(--text-main);">${fmt(record.investment)}</td>
            <td style="text-align: right; color: var(--primary-gold);">${fmt(record.savings)}</td>
            <td style="text-align: right; color: ${profitColor}; font-weight: bold;">${fmt(record.profit)}</td>
            <td style="text-align: right;">
                <button class="delete-record-btn" data-id="${record.id}" style="background: none; border: none; color: rgba(255,100,100,0.8); cursor: pointer; font-size: 1rem;" title="Eliminar Registro">❌</button>
            </td>
        `;
        ledgerElements.tbody.appendChild(tr);
    });
    
    // Asignar eventos de eliminación
    document.querySelectorAll('.delete-record-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idToRemove = parseInt(e.target.dataset.id);
            const newHistory = history.filter(r => r.id !== idToRemove);
            saveHistory(newHistory);
            renderHistory();
        });
    });
    
    // Actualizar totales en el footer
    let footerProfitColor = sumProfit > 0 ? 'var(--accent-blue)' : (sumProfit < 0 ? 'rgba(255, 100, 100, 0.9)' : 'var(--text-main)');
    
    ledgerElements.totalCrafts.textContent = fmtInt(sumCrafts);
    if (ledgerElements.totalObtained) ledgerElements.totalObtained.textContent = fmtInt(sumObtained);
    ledgerElements.totalInvestment.textContent = fmt(sumInvestment);
    ledgerElements.totalSavings.textContent = fmt(sumSavings);
    ledgerElements.totalProfit.textContent = fmt(sumProfit);
    ledgerElements.totalProfit.style.color = footerProfitColor;
}

// Iniciar History Events
if (ledgerElements.btnSave) {
    ledgerElements.btnSave.addEventListener('click', () => {
        const history = loadHistory();
        const now = new Date();
        const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        history.push({
            id: Date.now(),
            date: dateStr,
            quantity: currentCalculation.quantity,
            obtained: currentCalculation.obtained,
            investment: currentCalculation.investment,
            savings: currentCalculation.savings,
            profit: currentCalculation.profit
        });
        
        saveHistory(history);
        renderHistory();
    });
}

if (ledgerElements.btnExport) {
    ledgerElements.btnExport.addEventListener('click', () => {
        const history = loadHistory();
        if (history.length === 0) {
            alert('No hay registros guardados para exportar.');
            return;
        }
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recipeId}_historial.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

if (ledgerElements.btnImport) {
    ledgerElements.btnImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    saveHistory(importedData);
                    renderHistory();
                    alert('Historial importado correctamente.');
                } else {
                    alert('Error: El archivo JSON no tiene el formato correcto.');
                }
            } catch (err) {
                alert('Error al leer el archivo JSON.');
            }
            e.target.value = ''; // Limpiar el input file
        };
        reader.readAsText(file);
    });
}

// Renderizar al inicio
window.addEventListener('DOMContentLoaded', () => {
    renderHistory();
});
