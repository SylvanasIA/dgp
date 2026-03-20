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

    // Update UI
    if (craftElements.costPerUnit) craftElements.costPerUnit.textContent = unitCost.toFixed(2);
    if (craftElements.displayQuantity) craftElements.displayQuantity.textContent = quantity.toString();
    if (craftElements.totalInvestment) craftElements.totalInvestment.textContent = totalInvestment.toFixed(2);
    
    if (craftElements.displayObtained) craftElements.displayObtained.textContent = obtainedQuantity.toString();
    if (craftElements.grossRevenue) craftElements.grossRevenue.textContent = grossRevenue.toFixed(2);
    if (craftElements.ahCut) craftElements.ahCut.textContent = `-${ahCut.toFixed(2)}`;
    
    if (craftElements.resourcefulnessSavings) {
        craftElements.resourcefulnessSavings.textContent = `+${savingsTotal.toFixed(2)}`;
    }
    
    if (craftElements.netRevenue) craftElements.netRevenue.textContent = netRevenue.toFixed(2);
    
    if (craftElements.netProfit) {
        craftElements.netProfit.textContent = netProfit.toFixed(2);
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


