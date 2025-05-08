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
    
    // Bangladesh Crop Data (realistic average prices in BDT/kg)
    const cropData = {
        rice: {
            basePrice: 45,
            seasons: {
                'Boro': [11, 0, 1, 2], // Nov-Feb
                'Aman': [6, 7, 8, 9],   // Jun-Sep
                'Aus': [3, 4, 5]        // Mar-May
            },
            storage: 180, // days
            demandFactor: 1.2
        },
        wheat: {
            basePrice: 35,
            seasons: {
                'Rabi': [11, 0, 1, 2] // Nov-Feb
            },
            storage: 120,
            demandFactor: 1.1
        },
        potato: {
            basePrice: 20,
            seasons: {
                'Winter': [11, 0, 1], // Nov-Jan
                'Spring': [2, 3]       // Feb-Mar
            },
            storage: 90,
            demandFactor: 0.9
        },
        tomato: {
            basePrice: 30,
            seasons: {
                'Winter': [11, 0, 1],  // Nov-Jan
                'Summer': [4, 5, 6]    // Apr-Jun
            },
            storage: 21,
            demandFactor: 1.3
        },
        onion: {
            basePrice: 25,
            seasons: {
                'Rabi': [1, 2, 3] // Jan-Mar
            },
            storage: 60,
            demandFactor: 1.4
        },
        lentil: {
            basePrice: 80,
            seasons: {
                'Rabi': [11, 0, 1] // Nov-Jan
            },
            storage: 365,
            demandFactor: 1.1
        }
    };
    
    // Bangladesh Regional Factors (based on production and transport costs)
    const regionFactors = {
        dhaka: 1.15,    // Higher demand, urban market
        chittagong: 1.05, // Port city, export potential
        khulna: 0.95,    // Agricultural region
        rajshahi: 0.92,  // Agricultural region
        sylhet: 1.08,    // Hilly terrain, transport costs
        barisal: 0.98,   // Riverine region
        rangpur: 0.90    // Northern region
    };
    
    // Historical Events that affect prices (monthly)
    const historicalEvents = {
        0: 1.05,  // January - Post-harvest festival demand
        3: 0.95,  // April - Pre-monsoon surplus
        6: 1.10,  // July - Ramadan demand
        8: 1.07,  // September - Festival season
        10: 0.98, // November - New harvest
        11: 1.02  // December - Winter demand
    };
    
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
        
        // Perform prediction
        predictPrice(cropType, region, harvestDate, quantity);
    });
    
    // Price Prediction Logic
    function predictPrice(cropType, region, harvestDate, quantity) {
        // Show loading state
        predictionForm.querySelector('button').disabled = true;
        predictionForm.querySelector('button').innerHTML = 
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Predicting...';
        
        // Simulate API delay
        setTimeout(() => {
            try {
                const crop = cropData[cropType];
                if (!crop) throw new Error('Invalid crop type');
                
                const date = new Date(harvestDate);
                const month = date.getMonth();
                const currentDate = new Date();
                const daysAfterHarvest = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
                
                // 1. Base Price
                let predictedPrice = crop.basePrice;
                
                // 2. Regional Factor
                const regionFactor = regionFactors[region] || 1.0;
                predictedPrice *= regionFactor;
                
                // 3. Seasonal Adjustment
                let isPeakSeason = false;
                for (const season in crop.seasons) {
                    if (crop.seasons[season].includes(month)) {
                        isPeakSeason = true;
                        break;
                    }
                }
                
                if (isPeakSeason) {
                    predictedPrice *= 0.95; // Slightly lower during harvest
                } else {
                    predictedPrice *= 1.15; // Higher during off-season
                }
                
                // 4. Historical Events Factor
                const eventFactor = historicalEvents[month] || 1.0;
                predictedPrice *= eventFactor;
                
                // 5. Quantity Factor (economies of scale)
                const quantityNum = parseInt(quantity);
                if (quantityNum > 1000) { // For large quantities (kg)
                    predictedPrice *= 0.97; // Small discount
                } else if (quantityNum < 50) {
                    predictedPrice *= 1.05; // Small premium
                }
                
                // 6. Storage Time Factor
                if (daysAfterHarvest > 0) {
                    const storageFactor = Math.max(0.8, 1 - (daysAfterHarvest / (crop.storage * 2)));
                    predictedPrice *= storageFactor;
                }
                
                // 7. Demand Factor (crop-specific)
                predictedPrice *= crop.demandFactor;
                
                // 8. Random market fluctuation (±5%)
                predictedPrice *= (0.975 + Math.random() * 0.05);
                
                // Round to 2 decimal places
                predictedPrice = Math.max(10, predictedPrice).toFixed(2);
                
                // Calculate best time to sell
                const bestSellDate = calculateBestSellDate(date, cropType);
                
                // Update UI with results
                showResults(
                    cropType, 
                    region, 
                    predictedPrice, 
                    bestSellDate,
                    quantityNum
                );
                
            } catch (error) {
                console.error("Prediction error:", error);
                alert("Error in prediction. Please try again.");
            } finally {
                // Reset form button
                predictionForm.querySelector('button').disabled = false;
                predictionForm.querySelector('button').innerHTML = 
                    '<i class="fas fa-chart-line me-2"></i> Predict Prices';
            }
        }, 1500);
    }
    
    // Calculate best time to sell based on crop characteristics
    function calculateBestSellDate(harvestDate, cropType) {
        const date = new Date(harvestDate);
        const crop = cropData[cropType];
        
        // For perishable crops, sell quickly
        if (crop.storage < 30) {
            date.setDate(date.getDate() + 3 + Math.floor(Math.random() * 4)); // 3-7 days
        } 
        // For storable crops, wait for better prices
        else {
            // Wait 2-4 weeks but not beyond storage limit
            const maxWait = Math.min(28, crop.storage * 0.3);
            const minWait = Math.min(14, crop.storage * 0.2);
            date.setDate(date.getDate() + minWait + Math.floor(Math.random() * (maxWait - minWait)));
        }
        
        return date;
    }
    
    // Show prediction results
    function showResults(cropType, region, price, bestSellDate, quantity) {
        // Format names
        const cropName = cropType.charAt(0).toUpperCase() + cropType.slice(1);
        const regionName = region.charAt(0).toUpperCase() + region.slice(1);
        
        // Format dates
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const bestTime = bestSellDate.toLocaleDateString('en-US', options);
        
        // Update UI
        cropNameEl.textContent = cropName;
        regionNameEl.textContent = regionName + ' Region';
        predictedPriceEl.textContent = '৳' + price;
        bestTimeEl.textContent = bestTime;
        
        // Generate recommendations
        generateRecommendations(cropType, price, quantity, bestSellDate);
        
        // Show chart with realistic data
        renderPriceChart(cropType, region);
        
        // Show results section
        resultsSection.style.display = 'block';
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Generate realistic recommendations
    function generateRecommendations(cropType, price, quantity, bestSellDate) {
        recommendationsList.innerHTML = '';
        const crop = cropData[cropType];
        const currentDate = new Date();
        const daysToSell = Math.floor((bestSellDate - currentDate) / (1000 * 60 * 60 * 24));
        
        const recommendations = [
            `Current predicted market price: ৳${price} per kg`,
            `Recommended selling timeframe: ${daysToSell > 0 ? 'in ' + daysToSell + ' days' : 'as soon as possible'}`,
            `Storage advice: ${getStorageAdvice(cropType)}`
        ];
        
        // Quantity-based advice
        if (quantity > 500) {
            recommendations.push("Consider contacting wholesale markets or processors for bulk sale");
        } else if (quantity < 100) {
            recommendations.push("Local markets or community sales may yield better prices for small quantities");
        }
        
        // Price trend advice
        const basePrice = crop.basePrice;
        if (price > basePrice * 1.15) {
            recommendations.push("Prices are currently favorable - consider selling soon");
        } else if (price < basePrice * 0.9) {
            recommendations.push("Prices are low - if possible, wait for better market conditions");
        }
        
        // Crop-specific advice
        if (cropType === 'tomato' || cropType === 'onion') {
            recommendations.push("Monitor daily prices as these crops have high volatility");
        } else if (cropType === 'rice' || cropType === 'wheat') {
            recommendations.push("Consider government procurement programs if available");
        }
        
        // Add all recommendations to list
        recommendations.forEach(text => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = text;
            recommendationsList.appendChild(li);
        });
    }
    
    // Get crop-specific storage advice
    function getStorageAdvice(cropType) {
        const crop = cropData[cropType];
        if (!crop) return "Store in cool, dry place";
        
        if (crop.storage < 30) {
            return "Highly perishable - store in cool place and sell quickly";
        } else if (crop.storage < 90) {
            return "Moderate shelf life - proper storage can extend freshness";
        } else {
            return "Long shelf life - can be stored for several months in proper conditions";
        }
    }
    
    // Render price chart with realistic data
    function renderPriceChart(cropType, region) {
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        // Destroy previous chart if exists
        if (priceChart) {
            priceChart.destroy();
        }
        
        // Bangladesh fiscal year months (July-June)
        const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const crop = cropData[cropType];
        const regionFactor = regionFactors[region] || 1.0;
        
        // Generate realistic price data
        const prices = months.map((_, index) => {
            let price = crop.basePrice * regionFactor;
            
            // Adjust for seasonality
            let isHarvestSeason = false;
            for (const season in crop.seasons) {
                // Convert to fiscal year months (July=0, June=11)
                const adjIndex = (index + 6) % 12;
                if (crop.seasons[season].includes(adjIndex)) {
                    isHarvestSeason = true;
                    break;
                }
            }
            
            if (isHarvestSeason) {
                price *= 0.92; // Slightly lower during harvest
            } else {
                price *= 1.12; // Higher during off-season
            }
            
            // Adjust for historical events
            const adjIndex = (index + 6) % 12; // Convert to calendar months
            price *= historicalEvents[adjIndex] || 1.0;
            
            // Crop-specific demand
            price *= crop.demandFactor;
            
            // Random variation
            price *= (0.96 + Math.random() * 0.08);
            
            return price.toFixed(2);
        });
        
        // Create chart
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: `Price Trend (৳/kg) in ${region.charAt(0).toUpperCase() + region.slice(1)}`,
                    data: prices,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
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
                        min: Math.max(10, crop.basePrice * 0.7),
                        max: crop.basePrice * 1.5,
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