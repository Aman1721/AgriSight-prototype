document.addEventListener('DOMContentLoaded', () => {

    // --- DUMMY DATA ---
    const farmData = {
        '1': {
            name: "Green Valley Farms",
            soilType: "Clay Loam",
            cropType: "Wheat",
            lastIrrigation: "2025-10-18",
            fertilizer: "Urea",
            yield: {
                labels: ["2023", "2024", "2025 (Predicted)"],
                historical: [7.5, 7.8, null],
                predicted: [null, null, 8.2]
            },
            damage: {
                labels: ["Drought", "Pest", "Flood"],
                values: [10, 35, 5]
            }
        },
        '2': {
            name: "Sunset Acres",
            soilType: "Sandy Loam",
            cropType: "Corn",
            lastIrrigation: "2025-10-20",
            fertilizer: "NPK 10-20-20",
            yield: {
                labels: ["2023", "2024", "2025 (Predicted)"],
                historical: [9.1, 8.9, null],
                predicted: [null, null, 9.5]
            },
            damage: {
                labels: ["Drought", "Pest", "Flood"],
                values: [40, 15, 10]
            }
        },
        '3': {
            name: "Riverbend Plots",
            soilType: "Silty Clay",
            cropType: "Soybean",
            lastIrrigation: "2025-10-19",
            fertilizer: "Potash",
            yield: {
                labels: ["2023", "2024", "2025 (Predicted)"],
                historical: [6.8, 7.2, null],
                predicted: [null, null, 7.5]
            },
            damage: {
                labels: ["Drought", "Pest", "Flood"],
                values: [5, 10, 55]
            }
        }
    };
    
    // --- ELEMENT SELECTORS ---
    const themeToggle = document.getElementById('theme-toggle');
    const farmList = document.getElementById('farm-list');
    const farmSearch = document.getElementById('farm-search');

    // --- CHART INITIALIZATION ---
    let yieldChart, damageChart;

    function createCharts() {
        const yieldCtx = document.getElementById('yieldChart').getContext('2d');
        yieldChart = new Chart(yieldCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Historical Yield (t/ha)',
                    data: [],
                    backgroundColor: 'rgba(41, 128, 185, 0.6)',
                    borderColor: 'rgba(41, 128, 185, 1)',
                    borderWidth: 1
                }, {
                    label: 'Predicted Yield (t/ha)',
                    data: [],
                    backgroundColor: 'rgba(39, 174, 96, 0.6)',
                    borderColor: 'rgba(39, 174, 96, 1)',
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true } }, responsive: true }
        });

        const damageCtx = document.getElementById('damageChart').getContext('2d');
        damageChart = new Chart(damageCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    label: 'Damage Types (%)',
                    data: [],
                    backgroundColor: [
                        'rgba(243, 156, 18, 0.7)',
                        'rgba(192, 57, 43, 0.7)',
                        'rgba(52, 152, 219, 0.7)'
                    ]
                }]
            },
            options: { responsive: true }
        });
    }

    // --- UI UPDATE FUNCTIONS ---
    function updateDashboard(farmId) {
        const data = farmData[farmId];
        
        // Update Overview Cards
        document.getElementById('farm-name-overview').textContent = data.name;
        document.getElementById('soil-type-overview').textContent = data.soilType;
        document.getElementById('crop-type-overview').textContent = data.cropType;
        document.getElementById('irrigation-overview').textContent = data.lastIrrigation;
        document.getElementById('fertilizer-overview').textContent = data.fertilizer;

        // Update Charts
        yieldChart.data.labels = data.yield.labels;
        yieldChart.data.datasets[0].data = data.yield.historical;
        yieldChart.data.datasets[1].data = data.yield.predicted;
        yieldChart.update();

        damageChart.data.labels = data.damage.labels;
        damageChart.data.datasets[0].data = data.damage.values;
        damageChart.update();

        // Highlight map and list
        document.querySelectorAll('.farm-list li').forEach(li => {
            li.classList.toggle('selected', li.dataset.farmid === farmId);
        });
        document.querySelectorAll('.farm-boundary').forEach(fb => {
            fb.classList.toggle('highlighted', fb.dataset.farmid === farmId);
        });
    }

    function populateFarmList() {
        farmList.innerHTML = '';
        Object.keys(farmData).forEach(id => {
            const farm = farmData[id];
            const li = document.createElement('li');
            li.textContent = farm.name;
            li.dataset.farmid = id;
            farmList.appendChild(li);
        });
    }

    // --- EVENT LISTENERS ---

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });

    // Sidebar Panel Toggle
    document.querySelectorAll('.panel-header').forEach(header => {
        header.addEventListener('click', () => {
            const contentId = header.getAttribute('data-toggle');
            const content = document.getElementById(contentId);
            const icon = header.querySelector('i.fa-chevron-down, i.fa-chevron-up');
            
            content.classList.toggle('collapsed');
            if (content.classList.contains('collapsed')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });

    // Farm Selection (from list or map)
    function handleFarmSelection(farmId) {
        if (farmId) updateDashboard(farmId);
    }

    farmList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            handleFarmSelection(e.target.dataset.farmid);
        }
    });

    document.getElementById('map-placeholder').addEventListener('click', (e) => {
         if (e.target.classList.contains('farm-boundary')) {
            handleFarmSelection(e.target.dataset.farmid);
        }
    });

    // Farm Search/Filter
    farmSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.farm-list li').forEach(li => {
            const farmName = li.textContent.toLowerCase();
            li.style.display = farmName.includes(searchTerm) ? '' : 'none';
        });
    });

    // --- INITIALIZATION ---
    populateFarmList();
    createCharts();
    // Select and display the first farm by default
    const firstFarmId = Object.keys(farmData)[0];
    updateDashboard(firstFarmId);
});