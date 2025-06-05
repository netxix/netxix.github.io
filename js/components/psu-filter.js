class PSUFilter {
    constructor() {
        this.products = [];
        this.filters = {
            price: { min: 0, max: Infinity },
            power: 'all',
            certification: 'all',
            modularity: 'all'
        };
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupFilters();
        this.render();
    }

    async loadProducts() {
        try {
            const response = await fetch('/data/psu.json');
            const data = await response.json();
            this.products = data.psu;
            this.setupPriceRange();
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    }

    setupPriceRange() {
        const prices = this.products.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const priceRange = document.querySelector('.price-range');
        if (!priceRange) return;

        noUiSlider.create(priceRange, {
            start: [minPrice, maxPrice],
            connect: true,
            range: {
                'min': minPrice,
                'max': maxPrice
            },
            format: {
                to: value => Math.round(value),
                from: value => Number(value)
            }
        });

        priceRange.noUiSlider.on('update', (values) => {
            this.filters.price.min = values[0];
            this.filters.price.max = values[1];
            this.render();
        });
    }

    setupFilters() {
        // Power Filter
        const powerFilter = document.querySelector('.power-filter');
        if (powerFilter) {
            powerFilter.addEventListener('change', (e) => {
                this.filters.power = e.target.value;
                this.render();
            });
        }

        // Certification Filter
        const certFilter = document.querySelector('.certification-filter');
        if (certFilter) {
            certFilter.addEventListener('change', (e) => {
                this.filters.certification = e.target.value;
                this.render();
            });
        }

        // Modularity Filter
        const modFilter = document.querySelector('.modularity-filter');
        if (modFilter) {
            modFilter.addEventListener('change', (e) => {
                this.filters.modularity = e.target.value;
                this.render();
            });
        }
    }

    filterProducts() {
        return this.products.filter(product => {
            const matchesPrice = product.price >= this.filters.price.min && 
                               product.price <= this.filters.price.max;
            
            let matchesPower = true;
            if (this.filters.power !== 'all') {
                const powerValue = parseInt(this.filters.power);
                if (powerValue === 650) {
                    matchesPower = product.watts <= 650;
                } else if (powerValue === 850) {
                    matchesPower = product.watts > 650 && product.watts <= 850;
                } else if (powerValue === 1000) {
                    matchesPower = product.watts >= 1000;
                }
            }

            const matchesCert = this.filters.certification === 'all' || 
                              product.certification.toLowerCase().includes(this.filters.certification);
            
            const matchesModularity = this.filters.modularity === 'all' || 
                                    product.modularity === this.filters.modularity;

            return matchesPrice && matchesPower && matchesCert && matchesModularity;
        });
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    getCertificationClass(cert) {
        if (cert.includes('Bronze')) return 'bronze';
        if (cert.includes('Gold')) return 'gold';
        if (cert.includes('Platinum')) return 'platinum';
        if (cert.includes('Titanium')) return 'titanium';
        return '';
    }

    render() {
        const container = document.getElementById('products-list');
        if (!container) return;

        const filteredProducts = this.filterProducts();
        
        container.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-aos="fade-up" data-category="psu" data-power="${product.watts}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.stock ? '<span class="stock-badge">En Stock</span>' : ''}
                    <span class="cert-badge ${this.getCertificationClass(product.certification)}">
                        ${product.certification}
                    </span>
                </div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <div class="product-specs">
                        <span><i class="fas fa-bolt"></i> ${product.watts}W</span>
                        <span><i class="fas fa-plug"></i> ${product.modularity === 'full' ? 'Full Modular' : 
                                                          product.modularity === 'semi' ? 'Semi Modular' : 
                                                          'No Modular'}</span>
                        <span class="cert-tag ${this.getCertificationClass(product.certification)}">
                            <i class="fas fa-certificate"></i> ${product.certification}
                        </span>
                    </div>
                    <div class="product-features">
                        ${product.features.map(feature => 
                            `<span><i class="fas fa-check"></i> ${feature}</span>`
                        ).join('')}
                    </div>
                    <div class="efficiency-chart">
                        <div class="chart-item">
                            <span class="chart-label">20%</span>
                            <div class="chart-bar" style="--eff: ${product.efficiency['20']}%"></div>
                            <span class="chart-value">${product.efficiency['20']}%</span>
                        </div>
                        <div class="chart-item">
                            <span class="chart-label">50%</span>
                            <div class="chart-bar" style="--eff: ${product.efficiency['50']}%"></div>
                            <span class="chart-value">${product.efficiency['50']}%</span>
                        </div>
                        <div class="chart-item">
                            <span class="chart-label">100%</span>
                            <div class="chart-bar" style="--eff: ${product.efficiency['100']}%"></div>
                            <span class="chart-value">${product.efficiency['100']}%</span>
                        </div>
                    </div>
                    <div class="product-price">
                        <span class="price">${this.formatPrice(product.price)}</span>
                        <a href="https://www.amazon.es/dp/${product.asin}?tag=firstbuilds-21" 
                           class="btn btn-buy" 
                           target="_blank"
                           rel="noopener"
                           onclick="trackAffiliateClick('psu', '${product.name}')">
                            <i class="fas fa-shopping-cart"></i>
                            Comprar en Amazon
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Inicializar el filtro cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PSUFilter();
});
