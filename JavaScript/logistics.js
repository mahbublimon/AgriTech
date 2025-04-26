document.addEventListener('DOMContentLoaded', function() {
    // Load navbar and footer
    fetch('Partials/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            setActiveNav('logistics');
        });

    fetch('Partials/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });

    // Initialize Leaflet map
    initLogisticsMap();
    
    // Load sample shipments
    loadSampleShipments();
});

function setActiveNav(page) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `${page}.html`) {
            link.classList.add('active');
        }
    });
}

function initLogisticsMap() {
    // Initialize map centered on Bangladesh
    const map = L.map('logisticsMap').setView([23.6850, 90.3563], 7);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add sample hubs (in real app these would come from API)
    const hubs = [
        { name: "Dhaka Hub", coords: [23.8103, 90.4125], type: "major" },
        { name: "Rangpur Hub", coords: [25.7439, 89.2752], type: "major" },
        { name: "Chittagong Hub", coords: [22.3569, 91.7832], type: "major" },
        { name: "Bogura Depot", coords: [24.8484, 89.3720], type: "minor" }
    ];

    hubs.forEach(hub => {
        const icon = L.divIcon({
            className: `map-marker ${hub.type}`,
            html: `<i class="fas fa-${hub.type === 'major' ? 'warehouse' : 'map-marker-alt'}"></i>`,
            iconSize: [30, 30]
        });

        L.marker(hub.coords, { icon })
            .addTo(map)
            .bindPopup(`<strong>${hub.name}</strong><br>24/7 Operations`);
    });

    // Add sample route (in real app this would be actual shipment data)
    const route = L.polyline(
        [[25.7439, 89.2752], [24.8484, 89.3720], [23.8103, 90.4125]],
        { color: '#0d6efd', weight: 3, dashArray: '5, 5' }
    ).addTo(map);

    // Add moving truck marker (simulated)
    const truckIcon = L.divIcon({
        className: 'map-marker moving',
        html: '<i class="fas fa-truck"></i>',
        iconSize: [30, 30]
    });

    const truckMarker = L.marker([24.8484, 89.3720], { icon: truckIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<strong>Shipment #SH-789456</strong><br>Rangpur → Dhaka<br>65% complete');

    // Animate truck movement (simulation)
    let index = 0;
    const routePoints = route.getLatLngs();
    const animateTruck = () => {
        if (index < routePoints.length - 1) {
            truckMarker.setLatLng(routePoints[index]);
            index++;
            setTimeout(animateTruck, 1000);
        }
    };
    animateTruck();
}

function loadSampleShipments() {
    const shipments = [
        {
            id: "SH-789456",
            status: "In Transit",
            from: "Rangpur",
            to: "Dhaka",
            progress: 65,
            eta: "2h 15m"
        },
        {
            id: "SH-123789",
            status: "Processing",
            from: "Jessore",
            to: "Chittagong",
            progress: 20,
            eta: "5h 30m"
        }
    ];

    const shipmentList = document.querySelector('.shipment-list');
    shipmentList.innerHTML = '';

    shipments.forEach(shipment => {
        const item = document.createElement('div');
        item.className = 'shipment-item';
        item.innerHTML = `
            <div class="shipment-meta">
                <span class="badge bg-${shipment.status === 'In Transit' ? 'success' : 'warning'}">${shipment.status}</span>
                <small>${shipment.id}</small>
            </div>
            <div class="shipment-route">
                ${shipment.from} → ${shipment.to}
            </div>
            <div class="shipment-progress">
                <div class="progress">
                    <div class="progress-bar" style="width: ${shipment.progress}%"></div>
                </div>
                <small>ETA: ${shipment.eta}</small>
            </div>
            <button class="btn btn-sm btn-outline-primary mt-2">Track</button>
        `;
        shipmentList.appendChild(item);
    });
}