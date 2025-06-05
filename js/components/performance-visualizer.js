class PerformanceVisualizer {
    constructor(cpuData) {
        this.cpu = cpuData;
        this.charts = {};
        this.init();
    }

    init() {
        this.createPerformanceChart();
        this.createWorkloadCharts();
        this.createEfficiencyChart();
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performance-chart').getContext('2d');
        this.charts.performance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    'Gaming',
                    'Multitarea',
                    'Productividad',
                    'Rendimiento/Watt',
                    'Single-Core',
                    'Multi-Core'
                ],
                datasets: [{
                    label: this.cpu.name,
                    data: [
                        this.cpu.gamingScore,
                        this.cpu.multitaskingScore,
                        this.cpu.productivityScore,
                        this.cpu.efficiencyScore,
                        this.cpu.singleCoreScore,
                        this.cpu.multiCoreScore
                    ],
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: 'rgb(79, 70, 229)',
                    pointBackgroundColor: 'rgb(79, 70, 229)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(79, 70, 229)'
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }

    createWorkloadCharts() {
        const container = document.getElementById('workload-charts');
        if (!container) return;

        // Gaming Performance
        const gamingCtx = document.createElement('canvas');
        gamingCtx.id = 'gaming-chart';
        container.appendChild(gamingCtx);

        this.charts.gaming = new Chart(gamingCtx, {
            type: 'bar',
            data: {
                labels: ['1080p', '1440p', '4K'],
                datasets: [{
                    label: 'FPS Promedio',
                    data: this.cpu.gamingPerformance,
                    backgroundColor: 'rgba(79, 70, 229, 0.8)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'FPS'
                        }
                    }
                }
            }
        });

        // Workload Distribution
        const workloadCtx = document.createElement('canvas');
        workloadCtx.id = 'workload-chart';
        container.appendChild(workloadCtx);

        this.charts.workload = new Chart(workloadCtx, {
            type: 'doughnut',
            data: {
                labels: ['Gaming', 'Productividad', 'Renderizado', 'Compilación'],
                datasets: [{
                    data: [30, 25, 25, 20],
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    createEfficiencyChart() {
        const ctx = document.getElementById('efficiency-chart');
        if (!ctx) return;

        this.charts.efficiency = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Idle', '25%', '50%', '75%', '100%'],
                datasets: [{
                    label: 'Consumo (W)',
                    data: this.cpu.powerConsumption,
                    borderColor: 'rgb(239, 68, 68)',
                    tension: 0.4
                }, {
                    label: 'Rendimiento',
                    data: this.cpu.performanceCurve,
                    borderColor: 'rgb(16, 185, 129)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Rendimiento/Consumo'
                        }
                    }
                }
            }
        });
    }

    updateData(newCpuData) {
        this.cpu = newCpuData;
        this.updateAllCharts();
    }

    updateAllCharts() {
        // Actualizar datos en todos los gráficos
        Object.values(this.charts).forEach(chart => {
            if (chart.data && chart.data.datasets) {
                chart.update();
            }
        });
    }
}

window.PerformanceVisualizer = PerformanceVisualizer;
