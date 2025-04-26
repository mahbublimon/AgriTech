document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const predictionForm = document.getElementById('predictionForm');
    const resultsSection = document.getElementById('resultsSection');
    const cropNameEl = document.getElementById('cropName');
    const regionNameEl = document.getElementById('regionName');
    const predictedPriceEl = document.getElementById('predictedPrice');
    const bestTimeEl = document.getElementById('bestTime');
    const recommendationsList = document.getElementById('recommendationsList');
    
    // Price Chart
    let priceChart;
    
    // Form Submission
    predictionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const cropType = document.getElementById('cropType').value;
        const region = document.getElementById('region').value;
        const harvestDate = document.getElementById('harvestDate').value;
        const quantity = document.getElementById('quantity').value;
        
        // Validate form
        if (!cropType || !region || !harvestDate || !quantity) {
            alert('Please fill in all fields');
            return;
        }
        
        // Simulate prediction (in a real app, this would be an API call)
        simulatePricePrediction(cropType, region, harvestDate, quantity);
    });
    
    // Simulate price prediction
    function simulatePricePrediction(cropType, region, harvestDate, quantity) {
        // Show loading state
        predictionForm.querySelector('button').disabled = true;
        predictionForm.querySelector('button').innerHTML = 
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Predicting...';
        
        // Simulate API delay
        setTimeout(() => {
            // Generate random price data (replace with actual API call)
            const basePrices = {
                rice: 45,
                wheat: 35,
                potato: 20,
                tomato: 30,
                onion: 25,
                lentil: 80
            };
            
            const regionFactors = {
                dhaka: 1.1,
                chittagong: 1.0,
                khulna: 0.95,
                rajshahi: 0.9,
                sylhet: 1.05,
                barisal: 0.98
            };
            
            // Calculate predicted price
            const basePrice = basePrices[cropType] || 30;
            const regionFactor = regionFactors[region] || 1.0;
            const date = new Date(harvestDate);
            const month = date.getMonth();
            
            // Seasonal adjustment (example factors)
            let seasonalFactor = 1.0;
            if (month >= 10 || month <= 2) { // Nov-Feb
                seasonalFactor = 1.2;
            } else if (month >= 3 && month <= 5) { // Mar-May
                seasonalFactor = 0.9;
            }
            
            // Random fluctuation
            const randomFactor = 0.9 + Math.random() * 0.2;
            
            // Final predicted price
            const predictedPrice = (basePrice * regionFactor * seasonalFactor * randomFactor).toFixed(2);
            
            // Best time to sell (1-2 weeks after harvest)
            const bestSellDate = new Date(date);
            bestSellDate.setDate(bestSellDate.getDate() + 7 + Math.floor(Math.random() * 7));
            
            // Update UI with results
            showResults(
                cropType, 
                region, 
                predictedPrice, 
                bestSellDate
            );
            
            // Reset form button
            predictionForm.querySelector('button').disabled = false;
            predictionForm.querySelector('button').innerHTML = 
                '<i class="fas fa-chart-line me-2"></i> Predict Prices';
        }, 1500);
    }
    
    // Show prediction results
    function showResults(cropType, region, price, bestSellDate) {
        // Format crop and region names
        const cropName = cropType.charAt(0).toUpperCase() + cropType.slice(1);
        const regionName = region.charAt(0).toUpperCase() + region.slice(1);
        
        // Format best time to sell
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const bestTime = bestSellDate.toLocaleDateString('en-US', options);
        
        // Update UI
        cropNameEl.textContent = cropName;
        regionNameEl.textContent = regionName + ' Region';
        predictedPriceEl.textContent = '৳' + price;
        bestTimeEl.textContent = bestTime;
        
        // Generate recommendations
        generateRecommendations(cropType, price);
        
        // Show chart
        renderPriceChart(cropType);
        
        // Show results section
        resultsSection.style.display = 'block';
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Generate recommendations
    function generateRecommendations(cropType, price) {
        recommendationsList.innerHTML = '';
        
        const recommendations = [
            `Consider selling ${cropType} in weekly batches to maximize profits`,
            'Check local market prices daily as they may fluctuate',
            'Store produce properly to maintain quality until sale',
            'Connect with local buyers through our marketplace',
            'Consider bulk discounts for orders above 100kg'
        ];
        
        if (price < 30) {
            recommendations.push('Prices are currently low - consider waiting 1-2 weeks if possible');
        } else if (price > 50) {
            recommendations.push('Prices are favorable - consider selling soon');
        }
        
        recommendations.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            recommendationsList.appendChild(li);
        });
    }
    
    // Render price chart
    function renderPriceChart(cropType) {
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        // Destroy previous chart if exists
        if (priceChart) {
            priceChart.destroy();
        }
        
        // Sample data (replace with actual historical data)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Generate random price data based on crop type
        let basePrice;
        switch(cropType) {
            case 'rice': basePrice = 45; break;
            case 'wheat': basePrice = 35; break;
            case 'potato': basePrice = 20; break;
            case 'tomato': basePrice = 30; break;
            case 'onion': basePrice = 25; break;
            case 'lentil': basePrice = 80; break;
            default: basePrice = 30;
        }
        
        const prices = months.map((_, i) => {
            // Seasonal variation
            let seasonalFactor;
            if (i >= 10 || i <= 1) { // Nov-Feb
                seasonalFactor = 1.2;
            } else if (i >= 2 && i <= 4) { // Mar-May
                seasonalFactor = 0.9;
            } else {
                seasonalFactor = 1.0;
            }
            
            // Random fluctuation
            const randomFactor = 0.9 + Math.random() * 0.2;
            
            return (basePrice * seasonalFactor * randomFactor).toFixed(2);
        });
        
        // Create chart
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Price per kg (৳)',
                    data: prices,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '৳' + context.raw;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '৳' + value;
                            }
                        }
                    }
                }
            }
        });
    }
});