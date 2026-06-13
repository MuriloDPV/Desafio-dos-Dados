// DADOS
const allData = [
    { id_entrega: 301, transportadora: 'RotaMax', regiao: 'Sudeste', prazo_dias: 3, dias_reais: 7 },
    { id_entrega: 302, transportadora: 'ViaCargo', regiao: 'Sul', prazo_dias: 5, dias_reais: 5 },
    { id_entrega: 303, transportadora: 'FlashLog', regiao: 'Nordeste', prazo_dias: 4, dias_reais: 9 },
    { id_entrega: 304, transportadora: 'RotaMax', regiao: 'Norte', prazo_dias: 6, dias_reais: 4 },
    { id_entrega: 305, transportadora: 'ViaCargo', regiao: 'Centro-Oeste', prazo_dias: 2, dias_reais: 6 },
    { id_entrega: 306, transportadora: 'FlashLog', regiao: 'Sul', prazo_dias: 5, dias_reais: 12 },
    { id_entrega: 307, transportadora: 'RotaMax', regiao: 'Sul', prazo_dias: 6, dias_reais: 9 },
    { id_entrega: 308, transportadora: 'ViaCargo', regiao: 'Sudeste', prazo_dias: 3, dias_reais: 4 },
    { id_entrega: 309, transportadora: 'FlashLog', regiao: 'Norte', prazo_dias: 5, dias_reais: 5 },
    { id_entrega: 310, transportadora: 'ViaCargo', regiao: 'Nordeste', prazo_dias: 4, dias_reais: 8 }
];

let filteredData = [...allData];
let charts = {};

// INICIALIZAÇÃO
function init() {
    populateFilters();
    updateDashboard();
}

// POPULAR FILTROS
function populateFilters() {
    const transports = [...new Set(allData.map(d => d.transportadora))];
    const regions = [...new Set(allData.map(d => d.regiao))];

    const transportSelect = document.getElementById('transportFilter');
    const regionSelect = document.getElementById('regionFilter');

    transports.forEach(t => {
        const option = document.createElement('option');
        option.value = t;
        option.textContent = t;
        transportSelect.appendChild(option);
    });

    regions.forEach(r => {
        const option = document.createElement('option');
        option.value = r;
        option.textContent = r;
        regionSelect.appendChild(option);
    });
}

// APLICAR FILTROS
function applyFilters() {
    const transport = document.getElementById('transportFilter').value;
    const region = document.getElementById('regionFilter').value;
    const status = document.getElementById('statusFilter').value;

    filteredData = allData.filter(d => {
        let match = true;

        if (transport) match = match && d.transportadora === transport;
        if (region) match = match && d.regiao === region;
        
        if (status === 'delayed') {
            match = match && (d.dias_reais > d.prazo_dias);
        } else if (status === 'on-time') {
            match = match && (d.dias_reais <= d.prazo_dias);
        }

        return match;
    });

    updateDashboard();
}

// LIMPAR FILTROS
function resetFilters() {
    document.getElementById('transportFilter').value = '';
    document.getElementById('regionFilter').value = '';
    document.getElementById('statusFilter').value = '';
    applyFilters();
}

// FUNÇÃO AUXILIAR: Verificar atraso
function isDelayed(delivery) {
    return delivery.dias_reais > delivery.prazo_dias;
}

// FUNÇÃO AUXILIAR: Calcular diferença
function getDelay(delivery) {
    return delivery.dias_reais - delivery.prazo_dias;
}

// ATUALIZAR DASHBOARD
function updateDashboard() {
    updateKPIs();
    updateTable();
    updateCharts();
    updateRankings();
    updateStatistics();
    updateAlerts();
}

// ATUALIZAR KPIs
function updateKPIs() {
    const total = filteredData.length;
    const delayed = filteredData.filter(isDelayed).length;
    const delayRate = total > 0 ? ((delayed / total) * 100).toFixed(1) : 0;
    
    const totalDelay = filteredData
        .filter(isDelayed)
        .reduce((sum, d) => sum + getDelay(d), 0);
    const avgDelay = delayed > 0 ? (totalDelay / delayed).toFixed(1) : 0;

    document.getElementById('totalDeliveries').textContent = total;
    document.getElementById('delayedCount').textContent = delayed;
    document.getElementById('delayRate').textContent = delayRate + '%';
    document.getElementById('avgDelay').textContent = avgDelay;
}

// ATUALIZAR TABELA
function updateTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    filteredData.forEach(delivery => {
        const delay = getDelay(delivery);
        const status = isDelayed(delivery) ? 'delayed' : 'on-time';
        const statusText = isDelayed(delivery) ? '🔴 Atrasado' : '✅ No Prazo';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${delivery.id_entrega}</strong></td>
            <td>${delivery.transportadora}</td>
            <td>${delivery.regiao}</td>
            <td>${delivery.prazo_dias} dias</td>
            <td>${delivery.dias_reais} dias</td>
            <td style="color: ${delay > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: 600;">
                ${delay > 0 ? '+' : ''}${delay} dias
            </td>
            <td><span class="delay-badge ${status}">${statusText}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// ATUALIZAR GRÁFICOS
function updateCharts() {
    updateTransportChart();
    updateRegionChart();
}

function updateTransportChart() {
    const transports = [...new Set(filteredData.map(d => d.transportadora))];
    const delays = transports.map(t => {
        const transportData = filteredData.filter(d => d.transportadora === t);
        return transportData.filter(isDelayed).length;
    });

    const ctx = document.getElementById('transportChart').getContext('2d');
    
    if (charts.transport) {
        charts.transport.destroy();
    }

    charts.transport = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: transports,
            datasets: [{
                label: 'Entregas Atrasadas',
                data: delays,
                backgroundColor: [
                    'rgba(255, 60, 60, 0.7)',
                    'rgba(255, 165, 0, 0.7)',
                    'rgba(255, 60, 60, 0.7)'
                ],
                borderColor: [
                    'var(--danger)',
                    'var(--warning)',
                    'var(--danger)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(0, 212, 255, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'var(--text-light)',
                        font: { size: 12, weight: '600' }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 212, 255, 0.1)' },
                    ticks: {
                        color: 'var(--text-muted)',
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: 'var(--text-muted)',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

function updateRegionChart() {
    const regions = [...new Set(filteredData.map(d => d.regiao))];
    const delays = regions.map(r => {
        const regionData = filteredData.filter(d => d.regiao === r);
        return regionData.filter(isDelayed).length;
    });

    const ctx = document.getElementById('regionChart').getContext('2d');
    
    if (charts.region) {
        charts.region.destroy();
    }

    charts.region = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: regions,
            datasets: [{
                data: delays,
                backgroundColor: [
                    'rgba(255, 60, 60, 0.8)',
                    'rgba(255, 165, 0, 0.8)',
                    'rgba(255, 0, 110, 0.8)',
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(0, 245, 184, 0.8)'
                ],
                borderColor: '#0a0e27',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'var(--text-light)',
                        padding: 15,
                        font: { size: 11, weight: '600' }
                    }
                }
            }
        }
    });
}

// ATUALIZAR RANKINGS
function updateRankings() {
    updateTransportRanking();
    updateRegionRanking();
}

function updateTransportRanking() {
    const transports = [...new Set(filteredData.map(d => d.transportadora))];
    const ranking = transports.map(t => {
        const transportData = filteredData.filter(d => d.transportadora === t);
        const delayed = transportData.filter(isDelayed).length;
        const rate = transportData.length > 0 ? (delayed / transportData.length) * 100 : 0;
        return { name: t, delayed, rate, total: transportData.length };
    }).sort((a, b) => b.rate - a.rate);

    const rankingDiv = document.getElementById('transportRanking');
    rankingDiv.innerHTML = '';

    ranking.forEach((item, index) => {
        const maxRate = Math.max(...ranking.map(r => r.rate));
        const barWidth = (item.rate / maxRate) * 100;
        const isCritical = item.rate > 50;

        const li = document.createElement('li');
        li.className = `ranking-item ${isCritical ? 'critical' : ''}`;
        li.innerHTML = `
            <div class="rank-position">#${index + 1}</div>
            <div class="rank-info">
                <div class="rank-name">${item.name}</div>
                <div class="rank-value">${item.delayed} de ${item.total} entregas atrasadas (${item.rate.toFixed(1)}%)</div>
                <div class="rank-bar">
                    <div class="rank-bar-fill" style="width: ${barWidth}%"></div>
                </div>
            </div>
        `;
        rankingDiv.appendChild(li);
    });
}

function updateRegionRanking() {
    const regions = [...new Set(filteredData.map(d => d.regiao))];
    const ranking = regions.map(r => {
        const regionData = filteredData.filter(d => d.regiao === r);
        const delayed = regionData.filter(isDelayed).length;
        const rate = regionData.length > 0 ? (delayed / regionData.length) * 100 : 0;
        return { name: r, delayed, rate, total: regionData.length };
    }).sort((a, b) => b.rate - a.rate);

    const rankingDiv = document.getElementById('regionRanking');
    rankingDiv.innerHTML = '';

    ranking.forEach((item, index) => {
        const maxRate = Math.max(...ranking.map(r => r.rate));
        const barWidth = (item.rate / maxRate) * 100;
        const isCritical = item.rate > 50;

        const li = document.createElement('li');
        li.className = `ranking-item ${isCritical ? 'critical' : ''}`;
        li.innerHTML = `
            <div class="rank-position">#${index + 1}</div>
            <div class="rank-info">
                <div class="rank-name">${item.name}</div>
                <div class="rank-value">${item.delayed} de ${item.total} entregas atrasadas (${item.rate.toFixed(1)}%)</div>
                <div class="rank-bar">
                    <div class="rank-bar-fill" style="width: ${barWidth}%"></div>
                </div>
            </div>
        `;
        rankingDiv.appendChild(li);
    });
}

// ATUALIZAR ESTATÍSTICAS
function updateStatistics() {
    const total = filteredData.length;
    const delayed = filteredData.filter(isDelayed).length;
    const onTime = total - delayed;
    
    const totalDelay = filteredData
        .filter(isDelayed)
        .reduce((sum, d) => sum + getDelay(d), 0);
    const maxDelay = Math.max(0, ...filteredData.map(getDelay));
    const minDelay = Math.min(...filteredData.filter(isDelayed).map(getDelay).concat(0));

    const statsDiv = document.getElementById('statsContent');
    statsDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div style="background: rgba(0, 245, 184, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--success);">
                <div style="color: var(--text-muted); font-size: 0.85rem;">✅ Entregas No Prazo</div>
                <div style="font-size: 1.8rem; font-weight: 700; color: var(--success);">${onTime}</div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">${total > 0 ? ((onTime / total) * 100).toFixed(1) : 0}% do total</div>
            </div>
            <div style="background: rgba(255, 60, 60, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--danger);">
                <div style="color: var(--text-muted); font-size: 0.85rem;">🔴 Entregas Atrasadas</div>
                <div style="font-size: 1.8rem; font-weight: 700; color: var(--danger);">${delayed}</div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">${total > 0 ? ((delayed / total) * 100).toFixed(1) : 0}% do total</div>
            </div>
            <div style="background: rgba(255, 165, 0, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--warning);">
                <div style="color: var(--text-muted); font-size: 0.85rem;">⏱️ Atraso Máximo</div>
                <div style="font-size: 1.8rem; font-weight: 700; color: var(--warning);">${maxDelay} dias</div>
            </div>
            <div style="background: rgba(0, 212, 255, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary);">
                <div style="color: var(--text-muted); font-size: 0.85rem;">📊 Atraso Mínimo</div>
                <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary);">${delayed > 0 ? minDelay : '—'} dias</div>
            </div>
        </div>
    `;
}

// ATUALIZAR ALERTAS
function updateAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    // ALERTA 1: Transportadora com taxa alta
    const transports = [...new Set(filteredData.map(d => d.transportadora))];
    const criticalTransports = transports.filter(t => {
        const tData = filteredData.filter(d => d.transportadora === t);
        return (tData.filter(isDelayed).length / tData.length) >= 0.5;
    });

    if (criticalTransports.length > 0) {
        const alert = document.createElement('div');
        alert.className = 'alert critical';
        alert.innerHTML = `
            <span class="alert-icon">🚨</span>
            <div>
                <strong>Transportadora(s) crítica(s):</strong> ${criticalTransports.join(', ')} com taxa de atraso ≥ 50%
            </div>
        `;
        alertsContainer.appendChild(alert);
    }

    // ALERTA 2: Região crítica
    const regions = [...new Set(filteredData.map(d => d.regiao))];
    const criticalRegions = regions.filter(r => {
        const rData = filteredData.filter(d => d.regiao === r);
        return (rData.filter(isDelayed).length / rData.length) >= 0.5;
    });

    if (criticalRegions.length > 0) {
        const alert = document.createElement('div');
        alert.className = 'alert critical';
        alert.innerHTML = `
            <span class="alert-icon">⚠️</span>
            <div>
                <strong>Região(ões) crítica(s):</strong> ${criticalRegions.join(', ')} com taxa de atraso ≥ 50%
            </div>
        `;
        alertsContainer.appendChild(alert);
    }

    // ALERTA 3: Atrasos elevados
    const maxDelay = Math.max(...filteredData.map(getDelay));
    if (maxDelay > 5) {
        const alert = document.createElement('div');
        alert.className = 'alert warning';
        alert.innerHTML = `
            <span class="alert-icon">📈</span>
            <div>
                <strong>Atraso elevado detectado:</strong> Há atrasos acumulados de até ${maxDelay} dias
            </div>
        `;
        alertsContainer.appendChild(alert);
    }

    // ALERTA 4: Sem alertas
    if (alertsContainer.innerHTML === '') {
        alertsContainer.innerHTML = '<div class="no-data">✅ Nenhum alerta crítico no momento</div>';
    }
}

// EVENT LISTENERS
document.getElementById('transportFilter').addEventListener('change', applyFilters);
document.getElementById('regionFilter').addEventListener('change', applyFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);

// INICIAR QUANDO DOM ESTIVER PRONTO
document.addEventListener('DOMContentLoaded', init);
