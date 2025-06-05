class GPUFilter {
    constructor() {
        this.products = [];
        this.filters = {
            price: { min: 0, max: Infinity },
            brand: 'all',
            vram: 'all',
            performance: 'all'
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
            const response = await fetch('/data/gpus.json');
            const data = await response.json();
            this.products = data.gpus;
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
        // Brand Filter
        const brandFilter = document.querySelector('.brand-filter');
        if (brandFilter) {
            brandFilter.addEventListener('change', (e) => {
                this.filters.brand = e.target.value;
                this.render();
            });
        }

        // VRAM Filter
        const vramFilter = document.querySelector('.vram-filter');
        if (vramFilter) {
            vramFilter.addEventListener('change', (e) => {
                this.filters.vram = e.target.value;
                this.render();
            });
        }

        // Performance Filter
        const performanceFilter = document.querySelector('.performance-filter');
        if (performanceFilter) {
            performanceFilter.addEventListener('change', (e) => {
                this.filters.performance = e.target.value;
                this.render();
            });
        }
    }

    filterProducts() {
        return this.products.filter(product => {
            const matchesPrice = product.price >= this.filters.price.min && 
                               product.price <= this.filters.price.max;
            const matchesBrand = this.filters.brand === 'all' || 
                               product.brand.toLowerCase() === this.filters.brand;
            
            let matchesVRAM = true;
            if (this.filters.vram !== 'all') {
                const vramValue = parseInt(this.filters.vram);
                if (vramValue === 8) {
                    matchesVRAM = product.vram <= 8;
                } else if (vramValue === 12) {
                    matchesVRAM = product.vram === 12;
                } else if (vramValue === 16) {
                    matchesVRAM = product.vram >= 16;
                }
            }
            
            let matchesPerformance = true;
            if (this.filters.performance !== 'all') {
                const perfLevel = this.getPerformanceLevel(product.performance);
                matchesPerformance = perfLevel === this.filters.performance;
            }

            return matchesPrice && matchesBrand && matchesVRAM && matchesPerformance;
        });
    }

    getPerformanceLevel(score) {
        if (score < 0.8) return 'entry'; // Bueno para 1080p
        if (score < 1.2) return 'mid';   // Bueno para 1440p
        return 'high';                   // Bueno para 4K
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }

    generateAmazonLink(asin) {
        return `https://www.amazon.es/dp/${asin}?tag=firstbuilds-21`;
    }

    render() {
        const container = document.getElementById('products-list');
        if (!container) return;

        const filteredProducts = this.filterProducts();
        
        container.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-aos="fade-up">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.stock ? '<span class="stock-badge">En Stock</span>' : ''}
                    ${product.rayTracing ? '<span class="feature-badge ray-tracing">Ray Tracing</span>' : ''}
                </div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <div class="product-specs">
                        <span><i class="fas fa-memory"></i> ${product.vram}GB VRAM</span>
                        <span><i class="fas fa-microchip"></i> ${product.architecture}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${product.boostClock} MHz</span>
                    </div>
                    <div class="product-features">
                        ${product.features.map(feature => 
                            `<span><i class="fas fa-check"></i> ${feature}</span>`
                        ).join('')}
                    </div>
                    <div class="performance-indicators">
                        <div class="perf-item">
                            <span class="perf-label">1080p</span>
                            <div class="perf-bar" style="--perf: ${product.performance1080p}%"></div>
                        </div>
                        <div class="perf-item">
                            <span class="perf-label">1440p</span>
                            <div class="perf-bar" style="--perf: ${product.performance1440p}%"></div>
                        </div>
                        <div class="perf-item">
                            <span class="perf-label">4K</span>
                            <div class="perf-bar" style="--perf: ${product.performance4k}%"></div>
                        </div>
                    </div>
                    <div class="product-price">
                        <span class="price">${this.formatPrice(product.price)}</span>
                        <a href="${this.generateAmazonLink(product.asin)}" 
                           class="btn btn-buy" 
                           target="_blank"
                           rel="noopener"
                           onclick="trackAffiliateClick('gpu', '${product.name}')">
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
    new GPUFilter();
});
