class ComponentComparison {
    constructor() {
        this.comparedItems = new Map();
        this.maxItems = 4;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadComparedItems();
    }

    setupEventListeners() {
        document.addEventListener('click', e => {
            if (e.target.matches('.compare-btn')) {
                const componentId = e.target.dataset.componentId;
                const componentType = e.target.dataset.componentType;
                this.toggleComparison(componentId, componentType);
            }
        });
    }

    loadComparedItems() {
        // Cargar items guardados en localStorage
        const saved = localStorage.getItem('comparedItems');
        if (saved) {
            this.comparedItems = new Map(JSON.parse(saved));
            this.updateCompareButtons();
            this.updateComparisonPanel();
        }
    }

    async toggleComparison(componentId, type) {
        if (this.comparedItems.has(componentId)) {
            this.comparedItems.delete(componentId);
        } else {
            if (this.comparedItems.size >= this.maxItems) {
                alert(`Solo puedes comparar hasta ${this.maxItems} componentes a la vez`);
                return;
            }

            // Cargar datos del componente
            try {
                const response = await fetch(`../data/${type}.json`);
                const data = await response.json();
                const component = data[type].find(c => c.id === componentId);
                if (component) {
                    this.comparedItems.set(componentId, {
                        type,
                        data: component
                    });
                }
            } catch (error) {
                console.error('Error loading component data:', error);
                return;
            }
        }

        this.saveComparedItems();
        this.updateCompareButtons();
        this.updateComparisonPanel();
    }

    saveComparedItems() {
        localStorage.setItem('comparedItems', 
            JSON.stringify(Array.from(this.comparedItems.entries())));
    }

    updateCompareButtons() {
        document.querySelectorAll('.compare-btn').forEach(btn => {
            const componentId = btn.dataset.componentId;
            if (this.comparedItems.has(componentId)) {
                btn.classList.add('active');
                btn.textContent = 'Quitar comparación';
            } else {
                btn.classList.remove('active');
                btn.textContent = 'Comparar';
            }
        });
    }

    updateComparisonPanel() {
        const panel = document.getElementById('comparison-panel');
        if (!panel) return;

        if (this.comparedItems.size === 0) {
            panel.style.display = 'none';
            return;
        }

        panel.style.display = 'block';
        panel.innerHTML = this.generateComparisonTable();
    }

    generateComparisonTable() {
        const items = Array.from(this.comparedItems.values());
        if (items.length === 0) return '';

        const type = items[0].type;
        const specs = this.getSpecsForType(type);

        let html = `
            <div class="comparison-table-container">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Especificación</th>
                            ${items.map(item => `
                                <th>
                                    <div class="compared-item-header">
                                        <img src="../images/components/${item.data.id}.jpg" alt="${item.data.name}">
                                        <span>${item.data.name}</span>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>`;

        // Añadir filas de especificaciones
        specs.forEach(spec => {
            html += `
                <tr>
                    <td>${spec.label}</td>
                    ${items.map(item => `
                        <td>${this.formatSpecValue(spec.key, item.data[spec.key])}</td>
                    `).join('')}
                </tr>
            `;
        });

        // Añadir métricas de rendimiento
        html += `
            <tr class="performance-row">
                <td>Puntuación de Rendimiento</td>
                ${items.map(item => `
                    <td>
                        <div class="performance-bar">
                            <div class="bar" style="width: ${item.data.performance}%"></div>
                            <span>${item.data.performance}</span>
                        </div>
                    </td>
                `).join('')}
            </tr>
        `;

        html += `
                    </tbody>
                </table>
            </div>
            <div class="comparison-actions">
                <button class="clear-comparison" onclick="componentComparison.clearAll()">
                    Limpiar comparación
                </button>
            </div>
        `;

        return html;
    }

    getSpecsForType(type) {
        switch (type) {
            case 'cpus':
                return [
                    { key: 'brand', label: 'Marca' },
                    { key: 'cores', label: 'Núcleos' },
                    { key: 'threads', label: 'Hilos' },
                    { key: 'baseSpeed', label: 'Velocidad Base' },
                    { key: 'boostSpeed', label: 'Velocidad Turbo' },
                    { key: 'cache', label: 'Caché' },
                    { key: 'socket', label: 'Socket' },
                    { key: 'tdp', label: 'TDP' },
                    { key: 'price', label: 'Precio' }
                ];
            case 'gpus':
                return [
                    { key: 'brand', label: 'Marca' },
                    { key: 'vram', label: 'VRAM' },
                    { key: 'memoryType', label: 'Tipo de Memoria' },
                    { key: 'baseSpeed', label: 'Velocidad Base' },
                    { key: 'boostSpeed', label: 'Velocidad Boost' },
                    { key: 'rtxSupport', label: 'Soporte RTX' },
                    { key: 'tdp', label: 'TDP' },
                    { key: 'price', label: 'Precio' }
                ];
            // Añadir más tipos según sea necesario
            default:
                return [];
        }
    }

    formatSpecValue(key, value) {
        if (value === undefined || value === null) return 'N/A';

        switch (key) {
            case 'price':
                return `${value.toFixed(2)}€`;
            case 'rtxSupport':
                return value ? 'Sí' : 'No';
            case 'tdp':
                return `${value}W`;
            case 'vram':
                return `${value}GB`;
            default:
                return value.toString();
        }
    }

    clearAll() {
        this.comparedItems.clear();
        this.saveComparedItems();
        this.updateCompareButtons();
        this.updateComparisonPanel();
    }
}

// Crear instancia global
window.componentComparison = new ComponentComparison();
