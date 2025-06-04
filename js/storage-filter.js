document.addEventListener('DOMContentLoaded', function() {
    let storageData = [];
    const storageGrid = document.querySelector('.storage-grid');
    const typeFilter = document.getElementById('type-filter');
    const capacityFilter = document.getElementById('capacity-filter');
    const priceFilter = document.getElementById('price-filter');

    // Fetch storage data
    fetch('../data/storage.json')
        .then(response => response.json())
        .then(data => {
            storageData = data.storage;
            renderStorage(storageData);
        })
        .catch(error => console.error('Error loading storage data:', error));

    // Filter event listeners
    typeFilter.addEventListener('change', applyFilters);
    capacityFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);

    function renderStorage(storage) {
        storageGrid.innerHTML = '';
        storage.forEach(device => {
            const stars = '★'.repeat(Math.floor(device.rating)) + '☆'.repeat(5 - Math.floor(device.rating));
            const features = device.features.map(feature => 
                `<span class="feature-tag">${feature}</span>`
            ).join('');

            // Calcular la barra de velocidad relativa al máximo teórico
            const maxSpeed = device.type === 'nvme' ? 7500 : (device.type === 'sata-ssd' ? 600 : 200);
            const speedPercentage = (device.specs.readSpeed / maxSpeed) * 100;
            
            const storageCard = `
                <div class="storage-card" data-type="${device.type}" data-capacity="${device.capacity}">
                    <img src="${device.image}" alt="${device.name}">
                    <div class="storage-info">
                        <h3>${device.brand} ${device.name}</h3>
                        <ul class="storage-specs">
                            <li>${device.capacity}GB ${device.type.toUpperCase()}</li>
                            <li>Lectura: ${device.specs.readSpeed}MB/s</li>
                            <li>Escritura: ${device.specs.writeSpeed}MB/s</li>
                            ${device.type !== 'hdd' ? 
                                `<li>TBW: ${device.specs.tbw}TB</li>` : 
                                `<li>RPM: ${device.specs.rpm}</li>`
                            }
                        </ul>
                        <div class="speed-comparison">
                            <div class="speed-label">
                                <span>Velocidad de Lectura</span>
                                <span>${device.specs.readSpeed}MB/s</span>
                            </div>
                            <div class="speed-bar">
                                <div class="speed-fill" style="width: ${speedPercentage}%"></div>
                            </div>
                        </div>
                        <div class="storage-features">
                            ${features}
                        </div>
                        <div class="storage-price">${device.price.toFixed(2)}€</div>
                        <div class="storage-rating">
                            <span class="stars">${stars}</span>
                            <span class="score">${device.rating}/10</span>
                        </div>
                        <a href="${device.amazonUrl}" class="btn" target="_blank">Ver en Amazon</a>
                    </div>
                </div>
            `;
            storageGrid.insertAdjacentHTML('beforeend', storageCard);
        });
    }

    function applyFilters() {
        const selectedType = typeFilter.value;
        const selectedCapacity = capacityFilter.value;
        const selectedPrice = priceFilter.value;

        const filteredStorage = storageData.filter(device => {
            const typeMatch = selectedType === 'all' || device.type === selectedType;
            const capacityMatch = selectedCapacity === 'all' || device.capacity >= parseInt(selectedCapacity);
            const priceMatch = selectedPrice === 'all' || device.priceCategory === selectedPrice;
            return typeMatch && capacityMatch && priceMatch;
        });

        renderStorage(filteredStorage);
    }

    // Ayuda con la selección
    function getStorageRecommendation(usage) {
        switch(usage) {
            case 'os':
                return storageData.filter(device => 
                    device.type === 'nvme' && device.capacity >= 500 && device.capacity <= 1000
                );
            case 'games':
                return storageData.filter(device => 
                    (device.type === 'nvme' || device.type === 'sata-ssd') && device.capacity >= 1000
                );
            case 'storage':
                return storageData.filter(device => 
                    device.type === 'hdd' && device.capacity >= 2000
                );
            default:
                return [];
        }
    }
});