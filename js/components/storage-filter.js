class StorageFilter {
    constructor() {
        this.products = [];
        this.filters = {
            price: { min: 0, max: Infinity },
            type: 'all',
            capacity: 'all',
            usage: 'all'
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
            const response = await fetch('/data/storage.json');
            const data = await response.json();
            this.products = data.storage;
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
        // Type Filter
        const typeFilter = document.querySelector('.type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.render();
            });
        }

        // Capacity Filter
        const capacityFilter = document.querySelector('.capacity-filter');
        if (capacityFilter) {
            capacityFilter.addEventListener('change', (e) => {
                this.filters.capacity = e.target.value;
                this.render();
            });
        }

        // Usage Filter
        const usageFilter = document.querySelector('.usage-filter');
        if (usageFilter) {
            usageFilter.addEventListener('change', (e) => {
                this.filters.usage = e.target.value;
                this.render();
            });
        }
    }

    filterProducts() {
        return this.products.filter(product => {
            const matchesPrice = product.price >= this.filters.price.min && 
                               product.price <= this.filters.price.max;
            const matchesType = this.filters.type === 'all' || 
                              product.type === this.filters.type;
            
            let matchesCapacity = true;
            if (this.filters.capacity !== 'all') {
                const capacity = parseInt(product.capacity);
                const filterValue = parseInt(this.filters.capacity);
                
                if (filterValue === 500) {
                    matchesCapacity = capacity >= 500 && capacity <= 1000;
                } else if (filterValue === 2000) {
                    matchesCapacity = capacity >= 2000 && capacity <= 4000;
                } else if (filterValue === 4000) {
                    matchesCapacity = capacity > 4000;
                }
            }

            let matchesUsage = this.filters.usage === 'all' || 
                             product.recommendedUse.includes(this.filters.usage);

            return matchesPrice && matchesType && matchesCapacity && matchesUsage;
        });
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    formatCapacity(gb) {
        if (gb >= 1000) {
            return `${gb/1000}TB`;
        }
        return `${gb}GB`;
    }

    formatSpeed(speed, type) {
        if (type === 'nvme') {
            return `${speed.read}/s lectura`;
        } else if (type === 'sata') {
            return `${speed.read}/s lectura`;
        } else {
            return `${speed.rpm} RPM`;
        }
    }

    render() {
        const container = document.getElementById('products-list');
        if (!container) return;

        const filteredProducts = this.filterProducts();
        
        container.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-aos="fade-up" data-category="storage">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.stock ? '<span class="stock-badge">En Stock</span>' : ''}
                    ${product.type === 'nvme' ? '<span class="feature-badge nvme">NVMe</span>' : ''}
                </div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <div class="product-specs">
                        <span><i class="fas fa-hdd"></i> ${this.formatCapacity(product.capacity)}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${this.formatSpeed(product.speed, product.type)}</span>
                        <span><i class="fas fa-microchip"></i> ${product.interface}</span>
                    </div>
                    <div class="product-features">
                        ${product.features.map(feature => 
                            `<span><i class="fas fa-check"></i> ${feature}</span>`
                        ).join('')}
                    </div>
                    <div class="performance-indicators">
                        <div class="perf-item">
                            <span class="perf-label">Velocidad</span>
                            <div class="perf-bar" style="--perf: ${product.performance}%"></div>
                        </div>
                    </div>
                    <div class="product-price">
                        <span class="price">${this.formatPrice(product.price)}</span>
                        <a href="https://www.amazon.es/dp/${product.asin}?tag=firstbuilds-21" 
                           class="btn btn-buy" 
                           target="_blank"
                           rel="noopener"
                           onclick="trackAffiliateClick('storage', '${product.name}')">
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
    new StorageFilter();
});
