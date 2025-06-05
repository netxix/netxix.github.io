class CompatibilityChecker {
    constructor() {
        this.components = {};
    }

    addComponent(type, component) {
        this.components[type] = component;
        this.checkCompatibility();
    }

    checkCompatibility() {
        const issues = [];
        
        // CPU and Motherboard compatibility
        if (this.components.cpu && this.components.motherboard) {
            if (this.components.cpu.socket !== this.components.motherboard.socket) {
                issues.push({
                    severity: 'error',
                    message: `Socket incompatible: CPU (${this.components.cpu.socket}) no es compatible con placa base (${this.components.motherboard.socket})`
                });
            }
        }

        // RAM compatibility
        if (this.components.ram && this.components.motherboard) {
            if (this.components.ram.type !== this.components.motherboard.memoryType) {
                issues.push({
                    severity: 'error',
                    message: `Tipo de RAM incompatible: ${this.components.ram.type} no es compatible con placa base (${this.components.motherboard.memoryType})`
                });
            }
            if (this.components.ram.speed > this.components.motherboard.maxMemorySpeed) {
                issues.push({
                    severity: 'warning',
                    message: `La velocidad de RAM (${this.components.ram.speed}MHz) excede el máximo soportado (${this.components.motherboard.maxMemorySpeed}MHz)`
                });
            }
        }

        // Power supply requirements
        if (this.components.gpu && this.components.psu) {
            const totalPower = this.calculateTotalPower();
            if (this.components.psu.wattage < totalPower) {
                issues.push({
                    severity: 'error',
                    message: `Fuente de alimentación insuficiente: Se requieren ${totalPower}W, PSU actual: ${this.components.psu.wattage}W`
                });
            }
        }

        // Case compatibility
        if (this.components.case && this.components.motherboard) {
            if (!this.components.case.formFactors.includes(this.components.motherboard.formFactor)) {
                issues.push({
                    severity: 'error',
                    message: `Gabinete no compatible: No soporta factor de forma ${this.components.motherboard.formFactor}`
                });
            }
        }

        this.displayIssues(issues);
    }

    calculateTotalPower() {
        let total = 0;
        
        // Base system power
        total += 50;

        // CPU power
        if (this.components.cpu) {
            total += this.components.cpu.tdp;
        }

        // GPU power
        if (this.components.gpu) {
            total += this.components.gpu.tdp;
        }

        // Add 20% overhead for safety
        total = Math.ceil(total * 1.2);

        return total;
    }

    displayIssues(issues) {
        const container = document.getElementById('compatibility-issues');
        if (!container) return;

        if (issues.length === 0) {
            container.innerHTML = '<div class="alert alert-success">Todos los componentes son compatibles</div>';
            return;
        }

        const html = issues.map(issue => `
            <div class="alert alert-${issue.severity === 'error' ? 'danger' : 'warning'}">
                <i class="fas fa-${issue.severity === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
                ${issue.message}
            </div>
        `).join('');

        container.innerHTML = html;
    }
}

// Export para uso en otros módulos
window.CompatibilityChecker = CompatibilityChecker;
