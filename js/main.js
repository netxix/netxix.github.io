// Navegación responsive
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
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
