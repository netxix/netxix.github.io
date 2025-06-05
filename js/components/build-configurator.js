class BuildConfigurator {
    constructor() {
        this.currentBuild = {
            cpu: null,
            motherboard: null,
            ram: null,
            gpu: null,
            storage: [],
            psu: null,
            case: null,
            cooling: null
        };
        this.compatibility = new CompatibilityChecker();
        this.init();
    }

    init() {
        this.loadSavedBuild();
        this.setupEventListeners();
        this.updateBuildSummary();
    }

    loadSavedBuild() {
        const saved = localStorage.getItem('currentBuild');
        if (saved) {
            this.currentBuild = JSON.parse(saved);
        }
    }

    saveBuild() {
        localStorage.setItem('currentBuild', JSON.stringify(this.currentBuild));
    }

    setupEventListeners() {
        document.addEventListener('click', e => {
            if (e.target.matches('.add-to-build')) {
                const component = {
                    type: e.target.dataset.type,
                    id: e.target.dataset.id
                };
                this.addComponent(component);
            }
            if (e.target.matches('.remove-from-build')) {
                const type = e.target.dataset.type;
                this.removeComponent(type);
            }
        });
    }

    async addComponent(component) {
        try {
            const data = await this.fetchComponentData(component.type, component.id);
            if (!data) return;

            // Si es almacenamiento, podemos tener múltiples
            if (component.type === 'storage') {
                this.currentBuild.storage.push(data);
            } else {
                this.currentBuild[component.type] = data;
            }

            this.checkCompatibility();
            this.saveBuild();
            this.updateBuildSummary();
            this.updatePowerRequirements();
        } catch (error) {
            console.error('Error adding component:', error);
        }
    }

    removeComponent(type) {
        if (type === 'storage') {
            this.currentBuild.storage.pop();
        } else {
            this.currentBuild[type] = null;
        }

        this.saveBuild();
        this.updateBuildSummary();
        this.updatePowerRequirements();
    }

    async fetchComponentData(type, id) {
        try {
            const response = await fetch(`../data/${type}.json`);
            const data = await response.json();
            return data[type].find(c => c.id === id);
        } catch (error) {
            console.error('Error fetching component data:', error);
            return null;
        }
    }

    checkCompatibility() {
        const issues = [];

        // CPU y placa base
        if (this.currentBuild.cpu && this.currentBuild.motherboard) {
            if (this.currentBuild.cpu.socket !== this.currentBuild.motherboard.socket) {
                issues.push({
                    severity: 'error',
                    message: 'Socket incompatible entre CPU y placa base'
                });
            }
        }

        // RAM
        if (this.currentBuild.ram && this.currentBuild.motherboard) {
            if (this.currentBuild.ram.type !== this.currentBuild.motherboard.memoryType) {
                issues.push({
                    severity: 'error',
                    message: 'Tipo de RAM incompatible con la placa base'
                });
            }
        }

        // Fuente de alimentación
        if (this.currentBuild.psu) {
            const requiredPower = this.calculateTotalPower();
            if (this.currentBuild.psu.wattage < requiredPower) {
                issues.push({
                    severity: 'error',
                    message: `Fuente de alimentación insuficiente. Requerido: ${requiredPower}W`
                });
            }
        }

        this.displayCompatibilityIssues(issues);
        return issues.length === 0;
    }

    calculateTotalPower() {
        let total = 0;

        // CPU
        if (this.currentBuild.cpu) {
            total += this.currentBuild.cpu.tdp;
        }

        // GPU
        if (this.currentBuild.gpu) {
            total += this.currentBuild.gpu.tdp;
        }

        // Otros componentes
        total += 100; // Base system power
        
        // Margen de seguridad del 20%
        return Math.ceil(total * 1.2);
    }

    updateBuildSummary() {
        const container = document.getElementById('build-summary');
        if (!container) return;

        let html = '<div class="build-components">';
        
        // CPU
        html += this.generateComponentCard('cpu', 'Procesador');
        
        // Placa base
        html += this.generateComponentCard('motherboard', 'Placa Base');
        
        // RAM
        html += this.generateComponentCard('ram', 'Memoria RAM');
        
        // GPU
        html += this.generateComponentCard('gpu', 'Tarjeta Gráfica');
        
        // Almacenamiento
        html += this.generateStorageCards();
        
        // Fuente
        html += this.generateComponentCard('psu', 'Fuente de Alimentación');
        
        // Gabinete
        html += this.generateComponentCard('case', 'Gabinete');

        html += '</div>';

        // Resumen de precio
        const totalPrice = this.calculateTotalPrice();
        html += `
            <div class="build-summary-footer">
                <div class="total-price">
                    <span>Precio Total:</span>
                    <span class="price">${totalPrice.toFixed(2)}€</span>
                </div>
                <button class="save-build-btn" ${this.isValidBuild() ? '' : 'disabled'}>
                    Guardar Build
                </button>
                <button class="share-build-btn" ${this.isValidBuild() ? '' : 'disabled'}>
                    Compartir
                </button>
            </div>
        `;

        container.innerHTML = html;
    }

    generateComponentCard(type, label) {
        const component = this.currentBuild[type];
        if (!component) {
            return `
                <div class="component-slot empty" data-type="${type}">
                    <div class="component-label">${label}</div>
                    <div class="empty-message">
                        <i class="fas fa-plus-circle"></i>
                        <span>Añadir ${label}</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="component-slot" data-type="${type}">
                <div class="component-label">${label}</div>
                <div class="component-details">
                    <img src="../images/components/${component.id}.jpg" alt="${component.name}">
                    <div class="component-info">
                        <h4>${component.name}</h4>
                        <span class="price">${component.price.toFixed(2)}€</span>
                    </div>
                    <button class="remove-from-build" data-type="${type}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    generateStorageCards() {
        let html = `
            <div class="component-slot storage-slot">
                <div class="component-label">Almacenamiento</div>
                <div class="storage-list">
        `;

        this.currentBuild.storage.forEach((storage, index) => {
            html += `
                <div class="storage-item">
                    <img src="../images/components/${storage.id}.jpg" alt="${storage.name}">
                    <div class="storage-info">
                        <h4>${storage.name}</h4>
                        <span>${storage.capacity}GB ${storage.type}</span>
                        <span class="price">${storage.price.toFixed(2)}€</span>
                    </div>
                    <button class="remove-from-build" data-type="storage" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        if (this.currentBuild.storage.length < 4) {
            html += `
                <div class="add-storage">
                    <i class="fas fa-plus-circle"></i>
                    <span>Añadir Almacenamiento</span>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    }

    calculateTotalPrice() {
        let total = 0;
        
        // Componentes principales
        ['cpu', 'motherboard', 'ram', 'gpu', 'psu', 'case', 'cooling'].forEach(type => {
            if (this.currentBuild[type]) {
                total += this.currentBuild[type].price;
            }
        });

        // Almacenamiento
        this.currentBuild.storage.forEach(storage => {
            total += storage.price;
        });

        return total;
    }

    isValidBuild() {
        // Componentes mínimos requeridos
        const required = ['cpu', 'motherboard', 'ram', 'psu'];
        return required.every(type => this.currentBuild[type]) && 
               this.currentBuild.storage.length > 0 &&
               this.checkCompatibility();
    }

    displayCompatibilityIssues(issues) {
        const container = document.getElementById('compatibility-issues');
        if (!container) return;

        if (issues.length === 0) {
            container.innerHTML = '<div class="alert success">Todos los componentes son compatibles</div>';
            return;
        }

        const html = issues.map(issue => `
            <div class="alert ${issue.severity}">
                <i class="fas fa-exclamation-triangle"></i>
                ${issue.message}
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updatePowerRequirements() {
        const container = document.getElementById('power-requirements');
        if (!container) return;

        const requiredPower = this.calculateTotalPower();
        const currentPsu = this.currentBuild.psu;

        container.innerHTML = `
            <div class="power-info">
                <h3>Requerimientos de Energía</h3>
                <div class="power-details">
                    <div class="power-meter">
                        <div class="meter-fill" style="width: ${currentPsu ? (requiredPower / currentPsu.wattage * 100) : 0}%"></div>
                        <span>${requiredPower}W / ${currentPsu ? currentPsu.wattage : '???'}W</span>
                    </div>
                    <div class="power-recommendation">
                        ${this.getPowerRecommendation(requiredPower, currentPsu)}
                    </div>
                </div>
            </div>
        `;
    }

    getPowerRecommendation(required, currentPsu) {
        if (!currentPsu) {
            return `Se recomienda una fuente de al menos ${Math.ceil(required / 100) * 100}W`;
        }

        if (currentPsu.wattage < required) {
            return `Tu fuente actual es insuficiente. Se recomienda actualizar a ${Math.ceil(required / 100) * 100}W`;
        }

        if (currentPsu.wattage > required * 1.5) {
            return 'Tu fuente actual tiene más capacidad de la necesaria, pero esto no afecta al rendimiento';
        }

        return 'Tu fuente actual es adecuada para esta configuración';
    }

    async shareBuild() {
        if (!this.isValidBuild()) return;

        // Generar URL compartible
        const buildData = btoa(JSON.stringify(this.currentBuild));
        const shareUrl = `${window.location.origin}/share?build=${buildData}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('¡Enlace copiado al portapapeles!');
        } catch (err) {
            console.error('Error al copiar el enlace:', err);
        }
    }
}

// Crear instancia global
window.buildConfigurator = new BuildConfigurator();
