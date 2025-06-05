class ReviewSystem {
    constructor() {
        this.reviews = new Map();
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Cargar usuario actual si existe
            this.currentUser = await this.getCurrentUser();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing review system:', error);
        }
    }

    async getCurrentUser() {
        // En producción, esto vendría de la API
        // Por ahora simulamos un usuario de prueba
        return {
            id: 'test-user',
            name: 'Usuario de Prueba'
        };
    }

    setupEventListeners() {
        document.addEventListener('click', e => {
            if (e.target.matches('.review-star')) {
                this.handleStarClick(e);
            }
            if (e.target.matches('.submit-review')) {
                this.handleReviewSubmit(e);
            }
        });
    }

    async loadReviews(componentId) {
        try {
            const response = await fetch(`../data/reviews/${componentId}.json`);
            const data = await response.json();
            this.reviews.set(componentId, data);
            this.displayReviews(componentId);
            return data;
        } catch (error) {
            console.error('Error loading reviews:', error);
            return null;
        }
    }

    displayReviews(componentId) {
        const reviews = this.reviews.get(componentId);
        if (!reviews) return;

        const container = document.getElementById('reviews-container');
        if (!container) return;

        // Calcular estadísticas
        const stats = this.calculateReviewStats(reviews);

        // Mostrar resumen de valoraciones
        container.innerHTML = `
            <div class="reviews-summary">
                <div class="rating-average">
                    <span class="big-rating">${stats.average.toFixed(1)}</span>
                    <div class="stars-container">
                        ${this.generateStars(stats.average)}
                    </div>
                    <span class="review-count">${stats.total} valoraciones</span>
                </div>
                <div class="rating-bars">
                    ${this.generateRatingBars(stats.distribution)}
                </div>
            </div>
            <div class="review-actions">
                <button class="write-review-btn" ${this.currentUser ? '' : 'disabled'}>
                    Escribir valoración
                </button>
            </div>
            <div class="reviews-list">
                ${reviews.items.map(review => this.generateReviewCard(review)).join('')}
            </div>
        `;

        // Mostrar formulario si el usuario no ha valorado
        if (this.currentUser && !this.hasUserReviewed(componentId)) {
            this.showReviewForm(componentId);
        }
    }

    calculateReviewStats(reviews) {
        const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        let sum = 0;

        reviews.items.forEach(review => {
            distribution[review.rating]++;
            sum += review.rating;
        });

        return {
            total: reviews.items.length,
            average: sum / reviews.items.length,
            distribution
        };
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }

    generateRatingBars(distribution) {
        const total = Object.values(distribution).reduce((a, b) => a + b, 0);
        let html = '';

        for (let i = 5; i >= 1; i--) {
            const percentage = (distribution[i] / total * 100) || 0;
            html += `
                <div class="rating-bar">
                    <span class="stars">${i} <i class="fas fa-star"></i></span>
                    <div class="bar-container">
                        <div class="bar" style="width: ${percentage}%"></div>
                    </div>
                    <span class="count">${distribution[i]}</span>
                </div>
            `;
        }

        return html;
    }

    generateReviewCard(review) {
        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-stars">
                        ${this.generateStars(review.rating)}
                    </div>
                    <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div class="review-author">${review.author}</div>
                <div class="review-title">${review.title}</div>
                <div class="review-content">${review.content}</div>
                <div class="review-stats">
                    <span class="helpful-count">
                        ${review.helpfulCount} personas encontraron esto útil
                    </span>
                    ${this.currentUser ? `
                        <button class="helpful-btn" data-review-id="${review.id}">
                            ¿Útil?
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    showReviewForm(componentId) {
        const form = document.createElement('div');
        form.className = 'review-form';
        form.innerHTML = `
            <h3>Escribe tu valoración</h3>
            <div class="rating-input">
                ${[1, 2, 3, 4, 5].map(i => `
                    <i class="far fa-star review-star" data-rating="${i}"></i>
                `).join('')}
            </div>
            <input type="text" class="review-title-input" placeholder="Título de tu valoración">
            <textarea class="review-content-input" placeholder="Comparte tu experiencia con este producto"></textarea>
            <button class="submit-review" disabled>Enviar valoración</button>
        `;

        const container = document.getElementById('reviews-container');
        container.insertBefore(form, container.firstChild);
    }

    async submitReview(componentId, review) {
        try {
            // En producción, esto sería una llamada a la API
            const response = await fetch(`/api/reviews/${componentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(review)
            });

            if (!response.ok) throw new Error('Error al enviar la valoración');

            // Actualizar reviews localmente
            const reviews = this.reviews.get(componentId);
            reviews.items.unshift({
                ...review,
                author: this.currentUser.name,
                date: new Date().toISOString(),
                helpfulCount: 0
            });

            this.displayReviews(componentId);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error al enviar la valoración. Por favor, inténtalo de nuevo.');
        }
    }

    handleStarClick(e) {
        const rating = parseInt(e.target.dataset.rating);
        const form = e.target.closest('.review-form');
        
        // Actualizar estrellas
        form.querySelectorAll('.review-star').forEach((star, index) => {
            star.className = `${index < rating ? 'fas' : 'far'} fa-star review-star`;
        });

        // Habilitar botón si hay valoración
        form.querySelector('.submit-review').disabled = false;
    }

    handleReviewSubmit(e) {
        const form = e.target.closest('.review-form');
        const rating = form.querySelectorAll('.fas.fa-star.review-star').length;
        const title = form.querySelector('.review-title-input').value.trim();
        const content = form.querySelector('.review-content-input').value.trim();

        if (!rating || !title || !content) {
            alert('Por favor, completa todos los campos');
            return;
        }

        const componentId = this.getCurrentComponentId();
        this.submitReview(componentId, {
            rating,
            title,
            content
        });
    }

    getCurrentComponentId() {
        // Obtener ID del componente actual de la URL
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    hasUserReviewed(componentId) {
        const reviews = this.reviews.get(componentId);
        return reviews?.items.some(review => review.userId === this.currentUser?.id);
    }
}

// Export para uso en otros módulos
window.ReviewSystem = ReviewSystem;
