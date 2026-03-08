const API_ENDPOINT = 'https://data.wowtoken.app/v2/current/retail.json';

const elements = {
    tokenGoldPrice: document.getElementById('token-gold-price'),
    tokenSolesPrice: document.getElementById('token-soles-price'),
    statusBadge: document.getElementById('status-badge'),
    goldRateInput: document.getElementById('gold-rate'),
    tokenCountInput: document.getElementById('token-count'),
    blizzardOfficial: document.getElementById('blizzard-official'),
    wowTokenGold: document.getElementById('wow-token-gold'),
    totalCostSoles: document.getElementById('total-cost-soles'),
    balanceRemaining: document.getElementById('balance-remaining'),
    mult115: document.getElementById('mult-115'),
    mult120: document.getElementById('mult-120'),
    mult125: document.getElementById('mult-125')
};

let currentTokenGold = 0;

async function fetchTokenPrice() {
    try {
        elements.statusBadge.textContent = 'Actualizando...';
        elements.statusBadge.className = 'status-badge';
        
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error('API Response Error');
        
        const data = await response.json();
        
        // El formato es ["timestamp", precio]
        if (data.us && Array.isArray(data.us)) {
            currentTokenGold = data.us[1];
        } else {
            throw new Error('Formato de datos inválido');
        }

        updateUI();
        
        elements.statusBadge.textContent = 'En Vivo';
        elements.statusBadge.classList.add('status-live');
    } catch (error) {
        console.error('Fetch error:', error);
        
        if (window.location.protocol === 'file:') {
            elements.statusBadge.textContent = 'CORS Error (Local File)';
            elements.statusBadge.title = 'Los navegadores bloquean peticiones API desde archivos locales. Funcionará correctamente al subirlo a GitHub.';
        } else {
            elements.statusBadge.textContent = 'Error API';
        }
        
        elements.statusBadge.style.background = 'rgba(255, 0, 0, 0.2)';
        elements.statusBadge.style.color = '#ff4444';
        
        // Use default values for calculations even if API fails
        currentTokenGold = 241000; // Updated to match user's screenshot price
        updateUI();
    }
}

function updateUI() {
    const goldRate = parseFloat(elements.goldRateInput.value) || 0;
    const tokenCount = parseFloat(elements.tokenCountInput.value) || 0;

    // 100k gold = goldRate (Soles)
    const tokenSoles = (currentTokenGold * goldRate) / 100000;
    const totalCost = tokenSoles * tokenCount;
    
    // UI Updates
    elements.tokenGoldPrice.textContent = `${(currentTokenGold / 1000).toLocaleString()} K`;
    elements.tokenSolesPrice.textContent = `${tokenSoles.toFixed(1)} S/`;
    
    elements.blizzardOfficial.textContent = '91';
    elements.wowTokenGold.textContent = `${(currentTokenGold / 10000).toFixed(1)}`;
    elements.totalCostSoles.textContent = `${totalCost.toFixed(1)} S/`;
    
    elements.balanceRemaining.textContent = '89';

    // Multipliers
    const baseMult = (totalCost / tokenCount);
    elements.mult115.textContent = `${(1.15 * baseMult).toFixed(0)}`;
    elements.mult120.textContent = `${(1.20 * baseMult).toFixed(0)}`;
    elements.mult125.textContent = `${(1.25 * baseMult).toFixed(0)}`;

    // Save inputs
    localStorage.setItem('goldRate', goldRate);
    localStorage.setItem('tokenCount', tokenCount);
}

// Event Listeners
elements.goldRateInput.addEventListener('input', updateUI);
elements.tokenCountInput.addEventListener('input', updateUI);

// Init
function init() {
    const savedRate = localStorage.getItem('goldRate');
    const savedCount = localStorage.getItem('tokenCount');
    
    if (savedRate) elements.goldRateInput.value = savedRate;
    if (savedCount) elements.tokenCountInput.value = savedCount;
    
    fetchTokenPrice();
    setInterval(fetchTokenPrice, 300000);
}

init();
