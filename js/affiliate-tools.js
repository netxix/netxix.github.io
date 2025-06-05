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
}
