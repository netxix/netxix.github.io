// Navegación responsive
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuDropdown = document.querySelector('.menu-dropdown');
    const isMobile = window.innerWidth <= 768;

    menuToggle.addEventListener('click', () => {
        menuDropdown.style.opacity = menuDropdown.style.opacity === '1' ? '0' : '1';
        menuDropdown.style.visibility = menuDropdown.style.visibility === 'visible' ? 'hidden' : 'visible';
        menuDropdown.style.transform = menuDropdown.style.transform === 'translateY(0px)' ? 'translateY(-10px)' : 'translateY(0)';
        menuToggle.querySelector('i').style.transform = menuDropdown.style.opacity === '1' ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // Inicializar AdSense
    (adsbygoogle = window.adsbygoogle || []).push({});

    // Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXX'); // Reemplazar con tu ID de GA
});

// Función para formatear números con comas
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Función para formatear precios
function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Función para generar enlaces de afiliados de Amazon
function generateAmazonLink(asin, tag) {
    return `https://www.amazon.es/dp/${asin}?tag=${tag}`;
}

// Clase base para las herramientas
class PCTool {
    constructor() {
        this.results = null;
    }

    validateInput() {
        // Implementar en clases hijas
        throw new Error('Method not implemented');
    }

    calculate() {
        // Implementar en clases hijas
        throw new Error('Method not implemented');
    }

    displayResults() {
        // Implementar en clases hijas
        throw new Error('Method not implemented');
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.results').prepend(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Función para cargar datos de componentes
async function fetchComponentData(type) {
    try {
        const response = await fetch(`/data/${type}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error loading component data:', error);
        return null;
    }
}

// Función para trackear eventos
function trackEvent(category, action, label) {
    gtag('event', action, {
        'event_category': category,
        'event_label': label
    });
}

// Animaciones y efectos visuales
document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const nav = document.querySelector('.main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Animación de entrada para las cards
    const cards = document.querySelectorAll('.tool-card, .guide-card, .component-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        observer.observe(card);
    });

    // Efecto hover para botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);
        });
    });

    // Efecto parallax suave en el hero
    const hero = document.querySelector('.hero');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    });

    // Inicializar menú móvil con animación
    // ...existing code...

    // Inicializar AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true,
        offset: 100
    });

    // Efecto parallax suave para el fondo del héroe
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }

    // Efecto de brillo para las tarjetas de herramientas
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            
            card.style.setProperty('--shine-x', `${x}%`);
            card.style.setProperty('--shine-y', `${y}%`);
        });
    });

    // Animación suave para el scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Agregar efecto de carga suave para imágenes
function loadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageOptions = {
        threshold: 0,
        rootMargin: '0px 0px 50px 0px'
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('fade-in');
                observer.unobserve(img);
            }
        });
    }, imageOptions);

    images.forEach(img => imageObserver.observe(img));
}

// Inicializar todas las animaciones cuando el DOM esté listo
window.addEventListener('load', () => {
    loadImages();
    // ...existing code...
});

// Exportar funciones y clases para uso en otras páginas
window.PCTool = PCTool;
window.utils = {
    formatNumber,
    formatCurrency,
    generateAmazonLink,
    fetchComponentData,
    trackEvent
};

// Component Filter Class
class ComponentFilter {
    constructor(type) {
        this.type = type;
        this.data = [];
        this.filters = {
            priceRange: { min: 0, max: Infinity },
            performance: { min: 0, max: Infinity }
        };
    }

    async initialize() {
        this.data = await fetchComponentData(this.type);
        this.setupFilters();
        this.render();
    }

    setupFilters() {
        const filterContainer = document.querySelector(`#${this.type}-filters`);
        if (!filterContainer) return;

        // Price Range Filter
        const priceSlider = filterContainer.querySelector('.price-range');
        if (priceSlider) {
            noUiSlider.create(priceSlider, {
                start: [0, 2000],
                connect: true,
                range: {
                    'min': 0,
                    'max': 2000
                }
            });

            priceSlider.noUiSlider.on('update', (values) => {
                this.filters.priceRange.min = parseFloat(values[0]);
                this.filters.priceRange.max = parseFloat(values[1]);
                this.render();
            });
        }

        // Performance Filter
        const performanceDropdown = filterContainer.querySelector('.performance-filter');
        if (performanceDropdown) {
            performanceDropdown.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                this.filters.performance.min = value;
                this.render();
            });
        }
    }

    applyFilters(items) {
        return items.filter(item => {
            const matchesPrice = item.price >= this.filters.priceRange.min && 
                               item.price <= this.filters.priceRange.max;
            const matchesPerformance = item.performance >= this.filters.performance.min;
            return matchesPrice && matchesPerformance;
        });
    }

    render() {
        const container = document.querySelector(`#${this.type}-list`);
        if (!container || !this.data) return;

        const filteredItems = this.applyFilters(this.data[this.type]);
        
        container.innerHTML = filteredItems.map(item => `
            <div class="component-card" data-id="${item.id}">
                <h3>${item.name}</h3>
                <div class="component-details">
                    <p>Performance Score: ${item.performance.toFixed(2)}</p>
                    <p>Price: ${formatCurrency(item.price)}</p>
                    ${this.type === 'cpus' ? 
                        `<p>Cores/Threads: ${item.cores}/${item.threads}</p>
                         <p>Base/Boost: ${item.baseSpeed}/${item.boostSpeed}</p>` 
                        : 
                        `<p>VRAM: ${item.vram}GB</p>
                         <p>Ray Tracing: ${item.rayTracing ? 'Yes' : 'No'}</p>`
                    }
                </div>
                <a href="${generateAmazonLink(item.asin, 'firstbuilds-20')}" 
                   class="buy-button" 
                   target="_blank"
                   onclick="trackEvent('${this.type}', 'click', '${item.name}')">
                    Check Price
                </a>
            </div>
        `).join('');

        // Add hover effects and animations
        const cards = container.querySelectorAll('.component-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 8px 30px rgba(109, 40, 217, 0.2)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 20px rgba(15, 23, 42, 0.1)';
            });
        });
    }
}

// Performance Analysis Class with improvements
class PerformanceAnalyzer extends PCTool {
    constructor() {
        super();
        this.cpu = null;
        this.gpu = null;
        this.game = null;
    }

    async initialize() {
        this.cpuFilter = new ComponentFilter('cpus');
        this.gpuFilter = new ComponentFilter('gpus');
        await Promise.all([
            this.cpuFilter.initialize(),
            this.gpuFilter.initialize()
        ]);
    }

    calculateBottleneck() {
        if (!this.cpu || !this.gpu) return null;
        
        const cpuScore = this.cpu.performance;
        const gpuScore = this.gpu.performance;
        
        const bottleneckPercentage = Math.abs(1 - (cpuScore / gpuScore)) * 100;
        const bottleneckedBy = cpuScore < gpuScore ? 'CPU' : 'GPU';
        
        return {
            percentage: bottleneckPercentage,
            component: bottleneckedBy,
            severity: bottleneckPercentage > 20 ? 'severe' : 
                     bottleneckPercentage > 10 ? 'moderate' : 'minimal'
        };
    }

    estimateGamePerformance() {
        if (!this.cpu || !this.gpu || !this.game) return null;

        const basePerformance = Math.min(this.cpu.performance, this.gpu.performance);
        const estimatedFps = Math.round(basePerformance * this.game.baselineFps);
        
        return {
            fps: estimatedFps,
            quality: estimatedFps > 100 ? 'Ultra' :
                    estimatedFps > 60 ? 'High' :
                    estimatedFps > 30 ? 'Medium' : 'Low',
            rtxEnabled: this.gpu.rayTracing && this.game.rtxSupport
        };
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // ...existing DOMContentLoaded code...
    
    const analyzer = new PerformanceAnalyzer();
    await analyzer.initialize();
});
