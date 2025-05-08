// Global variables for logistics system
let map;
let socket;
let activeShipments = [];
let hubs = [];
let districts = [];
let priceRates = {
    vegetables: { standard: 20, express: 30, sameDay: 50 },
    fruits: { standard: 25, express: 40, sameDay: 60 },
    grains: { standard: 15, express: 25, sameDay: 40 },
    dairy: { standard: 30, express: 50, sameDay: 70 }
};

// Initialize the logistics system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSocketConnection();
    initLogisticsMap();
    loadDistricts();
    setupEventListeners();
    calculatePrice(); // Initial price calculation
});

// Initialize WebSocket connection for real-time updates
function initSocketConnection() {
    // Connect to real-time WebSocket server
    socket = io('https://api.smartagrihub.com/logistics', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    // Socket event handlers
    socket.on('connect', () => {
        console.log('Connected to logistics server');
        fetchActiveShipments();
        fetchHubLocations();
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from logistics server');
        showConnectionStatus(false);
    });

    socket.on('reconnect', () => {
        console.log('Reconnected to logistics server');
        showConnectionStatus(true);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
        showConnectionStatus(false);
    });

    // Real-time data handlers
    socket.on('shipmentUpdate', handleShipmentUpdate);
    socket.on('newShipment', handleNewShipment);
    socket.on('activeShipments', handleActiveShipments);
    socket.on('hubLocations', handleHubLocations);
}

// Initialize Leaflet map
function initLogisticsMap() {
    // Create map centered on Bangladesh
    map = L.map('logisticsMap').setView([23.6850, 90.3563], 7);

    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);

    // Add scale control
    L.control.scale({ imperial: false }).addTo(map);
}

// Fetch initial data from server
function fetchActiveShipments() {
    socket.emit('getActiveShipments');
}

function fetchHubLocations() {
    socket.emit('getHubLocations');
}

// Load districts for dropdowns
function loadDistricts() {
    // In production, this would come from your API
    // Using mock data for demonstration
    setTimeout(() => {
        districts = [
            { id: 'dhaka', name: 'Dhaka' },
            { id: 'chittagong', name: 'Chittagong' },
            { id: 'rangpur', name: 'Rangpur' },
            { id: 'sylhet', name: 'Sylhet' },
            { id: 'khulna', name: 'Khulna' },
            { id: 'barisal', name: 'Barisal' },
            { id: 'rajshahi', name: 'Rajshahi' },
            { id: 'mymensingh', name: 'Mymensingh' }
        ];
        populateDistrictSelects();
    }, 500);
}

// Populate district dropdowns
function populateDistrictSelects() {
    const fromSelect = document.getElementById('fromDistrict');
    const toSelect = document.getElementById('toDistrict');
    const pickupSelect = document.getElementById('pickupLocation');
    const deliverySelect = document.getElementById('deliveryLocation');

    // Clear existing options
    [fromSelect, toSelect, pickupSelect, deliverySelect].forEach(select => {
        select.innerHTML = '<option value="">Loading...</option>';
    });

    // Add district options
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district.id;
        option.textContent = district.name;
        
        fromSelect.appendChild(option.cloneNode(true));
        toSelect.appendChild(option.cloneNode(true));
        pickupSelect.appendChild(option.cloneNode(true));
        deliverySelect.appendChild(option.cloneNode(true));
    });

    // Add warehouse options
    hubs.forEach(hub => {
        const option = document.createElement('option');
        option.value = hub.id;
        option.textContent = `${hub.name} (Warehouse)`;
        pickupSelect.appendChild(option.cloneNode(true));
        deliverySelect.appendChild(option.cloneNode(true));
    });
}

// Socket data handlers
function handleActiveShipments(shipments) {
    activeShipments = shipments;
    updateShipmentList(shipments);
    updateActiveShipmentsCount(shipments.length);
    
    // Clear existing shipment markers and routes
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.options.shipmentId) {
            map.removeLayer(layer);
        }
        if (layer instanceof L.Polyline && layer.options.shipmentId) {
            map.removeLayer(layer);
        }
    });
    
    // Add all active shipments to map
    shipments.forEach(shipment => {
        addShipmentToMap(shipment);
    });
}

function handleHubLocations(locations) {
    hubs = locations;
    updateHubMarkers();
    populateDistrictSelects(); // Refresh selects with hub locations
}

function handleNewShipment(shipment) {
    addNewShipmentToList(shipment);
    addShipmentToMap(shipment);
    updateActiveShipmentsCount(activeShipments.length + 1);
}

function handleShipmentUpdate(update) {
    updateShipmentInList(update);
    updateShipmentOnMap(update);
}

// Map functions
function updateHubMarkers() {
    // Clear existing hub markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.options.isHub) {
            map.removeLayer(layer);
        }
    });

    // Add new hub markers
    hubs.forEach(hub => {
        const icon = L.divIcon({
            className: `map-marker ${hub.type}`,
            html: `<i class="fas fa-${hub.type === 'major' ? 'warehouse' : 'map-marker-alt'}"></i>`,
            iconSize: [40, 40]
        });

        const marker = L.marker([hub.lat, hub.lng], { 
            icon,
            isHub: true,
            hubId: hub.id
        }).addTo(map);
        
        // Popup content
        let popupContent = `<strong>${hub.name}</strong><br>${hub.type === 'major' ? 'Regional Hub' : 'Local Depot'}`;
        if (hub.capacity) {
            popupContent += `<br>Capacity: ${hub.capacity} tons`;
        }
        if (hub.contact) {
            popupContent += `<br>Contact: ${hub.contact}`;
        }
        
        marker.bindPopup(popupContent);
    });
}

function addShipmentToMap(shipment) {
    // Create a polyline for the route
    const route = L.polyline(shipment.route, {
        color: '#0d6efd',
        weight: 3,
        dashArray: '5, 5',
        shipmentId: shipment.id
    }).addTo(map);

    // Create a moving truck marker
    const truckIcon = L.divIcon({
        className: 'map-marker moving',
        html: '<i class="fas fa-truck"></i>',
        iconSize: [40, 40]
    });

    const truckMarker = L.marker(shipment.currentLocation, { 
        icon: truckIcon,
        zIndexOffset: 1000,
        shipmentId: shipment.id
    }).addTo(map);
    
    // Popup content
    let popupContent = `<strong>${shipment.id}</strong><br>`;
    popupContent += `${shipment.origin} → ${shipment.destination}<br>`;
    popupContent += `Status: <span class="badge bg-${getStatusClass(shipment.status)}">${shipment.status}</span><br>`;
    popupContent += `Progress: ${shipment.progress}%<br>`;
    popupContent += `ETA: ${formatETA(shipment.eta)}`;
    
    truckMarker.bindPopup(popupContent);

    // Store references for later updates
    shipment.mapElements = {
        route,
        truckMarker
    };
}

function updateShipmentOnMap(update) {
    // Find the shipment in our activeShipments array
    const shipment = activeShipments.find(s => s.id === update.id);
    if (!shipment) return;

    // Update the truck marker position
    if (shipment.mapElements?.truckMarker) {
        shipment.mapElements.truckMarker.setLatLng(update.currentLocation);
        
        // Update popup content
        let popupContent = `<strong>${shipment.id}</strong><br>`;
        popupContent += `${shipment.origin} → ${shipment.destination}<br>`;
        popupContent += `Status: <span class="badge bg-${getStatusClass(update.status)}">${update.status}</span><br>`;
        popupContent += `Progress: ${update.progress}%<br>`;
        popupContent += `ETA: ${formatETA(update.eta)}`;
        
        shipment.mapElements.truckMarker.setPopupContent(popupContent);
    }

    // Update the route if changed
    if (update.route && shipment.mapElements?.route) {
        shipment.mapElements.route.setLatLngs(update.route);
    }
}

// UI update functions
function updateShipmentList(shipments) {
    const shipmentList = document.getElementById('shipmentList');
    
    if (shipments.length === 0) {
        shipmentList.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-truck fa-3x text-muted mb-3"></i>
                <p>No active shipments currently</p>
            </div>
        `;
        return;
    }

    shipmentList.innerHTML = '';
    
    shipments.forEach(shipment => {
        const item = document.createElement('div');
        item.className = 'shipment-item';
        item.innerHTML = `
            <div class="shipment-meta">
                <span class="badge bg-${getStatusClass(shipment.status)}">${shipment.status}</span>
                <small>${shipment.id}</small>
            </div>
            <div class="shipment-route">
                <i class="fas fa-map-marker-alt text-danger"></i> ${shipment.origin}
                <i class="fas fa-arrow-right mx-2 text-muted"></i>
                <i class="fas fa-map-marker-alt text-success"></i> ${shipment.destination}
            </div>
            <div class="shipment-progress">
                <div class="progress">
                    <div class="progress-bar" style="width: ${shipment.progress}%"></div>
                </div>
                <div class="d-flex justify-content-between mt-1">
                    <small>${shipment.progress}% complete</small>
                    <small>ETA: ${formatETA(shipment.eta)}</small>
                </div>
            </div>
            <div class="d-flex justify-content-between mt-2">
                <small class="text-muted">Last update: ${formatTime(shipment.lastUpdate)}</small>
                <button class="btn btn-sm btn-outline-primary track-btn" data-id="${shipment.id}">
                    <i class="fas fa-map-marked-alt me-1"></i> Track
                </button>
            </div>
        `;
        shipmentList.appendChild(item);
    });

    // Add event listeners to track buttons
    document.querySelectorAll('.track-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const shipmentId = this.getAttribute('data-id');
            trackSpecificShipment(shipmentId);
        });
    });
}

function updateActiveShipmentsCount(count) {
    document.getElementById('activeShipmentsCount').textContent = count;
}

function addNewShipmentToList(shipment) {
    const shipmentList = document.getElementById('shipmentList');
    
    // Remove "no shipments" message if present
    if (shipmentList.querySelector('.text-center')) {
        shipmentList.innerHTML = '';
    }
    
    const item = document.createElement('div');
    item.className = 'shipment-item';
    item.innerHTML = `
        <div class="shipment-meta">
            <span class="badge bg-${getStatusClass(shipment.status)}">${shipment.status}</span>
            <small>${shipment.id}</small>
        </div>
        <div class="shipment-route">
            <i class="fas fa-map-marker-alt text-danger"></i> ${shipment.origin}
            <i class="fas fa-arrow-right mx-2 text-muted"></i>
            <i class="fas fa-map-marker-alt text-success"></i> ${shipment.destination}
        </div>
        <div class="shipment-progress">
            <div class="progress">
                <div class="progress-bar" style="width: ${shipment.progress}%"></div>
            </div>
            <div class="d-flex justify-content-between mt-1">
                <small>${shipment.progress}% complete</small>
                <small>ETA: ${formatETA(shipment.eta)}</small>
            </div>
        </div>
        <div class="d-flex justify-content-between mt-2">
            <small class="text-muted">Last update: ${formatTime(shipment.lastUpdate)}</small>
            <button class="btn btn-sm btn-outline-primary track-btn" data-id="${shipment.id}">
                <i class="fas fa-map-marked-alt me-1"></i> Track
            </button>
        </div>
    `;
    shipmentList.prepend(item);

    // Update count
    const currentCount = parseInt(document.getElementById('activeShipmentsCount').textContent);
    document.getElementById('activeShipmentsCount').textContent = currentCount + 1;

    // Add event listener to the new track button
    item.querySelector('.track-btn').addEventListener('click', function() {
        const shipmentId = this.getAttribute('data-id');
        trackSpecificShipment(shipmentId);
    });
}

function updateShipmentInList(update) {
    const shipmentItems = document.querySelectorAll('.shipment-item');
    
    shipmentItems.forEach(item => {
        const shipmentId = item.querySelector('.track-btn')?.getAttribute('data-id');
        if (shipmentId === update.id) {
            // Update the status badge
            const statusBadge = item.querySelector('.badge');
            statusBadge.className = `badge bg-${getStatusClass(update.status)}`;
            statusBadge.textContent = update.status;

            // Update progress bar
            const progressBar = item.querySelector('.progress-bar');
            progressBar.style.width = `${update.progress}%`;
            
            // Update progress text
            const progressText = item.querySelector('.shipment-progress small:first-child');
            if (progressText) progressText.textContent = `${update.progress}% complete`;
            
            // Update ETA
            const etaElement = item.querySelector('.shipment-progress small:last-child');
            if (etaElement) etaElement.textContent = `ETA: ${formatETA(update.eta)}`;
            
            // Update last update time
            const lastUpdateElement = item.querySelector('.text-muted');
            if (lastUpdateElement) lastUpdateElement.textContent = `Last update: ${formatTime(update.lastUpdate)}`;
        }
    });
}

// Shipment tracking functions
function trackSpecificShipment(shipmentId) {
    // Find the shipment
    const shipment = activeShipments.find(s => s.id === shipmentId);
    if (!shipment) {
        alert('Shipment not found');
        return;
    }

    // Center map on this shipment
    map.setView(shipment.currentLocation, 9);

    // Open popup for this shipment's marker
    if (shipment.mapElements?.truckMarker) {
        shipment.mapElements.truckMarker.openPopup();
    }

    // Update tracking modal content
    const trackingResult = document.getElementById('trackingResult');
    trackingResult.innerHTML = `
        <div class="text-start">
            <h4 class="mb-3">${shipment.id}</h4>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Route Details</h5>
                            <p><strong>Origin:</strong> ${shipment.origin}</p>
                            <p><strong>Destination:</strong> ${shipment.destination}</p>
                            <p><strong>Distance:</strong> ${shipment.distance || '--'} km</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Shipment Status</h5>
                            <p><strong>Status:</strong> <span class="badge bg-${getStatusClass(shipment.status)}">${shipment.status}</span></p>
                            <p><strong>Progress:</strong></p>
                            <div class="progress mb-2">
                                <div class="progress-bar" style="width: ${shipment.progress}%"></div>
                            </div>
                            <p><strong>ETA:</strong> ${formatETA(shipment.eta)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">Shipment Details</h5>
                    <div class="row">
                        <div class="col-md-4">
                            <p><strong>Product:</strong> ${shipment.productType || '--'}</p>
                        </div>
                        <div class="col-md-4">
                            <p><strong>Weight:</strong> ${shipment.weight || '--'} kg</p>
                        </div>
                        <div class="col-md-4">
                            <p><strong>Value:</strong> ${shipment.value ? '৳' + shipment.value.toLocaleString() : '--'}</p>
                        </div>
                    </div>
                    ${shipment.specialInstructions ? `<p><strong>Special Instructions:</strong> ${shipment.specialInstructions}</p>` : ''}
                </div>
            </div>
            
            <div class="text-center mt-3">
                <img src="Images/truck-moving.gif" width="200" class="img-fluid">
            </div>
        </div>
    `;

    // Show modal
    const trackModal = new bootstrap.Modal(document.getElementById('trackShipmentModal'));
    trackModal.show();
}

// Pricing calculator functions
function calculatePrice() {
    const fromDistrict = document.getElementById('fromDistrict').value;
    const toDistrict = document.getElementById('toDistrict').value;
    const productType = document.getElementById('productType').value;
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const urgency = document.getElementById('urgency').value;

    if (!fromDistrict || !toDistrict || weight <= 0) {
        document.getElementById('estimatedCost').textContent = '৳---';
        return;
    }

    // Calculate base price
    const baseRate = priceRates[productType][urgency];
    
    // Calculate distance factor (simplified - in real app use actual distances)
    let distanceFactor;
    if (fromDistrict === toDistrict) {
        distanceFactor = 1; // Local delivery
    } else {
        // Simple approximation based on urgency
        distanceFactor = urgency === 'same-day' ? 1.8 : 
                        urgency === 'express' ? 1.4 : 1.2;
    }
    
    // Calculate total
    let total = baseRate * weight * distanceFactor;
    
    // Apply minimum charge
    total = Math.max(total, 500); // Minimum ৳500
    
    // Display result
    document.getElementById('estimatedCost').textContent = `৳${Math.round(total).toLocaleString()}`;
}

// Setup event listeners
function setupEventListeners() {
    // Price calculator inputs
    document.getElementById('fromDistrict').addEventListener('change', calculatePrice);
    document.getElementById('toDistrict').addEventListener('change', calculatePrice);
    document.getElementById('productType').addEventListener('change', calculatePrice);
    document.getElementById('weight').addEventListener('input', calculatePrice);
    document.getElementById('urgency').addEventListener('change', calculatePrice);

    // Book shipment button
    document.getElementById('bookShipmentBtn').addEventListener('click', function() {
        const fromDistrict = document.getElementById('fromDistrict').value;
        const toDistrict = document.getElementById('toDistrict').value;
        
        if (!fromDistrict || !toDistrict) {
            alert('Please select origin and destination districts');
            return;
        }

        const weight = parseFloat(document.getElementById('weight').value);
        if (!weight || weight <= 0) {
            alert('Please enter a valid weight');
            return;
        }

        // Pre-fill booking form
        document.getElementById('pickupLocation').value = fromDistrict;
        document.getElementById('deliveryLocation').value = toDistrict;
        document.getElementById('deliveryProductType').value = document.getElementById('productType').value;
        document.getElementById('deliveryWeight').value = weight;
        document.getElementById('urgency').value = document.getElementById('urgency').value;

        // Show booking modal
        const bookModal = new bootstrap.Modal(document.getElementById('bookDeliveryModal'));
        bookModal.show();
    });

    // Track shipment button in modal
    document.getElementById('trackShipmentBtn').addEventListener('click', function() {
        const trackingNumber = document.getElementById('trackingNumberInput').value.trim();
        if (!trackingNumber) {
            alert('Please enter a shipment ID');
            return;
        }

        trackSpecificShipment(trackingNumber);
    });

    // Delivery form submission
    document.getElementById('deliveryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            pickupLocation: document.getElementById('pickupLocation').value,
            deliveryLocation: document.getElementById('deliveryLocation').value,
            productType: document.getElementById('deliveryProductType').value,
            weight: parseFloat(document.getElementById('deliveryWeight').value),
            specialInstructions: document.getElementById('specialInstructions').value,
            urgent: document.getElementById('urgentDelivery').checked,
            estimatedCost: document.getElementById('estimatedCost').textContent
        };

        // In a real app, send this to your API
        console.log('Booking delivery:', formData);
        
        // Generate mock response
        const trackingNumber = 'SH-' + Math.floor(100000 + Math.random() * 900000);
        const response = {
            success: true,
            trackingNumber: trackingNumber,
            message: 'Delivery booked successfully!',
            estimatedPickup: new Date(Date.now() + (formData.urgent ? 3600000 : 86400000)).toLocaleString()
        };
        
        // Show success message
        alert(`${response.message}\n\nTracking Number: ${response.trackingNumber}\nEstimated Pickup: ${response.estimatedPickup}\n\nYou can track your shipment using the tracking page.`);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('bookDeliveryModal'));
        modal.hide();
        
        // Reset form
        this.reset();
    });
}

// Helper functions
function getStatusClass(status) {
    if (!status) return 'secondary';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('process')) return 'processing';
    if (statusLower.includes('transit')) return 'intransit';
    if (statusLower.includes('deliver')) return 'delivered';
    if (statusLower.includes('delay')) return 'delayed';
    if (statusLower.includes('cancel')) return 'cancelled';
    return 'primary';
}

function formatETA(eta) {
    if (!eta) return 'Calculating...';
    
    // If eta is a timestamp
    if (typeof eta === 'number' || eta instanceof Date) {
        const now = new Date();
        const etaDate = new Date(eta);
        const diffHours = Math.round((etaDate - now) / (1000 * 60 * 60));
        
        if (diffHours <= 0) return 'Arriving soon';
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
        return etaDate.toLocaleDateString();
    }
    
    // If eta is a string like "2 hours"
    return eta;
}

function formatTime(timestamp) {
    if (!timestamp) return '--';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' ' + date.toLocaleDateString();
}

function showConnectionStatus(connected) {
    const statusElement = document.createElement('div');
    statusElement.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
    statusElement.innerHTML = `<i class="fas fa-${connected ? 'check-circle' : 'exclamation-circle'} me-1"></i> 
                              ${connected ? 'Connected' : 'Disconnected'}`;
    
    // Remove existing status if any
    const existingStatus = document.querySelector('.connection-status');
    if (existingStatus) existingStatus.remove();
    
    // Add to page (you might want to position this differently)
    document.body.appendChild(statusElement);
    
    // Auto-hide after 3 seconds if connected
    if (connected) {
        setTimeout(() => {
            statusElement.classList.add('fade-out');
            setTimeout(() => statusElement.remove(), 500);
        }, 3000);
    }
}

// Add some basic styles for connection status
const style = document.createElement('style');
style.textContent = `
    .connection-status {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 15px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: opacity 0.5s;
    }
    .connection-status.connected {
        background-color: #28a745;
    }
    .connection-status.disconnected {
        background-color: #dc3545;
    }
    .connection-status.fade-out {
        opacity: 0;
    }
`;
document.head.appendChild(style);