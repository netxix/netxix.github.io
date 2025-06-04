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

// Exportar funciones y clases para uso en otras páginas
window.PCTool = PCTool;
window.utils = {
    formatNumber,
    formatCurrency,
    generateAmazonLink,
    fetchComponentData,
    trackEvent
};
