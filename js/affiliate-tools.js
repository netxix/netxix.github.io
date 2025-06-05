class AffiliateTools {
    static amazonTag = 'firstbuilds-20';
    static priceUpdateInterval = 3600000; // 1 hour

    static async updatePrices() {
        const components = document.querySelectorAll('[data-asin]');
        for (const component of components) {
            await this.fetchCurrentPrice(component);
        }
    }

    static generateAffiliateLink(asin, marketplace = 'ES') {
        return `https://www.amazon.${marketplace}/dp/${asin}/?tag=${this.amazonTag}`;
    }

    static addToCart(products) {
        const baseUrl = 'https://www.amazon.es/gp/aws/cart/add.html?';
        const params = products.map((p, i) => {
            return `ASIN.${i+1}=${p.asin}&Quantity.${i+1}=${p.qty}`;
        }).join('&');
        return `${baseUrl}${params}&AssociateTag=${this.amazonTag}`;
    }

    static injectPriceHistory(element, asin) {
        const chart = new PriceHistoryChart(element);
        this.fetchPriceHistory(asin).then(data => chart.render(data));
    }

    static optimizeAdPlacement() {
        // Implement smart ad placement based on user scroll depth and interaction
        const adContainers = document.querySelectorAll('.ad-container');
        this.setupLazyLoading(adContainers);
        this.setupAdRotation(adContainers);
    }

    // Función para rastrear clics en enlaces de afiliados
    static trackAffiliateClick(category, productName) {
        // Enviar evento a Google Analytics
        gtag('event', 'affiliate_click', {
            'event_category': category,
            'event_label': productName,
            'value': 1
        });

        // Guardar en localStorage para análisis local
        const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '{}');
        const productKey = `${category}_${productName}`;
        
        clicks[productKey] = (clicks[productKey] || 0) + 1;
        localStorage.setItem('affiliate_clicks', JSON.stringify(clicks));
    }

    // Función para obtener las estadísticas de clics
    static getAffiliateStats() {
        const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '{}');
        const stats = {
            totalClicks: 0,
            byCategory: {},
            topProducts: []
        };

        // Procesar datos
        Object.entries(clicks).forEach(([key, count]) => {
            const [category, productName] = key.split('_');
            
            stats.totalClicks += count;
            
            if (!stats.byCategory[category]) {
                stats.byCategory[category] = 0;
            }
            stats.byCategory[category] += count;

            stats.topProducts.push({
                category,
                productName,
                clicks: count
            });
        });

        // Ordenar productos por clics
        stats.topProducts.sort((a, b) => b.clicks - a.clicks);
        stats.topProducts = stats.topProducts.slice(0, 10); // Top 10

        return stats;
    }

    // Función para generar un ID de seguimiento único
    static generateTrackingId() {
        return 'fb_' + Math.random().toString(36).substr(2, 9);
    }

    // Función para añadir parámetros de seguimiento a los enlaces
    static enhanceAffiliateLink(baseUrl, category, productName) {
        const url = new URL(baseUrl);
        const trackingId = this.generateTrackingId();
        
        url.searchParams.append('tracking', trackingId);
        url.searchParams.append('cat', category);
        url.searchParams.append('prod', encodeURIComponent(productName));
        
        return url.toString();
    }

    // Modificar todos los enlaces de afiliados en la página
    static initAffiliateLinks() {
        document.addEventListener('DOMContentLoaded', () => {
            const affiliateLinks = document.querySelectorAll('a[href*="amazon.es"]');
            
            affiliateLinks.forEach(link => {
                const category = link.closest('.product-card')?.dataset.category || 'unknown';
                const productName = link.closest('.product-card')?.querySelector('h3')?.textContent || 'unknown';
                
                // Mejorar el enlace con parámetros de seguimiento
                const enhancedUrl = this.enhanceAffiliateLink(link.href, category, productName);
                link.href = enhancedUrl;
                
                // Añadir seguimiento de clics
                link.addEventListener('click', (e) => {
                    this.trackAffiliateClick(category, productName);
                });
            });
        });
    }
}
