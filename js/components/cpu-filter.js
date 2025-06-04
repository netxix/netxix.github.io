// Funciones para manejar el filtrado y visualización de CPUs
document.addEventListener('DOMContentLoaded', function() {
    let cpuData = [];
    const productsGrid = document.querySelector('.products-grid');
    const brandFilter = document.getElementById('brand-filter');
    const coresFilter = document.getElementById('cores-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortFilter = document.getElementById('sort-filter');

    // Cargar datos de CPUs
    fetch('../data/cpus.json')
        .then(response => response.json())
        .then(data => {
            cpuData = data.cpus;
            renderProducts(cpuData);
        })
        .catch(error => console.error('Error cargando datos de CPUs:', error));

    // Event listeners para filtros
    brandFilter?.addEventListener('change', applyFilters);
    coresFilter?.addEventListener('change', applyFilters);
    priceFilter?.addEventListener('change', applyFilters);
    sortFilter?.addEventListener('change', applyFilters);

    function renderProducts(products) {
        productsGrid.innerHTML = '';
        const template = document.getElementById('product-template');

        products.forEach(cpu => {
            const productCard = template.content.cloneNode(true);
            
            // Imagen
            const img = productCard.querySelector('.product-image img');
            img.src = cpu.image;
            img.alt = cpu.name;

            // Información básica
            productCard.querySelector('.product-brand').textContent = cpu.brand;
            productCard.querySelector('.product-title').textContent = cpu.name;
            
            // Especificaciones
            productCard.querySelector('.cores').textContent = `${cpu.cores} núcleos / ${cpu.threads} hilos`;
            productCard.querySelector('.clock').textContent = `${cpu.baseSpeed}GHz - ${cpu.boostSpeed}GHz`;
            productCard.querySelector('.cache').textContent = `${cpu.cache}MB Cache`;

            // Rating
            const stars = '★'.repeat(Math.floor(cpu.rating)) + '☆'.repeat(5 - Math.floor(cpu.rating));
            productCard.querySelector('.rating-stars').textContent = stars;
            productCard.querySelector('.rating-count').textContent = `(${cpu.reviews} reviews)`;

            // Stock
            const stockStatus = productCard.querySelector('.stock-status');
            if (cpu.stock > 10) {
                stockStatus.textContent = 'En Stock';
                stockStatus.classList.add('in-stock');
            } else if (cpu.stock > 0) {
                stockStatus.textContent = '¡Últimas unidades!';
                stockStatus.classList.add('low-stock');
            } else {
                stockStatus.textContent = 'Sin Stock';
                stockStatus.classList.add('out-stock');
            }

            // Precio
            productCard.querySelector('.product-price').textContent = `${cpu.price.toFixed(2)}€`;

            // Enlaces
            const [amazonBtn, compareBtn] = productCard.querySelectorAll('.product-actions a');
            amazonBtn.href = cpu.amazonUrl;
            compareBtn.href = `compare.html?cpu=${cpu.id}`;

            productsGrid.appendChild(productCard);
        });
    }

    function applyFilters() {
        let filteredProducts = [...cpuData];

        // Filtro por marca
        if (brandFilter?.value !== 'all') {
            filteredProducts = filteredProducts.filter(cpu => 
                cpu.brand.toLowerCase() === brandFilter.value
            );
        }

        // Filtro por núcleos
        if (coresFilter?.value !== 'all') {
            const cores = parseInt(coresFilter.value);
            filteredProducts = filteredProducts.filter(cpu => 
                cores === 12 ? cpu.cores >= cores : cpu.cores === cores
            );
        }

        // Filtro por precio
        if (priceFilter?.value !== 'all') {
            switch(priceFilter.value) {
                case 'budget':
                    filteredProducts = filteredProducts.filter(cpu => cpu.price < 200);
                    break;
                case 'midrange':
                    filteredProducts = filteredProducts.filter(cpu => cpu.price >= 200 && cpu.price <= 400);
                    break;
                case 'highend':
                    filteredProducts = filteredProducts.filter(cpu => cpu.price > 400);
                    break;
            }
        }

        // Ordenar
        switch(sortFilter?.value) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'popular':
                filteredProducts.sort((a, b) => b.reviews - a.reviews);
                break;
        }

        renderProducts(filteredProducts);
    }
});
