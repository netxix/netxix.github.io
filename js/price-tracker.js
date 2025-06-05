class PriceTracker {
    constructor() {
        this.priceHistory = new Map();
    }

    async loadPriceHistory(componentId) {
        try {
            const response = await fetch(`../data/price-history/${componentId}.json`);
            const data = await response.json();
            this.priceHistory.set(componentId, data);
            return data;
        } catch (error) {
            console.error('Error loading price history:', error);
            return null;
        }
    }

    async displayPriceChart(componentId, containerId) {
        const data = await this.loadPriceHistory(componentId);
        if (!data) return;

        const ctx = document.getElementById(containerId).getContext('2d');
        const prices = data.history.map(h => h.price);
        const dates = data.history.map(h => new Date(h.date));

        const lowestPrice = Math.min(...prices);
        const highestPrice = Math.max(...prices);
        const currentPrice = prices[prices.length - 1];

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Precio',
                    data: prices,
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y.toFixed(2)}€`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month'
                        }
                    },
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });

        // Actualizar información de precios
        const statsContainer = document.getElementById('price-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="price-stat">
                    <span class="label">Precio actual</span>
                    <span class="value">${currentPrice.toFixed(2)}€</span>
                </div>
                <div class="price-stat">
                    <span class="label">Precio más bajo</span>
                    <span class="value">${lowestPrice.toFixed(2)}€</span>
                </div>
                <div class="price-stat">
                    <span class="label">Precio más alto</span>
                    <span class="value">${highestPrice.toFixed(2)}€</span>
                </div>
                <div class="price-stat">
                    <span class="label">Variación</span>
                    <span class="value ${currentPrice > lowestPrice ? 'text-red-500' : 'text-green-500'}">
                        ${((currentPrice - lowestPrice) / lowestPrice * 100).toFixed(1)}%
                    </span>
                </div>
            `;
        }
    }

    async setPriceAlert(componentId, targetPrice) {
        // Implementar lógica de alertas de precio
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            alert('Debes iniciar sesión para configurar alertas de precio');
            return;
        }

        try {
            await fetch('/api/price-alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    componentId,
                    targetPrice
                })
            });
            alert('Alerta de precio configurada correctamente');
        } catch (error) {
            console.error('Error setting price alert:', error);
            alert('Error al configurar la alerta de precio');
        }
    }
}

// Export para uso en otros módulos
window.PriceTracker = PriceTracker;
