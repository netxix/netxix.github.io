class FPSCalculator extends PCTool {
    constructor() {
        super();
        this.form = document.getElementById('fps-calculator-form');
        this.resultDiv = document.getElementById('fps-result');
        this.cpuData = null;
        this.gpuData = null;
        this.gameData = null;
        this.charts = {
            average: null,
            lowOne: null
        };
        this.selectedResolution = '1080';
        this.rayTracingEnabled = false;
        this.dlssEnabled = false;
        this.init();
    }

    async init() {
        try {
            this.showLoading();
            
            // Cargar datos de componentes
            const [cpus, gpus, games] = await Promise.all([
                this.fetchComponentData('cpus'),
                this.fetchComponentData('gpus'),
                this.fetchComponentData('games')
            ]);

            this.cpuData = cpus;
            this.gpuData = gpus;
            this.gameData = games;

            // Poblar selectores
            this.populateSelect('cpu', cpus);
            this.populateSelect('gpu', gpus);
            this.populateSelect('game', games);

            // Inicializar gráficos
            this.initCharts();

            // Event listeners
            this.setupEventListeners();

            this.hideLoading();
        } catch (error) {
            this.showError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
        }
    }

    populateSelect(id, data) {
        const select = document.getElementById(id);
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            select.appendChild(option);
        });
    }

    validateInput() {
        const formData = new FormData(this.form);
        const cpu = formData.get('cpu');
        const gpu = formData.get('gpu');
        const ram = formData.get('ram');
        const game = formData.get('game');
        const resolution = formData.get('resolution');

        if (!cpu || !gpu || !ram || !game || !resolution) {
            throw new Error('Por favor, completa todos los campos');
        }

        return { cpu, gpu, ram: parseInt(ram), game, resolution: parseInt(resolution) };
    }

    initCharts() {
        const avgCtx = document.querySelector('.fps-chart:first-child .fps-gauge').getContext('2d');
        const lowCtx = document.querySelector('.fps-chart:last-child .fps-gauge').getContext('2d');

        const config = {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(79, 70, 229, 0.1)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '80%',
                rotation: -90,
                circumference: 180,
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        };

        this.charts.average = new Chart(avgCtx, config);
        this.charts.lowOne = new Chart(lowCtx, {...config});
    }

    setupEventListeners() {
        // Resolution selector
        document.querySelectorAll('.resolution-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.resolution-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.selectedResolution = option.dataset.resolution;
                if (this.form.checkValidity()) this.calculate();
            });
        });

        // Advanced settings
        const settingsToggle = document.querySelector('.settings-toggle');
        const settingsPanel = document.querySelector('.settings-panel');
        
        settingsToggle.addEventListener('click', () => {
            settingsPanel.classList.toggle('active');
        });

        // Ray Tracing & DLSS
        document.getElementById('raytracing').addEventListener('change', (e) => {
            this.rayTracingEnabled = e.target.checked;
            if (this.form.checkValidity()) this.calculate();
        });

        document.getElementById('dlss').addEventListener('change', (e) => {
            this.dlssEnabled = e.target.checked;
            if (this.form.checkValidity()) this.calculate();
        });

        // Settings quality
        document.getElementById('settings').addEventListener('change', () => {
            if (this.form.checkValidity()) this.calculate();
        });
    }

    async calculate() {
        try {
            const input = this.validateInput();
            
            // Simular cálculo de FPS (en producción, esto vendría de una API o base de datos)
            const result = await this.simulateFPSCalculation(input);
            
            this.results = result;
            this.displayResults();
            
            // Trackear evento
            trackEvent('fps_calculator', 'calculate', `${input.cpu}_${input.gpu}_${input.game}`);
        } catch (error) {
            this.showError(error.message);
        }
    }

    async simulateFPSCalculation(input) {
        // En producción, esto sería una llamada a la API
        // Por ahora, simularemos resultados basados en la resolución
        const baseMultiplier = input.resolution === 1080 ? 1 :
                             input.resolution === 1440 ? 0.7 :
                             0.4; // 4K

        const [cpuData, gpuData, gameData] = await Promise.all([
            fetchComponentData('cpus').then(cpus => cpus.find(c => c.id === input.cpu)),
            fetchComponentData('gpus').then(gpus => gpus.find(g => g.id === input.gpu)),
            fetchComponentData('games').then(games => games.find(g => g.id === input.game))
        ]);

        const perfScore = (cpuData.performance * 0.3 + gpuData.performance * 0.7) * baseMultiplier;
        
        return {
            avgFps: Math.round(perfScore),
            minFps: Math.round(perfScore * 0.8),
            maxFps: Math.round(perfScore * 1.2),
            rating: this.calculateRating(perfScore),
            recommendations: this.generateRecommendations(input, perfScore),
            products: this.getRecommendedProducts(input, perfScore)
        };
    }

    calculateRating(perfScore) {
        if (perfScore >= 144) return { score: 5, text: '¡Excelente! Rendimiento de primera clase' };
        if (perfScore >= 100) return { score: 4, text: 'Muy bueno. Ideal para gaming competitivo' };
        if (perfScore >= 60) return { score: 3, text: 'Bueno. Experiencia de juego fluida' };
        if (perfScore >= 30) return { score: 2, text: 'Regular. Jugable pero con limitaciones' };
        return { score: 1, text: 'Bajo. Considera actualizar componentes' };
    }

    generateRecommendations(input, perfScore) {
        const recommendations = [];

        if (input.ram < 16) {
            recommendations.push('Considera aumentar la RAM a 16GB para mejor rendimiento');
        }

        if (perfScore < 60) {
            recommendations.push('Para mejor rendimiento, considera una GPU más potente');
            if (input.resolution > 1080) {
                recommendations.push('Reducir la resolución mejorará significativamente los FPS');
            }
        }

        return recommendations;
    }

    getRecommendedProducts(input, perfScore) {
        // En producción, esto vendría de la API de Amazon
        return [
            {
                name: 'Ejemplo GPU Recomendada',
                price: 299.99,
                image: '/images/gpu.jpg',
                asin: 'XXXXX',
                description: 'GPU recomendada para mejor rendimiento'
            }
        ];
    }

    displayResults() {
        this.resultDiv.style.display = 'block';

        // Actualizar métricas de FPS
        document.getElementById('avg-fps').textContent = this.results.avgFps;
        document.getElementById('min-fps').textContent = this.results.minFps;
        document.getElementById('max-fps').textContent = this.results.maxFps;

        // Actualizar barra de rating
        const ratingBar = document.querySelector('.rating-fill');
        ratingBar.style.width = `${this.results.rating.score * 20}%`;
        document.getElementById('rating-text').textContent = this.results.rating.text;

        // Actualizar recomendaciones
        const recList = document.getElementById('recommendations-list');
        recList.innerHTML = this.results.recommendations
            .map(rec => `<li>${rec}</li>`)
            .join('');

        // Actualizar productos recomendados
        const prodDiv = document.getElementById('product-recommendations');
        prodDiv.innerHTML = this.results.products
            .map(product => `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>${product.description}</p>
                    </div>
                    <div class="product-price">
                        <span>${formatCurrency(product.price)}</span>
                        <a href="${generateAmazonLink(product.asin, 'firstbuilds-21')}" 
                           class="btn primary" 
                           target="_blank"
                           onclick="trackEvent('product_click', 'amazon', '${product.asin}')">
                            Ver en Amazon
                        </a>
                    </div>
                </div>
            `)
            .join('');

        // Actualizar anuncios
        (adsbygoogle = window.adsbygoogle || []).push({});
    }

    calculateFPS(cpu, gpu, game) {
        const baseFPS = (cpu.performance * gpu.performance * game.performance) * 100;
        
        // Ajustes por resolución
        const resolutionMultipliers = {
            '1080': 1,
            '1440': 0.7,
            '2160': 0.4
        };

        let fps = baseFPS * resolutionMultipliers[this.selectedResolution];

        // Ajustes por calidad gráfica
        const settingsSelect = document.getElementById('settings');
        const qualityMultipliers = {
            'low': 1.3,
            'medium': 1,
            'high': 0.8,
            'ultra': 0.6
        };
        fps *= qualityMultipliers[settingsSelect.value];

        // Ray Tracing impact
        if (this.rayTracingEnabled) {
            fps *= 0.7;
        }

        // DLSS/FSR boost
        if (this.dlssEnabled) {
            fps *= 1.4;
        }

        // RAM impact
        const ramSelect = document.getElementById('ram');
        const minRam = game.requirements.minRam;
        if (parseInt(ramSelect.value) < minRam) {
            fps *= 0.8;
        }

        return {
            average: Math.round(fps),
            lowOne: Math.round(fps * 0.8)
        };
    }

    updateCharts(fps) {
        const maxFPS = 200;
        
        this.charts.average.data.datasets[0].data = [fps.average, maxFPS - fps.average];
        this.charts.lowOne.data.datasets[0].data = [fps.lowOne, maxFPS - fps.lowOne];
        
        this.charts.average.update();
        this.charts.lowOne.update();

        document.querySelectorAll('.fps-number')[0].textContent = fps.average;
        document.querySelectorAll('.fps-number')[1].textContent = fps.lowOne;

        // Actualizar color según rendimiento
        const colors = fps.average > 100 ? 
            ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.1)'] :
            fps.average > 60 ?
            ['rgba(79, 70, 229, 0.8)', 'rgba(79, 70, 229, 0.1)'] :
            ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.1)'];

        this.charts.average.data.datasets[0].backgroundColor = colors;
        this.charts.lowOne.data.datasets[0].backgroundColor = colors;
    }

    updateTips(fps, cpu, gpu, game) {
        const tipsList = document.querySelector('.tips-list');
        tipsList.innerHTML = '';

        const tips = [];

        if (fps.average < 60) {
            tips.push({
                icon: 'exclamation-circle',
                title: 'Rendimiento Bajo',
                text: 'Considera reducir la calidad gráfica o actualizar tus componentes.'
            });
        }

        if (this.rayTracingEnabled && !gpu.rtxSupport) {
            tips.push({
                icon: 'info-circle',
                title: 'Ray Tracing No Soportado',
                text: 'Tu GPU no soporta ray tracing. Desactívalo para mejor rendimiento.'
            });
        }

        if (parseInt(document.getElementById('ram').value) < game.requirements.recRam) {
            tips.push({
                icon: 'memory',
                title: 'RAM Insuficiente',
                text: `Se recomiendan ${game.requirements.recRam}GB de RAM para este juego.`
            });
        }

        tips.forEach(tip => {
            tipsList.innerHTML += `
                <li>
                    <i class="fas fa-${tip.icon}"></i>
                    <div class="tip-content">
                        <strong>${tip.title}</strong>
                        <p>${tip.text}</p>
                    </div>
                </li>
            `;
        });
    }

    showUpgradeSuggestions(fps, cpu, gpu) {
        const suggestions = document.querySelector('.upgrade-suggestions');
        suggestions.innerHTML = '';

        if (fps.average < 60) {
            const bottleneck = this.calculateBottleneck(cpu, gpu);
            const suggestedUpgrade = bottleneck === 'cpu' ? 
                this.suggestCPUUpgrade(cpu) :
                this.suggestGPUUpgrade(gpu);

            if (suggestedUpgrade) {
                suggestions.innerHTML = `
                    <div class="upgrade-card">
                        <h4>Actualización Recomendada</h4>
                        <div class="upgrade-details">
                            <img src="../images/components/${suggestedUpgrade.id}.jpg" alt="${suggestedUpgrade.name}">
                            <div class="upgrade-info">
                                <h5>${suggestedUpgrade.name}</h5>
                                <p>Mejora estimada: +${suggestedUpgrade.improvement}%</p>
                                <a href="${suggestedUpgrade.affiliateUrl}" class="btn primary" target="_blank" rel="nofollow">
                                    Ver Precio
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    }

    calculateBottleneck(cpu, gpu) {
        return cpu.performance < gpu.performance ? 'cpu' : 'gpu';
    }

    suggestCPUUpgrade(currentCpu) {
        const betterCpus = this.cpuData
            .filter(cpu => cpu.performance > currentCpu.performance)
            .sort((a, b) => a.performance - b.performance);

        return betterCpus[0];
    }

    suggestGPUUpgrade(currentGpu) {
        const betterGpus = this.gpuData
            .filter(gpu => gpu.performance > currentGpu.performance)
            .sort((a, b) => a.performance - b.performance);

        return betterGpus[0];
    }

    showResult() {
        this.resultDiv.classList.add('active');
        this.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Inicializar la calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new FPSCalculator();
});
