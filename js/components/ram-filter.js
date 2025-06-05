class RAMFilter {
    constructor() {
        this.products = [];
        this.filters = {
            price: { min: 0, max: Infinity },
            type: 'all',
            capacity: 'all',
            speed: 'all'
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
            const response = await fetch('/data/ram.json');
            const data = await response.json();
            this.products = data.ram;
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

        // Speed Filter
        const speedFilter = document.querySelector('.speed-filter');
        if (speedFilter) {
            speedFilter.addEventListener('change', (e) => {
                this.filters.speed = e.target.value;
                this.render();
            });
        }
    }

    filterProducts() {
        return this.products.filter(product => {
            const matchesPrice = product.price >= this.filters.price.min && 
                               product.price <= this.filters.price.max;
            const matchesType = this.filters.type === 'all' || 
                              product.type.toLowerCase() === this.filters.type;
            
            let matchesCapacity = true;
            if (this.filters.capacity !== 'all') {
                const capacityValue = parseInt(this.filters.capacity);
                if (capacityValue === 64) {
                    matchesCapacity = product.capacity >= 64;
                } else {
                    matchesCapacity = product.capacity === capacityValue;
                }
            }

            let matchesSpeed = this.filters.speed === 'all' || 
                             product.speed === this.filters.speed;

            return matchesPrice && matchesType && matchesCapacity && matchesSpeed;
        });
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    render() {
        const container = document.getElementById('products-list');
        if (!container) return;

        const filteredProducts = this.filterProducts();
        
        container.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-aos="fade-up" data-category="ram">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.stock ? '<span class="stock-badge">En Stock</span>' : ''}
                </div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <div class="product-specs">
                        <span><i class="fas fa-memory"></i> ${product.capacity}GB ${product.type}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${product.speed}</span>
                        <span><i class="fas fa-clock"></i> CL${product.latency}</span>
                    </div>
                    <div class="product-features">
                        <span><i class="fas fa-check"></i> ${product.type} ${product.speed}</span>
                        <span><i class="fas fa-check"></i> Latencia CL${product.latency}</span>
                        <span><i class="fas fa-check"></i> Kit de ${product.modules} módulos</span>
                        ${product.rgb ? '<span><i class="fas fa-lightbulb"></i> Iluminación RGB</span>' : ''}
                    </div>
                    <div class="performance-indicators">
                        <div class="perf-item">
                            <span class="perf-label">Rendimiento</span>
                            <div class="perf-bar" style="--perf: ${product.performance}%"></div>
                        </div>
                    </div>
                    <div class="product-price">
                        <span class="price">${this.formatPrice(product.price)}</span>
                        <a href="https://www.amazon.es/dp/${product.asin}?tag=firstbuilds-21" 
                           class="btn btn-buy" 
                           target="_blank"
                           rel="noopener"
                           onclick="trackAffiliateClick('ram', '${product.name}')">
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
    new RAMFilter();
});
