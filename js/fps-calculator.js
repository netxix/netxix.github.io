class FPSCalculator extends PCTool {
    constructor() {
        super();
        this.form = document.getElementById('fps-calculator-form');
        this.resultDiv = document.getElementById('fps-result');
        this.init();
    }

    async init() {
        try {
            // Cargar datos de componentes
            const [cpus, gpus, games] = await Promise.all([
                fetchComponentData('cpus'),
                fetchComponentData('gpus'),
                fetchComponentData('games')
            ]);

            // Poblar selectores
            this.populateSelect('cpu', cpus);
            this.populateSelect('gpu', gpus);
            this.populateSelect('game', games);

            // Event listeners
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculate();
            });
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
}

// Inicializar la calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new FPSCalculator();
});
