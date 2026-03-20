const API_ENDPOINT = 'https://data.wowtoken.app/v2/current/retail.json';
const TOKEN_BALANCE_VALUE = 55; // 1 Token = 55 balance units

const elements = {
    tokenGoldPrice: document.getElementById('token-gold-price'),
    tokenSolesPrice: document.getElementById('token-soles-price'),
    statusBadge: document.getElementById('status-badge'),
    goldRateInput: document.getElementById('gold-rate'),
    goldRateSellInput: document.getElementById('gold-rate-sell'),
    blizzardInput: document.getElementById('blizzard-input'),
    
    // Display elements
    decimalTokenDisplay: document.getElementById('decimal-token-display'),
    wholeTokenDisplay: document.getElementById('whole-token-display'),
    profitRatioDisplay: document.getElementById('profit-ratio-display'),
    opCostDisplay: document.getElementById('op-cost-display'),
    blizzardDisplay: document.getElementById('blizzard-official-display'),
    wowTokenGold: document.getElementById('wow-token-gold'), // Renamed to "Soles per Token" in UI
    totalCostSoles: document.getElementById('total-cost-soles'),
    surplusDisplay: document.getElementById('surplus-display'),
    balanceTotal: document.getElementById('balance-total'),
    
    mult115: document.getElementById('mult-115'),
    mult120: document.getElementById('mult-120'),
    mult125: document.getElementById('mult-125'),
    multMax: document.getElementById('mult-max')
};

let currentTokenGold = 0;

async function fetchTokenPrice() {
    try {
        elements.statusBadge.textContent = 'Actualizando...';
        elements.statusBadge.className = 'status-badge';
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        if (data.us && Array.isArray(data.us)) {
            currentTokenGold = data.us[1];
        } else {
            throw new Error('Format Error');
        }
        updateUI();
        elements.statusBadge.textContent = 'En Vivo';
        elements.statusBadge.classList.add('status-live');
    } catch (error) {
        console.error('Fetch error:', error);
        elements.statusBadge.textContent = 'Modo Local (Offline)';
        elements.statusBadge.style.background = 'rgba(255, 153, 0, 0.2)';
        elements.statusBadge.style.color = '#ff9900';
        currentTokenGold = 243464; 
        updateUI();
    }
}

function updateUI() {
    const goldRateBuy = parseFloat(elements.goldRateInput?.value) || 0;
    const goldRateSell = parseFloat(elements.goldRateSellInput?.value) || 0;
    const blizzardNeeded = parseFloat(elements.blizzardInput?.value) || 109;

    // 1. Cantidad de WowTokens (Decimal) = Blizzard / 55
    const decimalTokens = blizzardNeeded / TOKEN_BALANCE_VALUE;
    
    // 2. Cantidad de tokens (Entero) = Math.ceil(decimalTokens)
    const wholeTokens = Math.ceil(decimalTokens);
    
    // 3. Valor de 1 Token en Soles = (Gold / 100k) * Rate
    const solesPerToken = (currentTokenGold * goldRateBuy) / 100000;
    
    // 4. COSTO SOLES = Decimal Tokens * Soles per Token
    const totalCost = decimalTokens * solesPerToken;
    
    // 5. SALDO TOTAL = Whole Tokens * 55
    const saldoTotal = wholeTokens * TOKEN_BALANCE_VALUE;
    
    // 6. EXCEDENTE = Saldo Total - Blizzard Oficial
    const excedente = saldoTotal - blizzardNeeded;

    // 7. Razón de ganancia = Venta / Compra
    const profitRatio = goldRateBuy > 0 ? (goldRateSell / goldRateBuy) : 0;

    // Helper formatters
    const fmt = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtV = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const fmtInt = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // --- Update UI Elements ---
    if (elements.tokenGoldPrice) elements.tokenGoldPrice.textContent = `${fmtInt(currentTokenGold / 1000)} K`;
    if (elements.tokenSolesPrice) elements.tokenSolesPrice.textContent = `${fmtV(solesPerToken)} S/`;
    
    // Summary Table
    if (elements.decimalTokenDisplay) elements.decimalTokenDisplay.textContent = fmtV(decimalTokens);
    if (elements.wholeTokenDisplay) elements.wholeTokenDisplay.textContent = fmtInt(wholeTokens);
    if (elements.profitRatioDisplay) elements.profitRatioDisplay.textContent = fmtV(profitRatio);
    if (elements.opCostDisplay) elements.opCostDisplay.textContent = `${fmtV(totalCost)} S/`;
    
    if (elements.blizzardDisplay) elements.blizzardDisplay.textContent = fmtInt(blizzardNeeded);
    if (elements.wowTokenGold) elements.wowTokenGold.textContent = `${fmtV(solesPerToken)} S/`;
    if (elements.totalCostSoles) elements.totalCostSoles.textContent = `${fmtV(totalCost)} S/`;
    if (elements.surplusDisplay) elements.surplusDisplay.textContent = fmtInt(excedente);
    if (elements.balanceTotal) elements.balanceTotal.textContent = fmtInt(saldoTotal);

    // Multipliers (Based on Total Cost as seen in Case 3)
    if (elements.mult115) elements.mult115.textContent = fmtInt(totalCost * 1.15);
    if (elements.mult120) elements.mult120.textContent = fmtInt(totalCost * 1.20);
    if (elements.mult125) elements.mult125.textContent = fmtInt(totalCost * 1.25);
    
    // VARIACION MAX: (Saldo Total / 55) * Valor Token * 1.25
    // Saldo Total / 55 es igual a wholeTokens
    if (elements.multMax) elements.multMax.textContent = fmtV(wholeTokens * solesPerToken * 1.25);

    localStorage.setItem('goldRate', goldRateBuy);
    localStorage.setItem('goldRateSell', goldRateSell);
    localStorage.setItem('blizzardNeeded', blizzardNeeded);
}

// Event Listeners
elements.goldRateInput?.addEventListener('input', updateUI);
elements.goldRateSellInput?.addEventListener('input', updateUI);
elements.blizzardInput?.addEventListener('input', updateUI);

function init() {
    const savedRate = localStorage.getItem('goldRate');
    const savedRateSell = localStorage.getItem('goldRateSell');
    const savedBlizzard = localStorage.getItem('blizzardNeeded');
    
    if (savedRate) elements.goldRateInput.value = savedRate;
    if (savedRateSell) elements.goldRateSellInput.value = savedRateSell;
    if (savedBlizzard) elements.blizzardInput.value = savedBlizzard;
    
    fetchTokenPrice();
    setInterval(fetchTokenPrice, 300000);
}

init();
