class PowerCalculator {
    constructor() {
        this.cpus = [];
        this.gpus = [];
        this.init();
    }

    async init() {
        await this.loadComponents();
        this.setupEventListeners();
        this.populateSelects();
    }

    async loadComponents() {
        try {
            const [cpuResponse, gpuResponse] = await Promise.all([
                fetch('/data/cpus.json'),
                fetch('/data/gpus.json')
            ]);
            
            const cpuData = await cpuResponse.json();
            const gpuData = await gpuResponse.json();
            
            this.cpus = cpuData.cpus;
            this.gpus = gpuData.gpus;
        } catch (error) {
            console.error('Error cargando componentes:', error);
        }
    }

    setupEventListeners() {
        const calculateBtn = document.getElementById('calculate-power');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculatePower());
        }
    }

    populateSelects() {
        const cpuSelect = document.getElementById('cpu-power');
        const gpuSelect = document.getElementById('gpu-power');

        if (cpuSelect) {
            this.cpus.forEach(cpu => {
                const option = document.createElement('option');
                option.value = cpu.tdp;
                option.textContent = cpu.name;
                cpuSelect.appendChild(option);
            });
        }

        if (gpuSelect) {
            this.gpus.forEach(gpu => {
                const option = document.createElement('option');
                option.value = this.getGPUPower(gpu);
                option.textContent = gpu.name;
                gpuSelect.appendChild(option);
            });
        }
    }

    getGPUPower(gpu) {
        // Estimación de TDP basada en rendimiento
        const basePower = 75;
        return Math.round(basePower * gpu.performance);
    }

    calculatePower() {
        const cpuPower = parseInt(document.getElementById('cpu-power').value) || 0;
        const gpuPower = parseInt(document.getElementById('gpu-power').value) || 0;
        const rgbFans = parseInt(document.getElementById('rgb-fans').value) || 0;

        // Potencia base del sistema
        const basePower = 100; // Placa base, RAM, almacenamiento, etc.
        const fanPower = rgbFans * 5; // 5W por ventilador RGB

        // Cálculo total con margen del 30%
        const totalPower = (cpuPower + gpuPower + basePower + fanPower);
        const recommendedPower = Math.ceil(totalPower * 1.3 / 50) * 50; // Redondeo a 50W más cercano

        this.displayResults(recommendedPower, totalPower);
    }

    displayResults(recommendedPower, totalPower) {
        const resultValue = document.querySelector('.result-value');
        const recommendation = document.querySelector('.result-recommendation');

        if (resultValue) {
            resultValue.textContent = `${recommendedPower}W`;
        }

        if (recommendation) {
            let text = '';
            if (recommendedPower <= 550) {
                text = 'Una fuente de 550W de calidad será suficiente.';
            } else if (recommendedPower <= 750) {
                text = 'Recomendamos una fuente de 750W para futura expansión.';
            } else if (recommendedPower <= 1000) {
                text = 'Considera una fuente de 1000W para overclocking.';
            } else {
                text = 'Necesitarás una fuente de alta potencia de 1200W o más.';
            }
            recommendation.textContent = text;
        }

        // Animar el resultado
        const resultBox = document.querySelector('.calculator-result');
        resultBox.classList.add('show-result');
        
        // Resaltar fuentes de alimentación recomendadas
        this.highlightRecommendedPSUs(recommendedPower);
    }

    highlightRecommendedPSUs(recommendedPower) {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const powerValue = parseInt(card.dataset.power);
            if (powerValue >= recommendedPower) {
                card.classList.add('recommended');
            } else {
                card.classList.remove('recommended');
            }
        });
    }
}

// Inicializar la calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PowerCalculator();
});
