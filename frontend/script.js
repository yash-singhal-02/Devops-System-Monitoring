const CIRCLE_RADIUS = 52;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// Chart configuration
let trendsChart;
const MAX_DATA_POINTS = 20;
const chartData = {
    labels: [],
    cpu: [],
    memory: []
};

function initChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'CPU %',
                    data: chartData.cpu,
                    borderColor: '#4f46e5',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'MEM %',
                    data: chartData.memory,
                    borderColor: '#06b6d4',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                }
            },
            animation: { duration: 0 }
        }
    });
}

function updateChart(cpu, memPercent) {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    chartData.labels.push(now);
    chartData.cpu.push(cpu);
    chartData.memory.push(memPercent);

    if (chartData.labels.length > MAX_DATA_POINTS) {
        chartData.labels.shift();
        chartData.cpu.shift();
        chartData.memory.shift();
    }

    trendsChart.update();
}

function updateCpuRing(percent) {
    const ring = document.getElementById('cpu-ring');
    const offset = CIRCLE_CIRCUMFERENCE - (percent / 100) * CIRCLE_CIRCUMFERENCE;
    ring.style.strokeDashoffset = offset;
    document.getElementById('cpu-value').innerText = Math.round(percent);
    
    if (percent > 80) ring.style.stroke = 'var(--error)';
    else if (percent > 50) ring.style.stroke = 'var(--warning)';
    else ring.style.stroke = 'var(--primary)';
}

function updateMemory(used, total) {
    const percent = (used / total) * 100;
    const bar = document.getElementById('memory-bar');
    bar.style.width = `${percent}%`;
    
    document.getElementById('used-mem-text').innerText = `${used.toFixed(2)} GB`;
    document.getElementById('total-mem-text').innerText = `${total.toFixed(2)} GB`;
    
    if (percent > 90) bar.style.background = 'var(--error)';
    else if (percent > 75) bar.style.background = 'var(--warning)';
    else bar.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
}

function generateInsight(cpu, memPercent) {
    const insightText = document.querySelector('.insight-text');
    const healthScore = document.getElementById('health-score');
    let score = 100;
    let message = "";

    if (cpu > 80 && memPercent > 80) {
        message = "Critical: System is under heavy load. Resource saturation detected.";
        score = 45;
    } else if (cpu > 80) {
        message = "Warning: High CPU usage detected. Check for runaway processes.";
        score = 65;
    } else if (memPercent > 85) {
        message = "Attention: Memory usage is near capacity. Potential for swapping.";
        score = 70;
    } else if (cpu < 10 && memPercent < 50) {
        message = "System is idling efficiently. All parameters are optimal.";
        score = 99;
    } else {
        message = "System performance is stable. Normal operational load observed.";
        score = 92 + Math.floor(Math.random() * 5);
    }

    insightText.innerText = message;
    healthScore.innerText = score;
    
    if (score < 60) healthScore.style.color = 'var(--error)';
    else if (score < 85) healthScore.style.color = 'var(--warning)';
    else healthScore.style.color = 'var(--success)';
    
    document.getElementById('insight-time').innerText = `Updated at ${new Date().toLocaleTimeString()}`;
}

async function fetchSystemData() {
    try {
        const response = await fetch("http://localhost:3000/system");
        if (!response.ok) throw new Error("Backend unreachable");
        
        const data = await response.json();
        const cpu = parseFloat(data.cpuUsage);
        const used = parseFloat(data.usedMemory);
        const total = parseFloat(data.totalMemory);
        const memPercent = (used / total) * 100;

        updateCpuRing(cpu);
        updateMemory(used, total);
        generateInsight(cpu, memPercent);
        updateChart(cpu, memPercent);
        
        document.getElementById('status-badge').style.background = 'rgba(16, 185, 129, 0.1)';
        document.querySelector('.status-text').innerText = 'SYSTEM LIVE';
        document.querySelector('.status-dot').style.background = 'var(--success)';

    } catch (error) {
        console.error("Fetch error:", error);
        document.querySelector('.status-text').innerText = 'CONNECTION LOST';
        document.getElementById('status-badge').style.background = 'rgba(239, 68, 68, 0.1)';
        document.querySelector('.status-dot').style.background = 'var(--error)';
    }
}

// Interactivity Logic
function setupInteractivity() {
    const modal = document.getElementById('detail-modal');
    const closeBtn = document.querySelector('.close-btn');
    const cards = document.querySelectorAll('.interactive-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-detail');
            showModal(type);
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    document.getElementById('refresh-btn').addEventListener('click', () => {
        const btn = document.getElementById('refresh-btn');
        btn.style.transform = 'rotate(360deg)';
        setTimeout(() => btn.style.transform = '', 500);
        fetchSystemData();
    });
}

function showModal(type) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    modal.classList.add('active');
    
    if (type === 'cpu') {
        title.innerText = "CPU Performance History";
        body.innerHTML = `
            <div style="margin-bottom: 20px;">
                <p>Current Load: ${document.getElementById('cpu-value').innerText}%</p>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 10px;">
                    History reflects the last ${chartData.cpu.length} samples recorded at 2-second intervals.
                </p>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 10px;">
                <p>Peak Load: ${Math.max(...chartData.cpu)}%</p>
                <p>Average Load: ${Math.round(chartData.cpu.reduce((a,b) => a+b, 0) / chartData.cpu.length)}%</p>
            </div>
        `;
    } else {
        title.innerText = "Memory Allocation Details";
        body.innerHTML = `
            <div style="margin-bottom: 20px;">
                <p>Used Memory: ${document.getElementById('used-mem-text').innerText}</p>
                <p>Total Available: ${document.getElementById('total-mem-text').innerText}</p>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 10px;">
                <p>Peak Usage: ${Math.max(...chartData.memory).toFixed(1)}%</p>
                <p>Current Efficiency: ${100 - Math.round(chartData.memory[chartData.memory.length-1])}% Free</p>
            </div>
        `;
    }
}

function updateClock() {
    const clockElement = document.getElementById('real-time-clock');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.innerText = `${hours}:${minutes}:${seconds}`;
}

// Initializations
initChart();
setupInteractivity();
fetchSystemData();
setInterval(fetchSystemData, 2000);
updateClock();
setInterval(updateClock, 1000);