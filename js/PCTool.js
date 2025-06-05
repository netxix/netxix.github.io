class PCTool {
    constructor() {
        this.loading = false;
        this.error = null;
    }

    showLoading() {
        this.loading = true;
        const loadingEl = document.querySelector('.tool-loading');
        if (loadingEl) loadingEl.style.display = 'flex';
    }

    hideLoading() {
        this.loading = false;
        const loadingEl = document.querySelector('.tool-loading');
        if (loadingEl) loadingEl.style.display = 'none';
    }

    showError(message) {
        this.error = message;
        const errorEl = document.querySelector('.tool-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    hideError() {
        this.error = null;
        const errorEl = document.querySelector('.tool-error');
        if (errorEl) errorEl.style.display = 'none';
    }

    async fetchComponentData(type) {
        try {
            const response = await fetch(`/data/${type}.json`);
            if (!response.ok) throw new Error('Error al cargar datos');
            return await response.json();
        } catch (error) {
            this.showError(`Error al cargar datos de ${type}: ${error.message}`);
            return null;
        }
    }

    populateSelect(id, data) {
        const select = document.getElementById(id);
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar...</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            select.appendChild(option);
        });
    }
}
