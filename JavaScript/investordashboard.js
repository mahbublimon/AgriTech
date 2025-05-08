document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkInvestorAuth();
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize event listeners
    initEventListeners();
});

function checkInvestorAuth() {
    const authToken = localStorage.getItem('investorAuthToken');
    if (!authToken) {
        window.location.href = 'login.html?redirect=investor-dashboard.html';
    }
}

function loadDashboardData() {
    // Load summary data
    fetch('/api/investor/summary', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('investorAuthToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('activeInvestments').textContent = data.active_investments;
        document.getElementById('totalInvested').textContent = '৳' + data.total_invested.toLocaleString();
        document.getElementById('expectedROI').textContent = '৳' + data.expected_roi.toLocaleString();
        document.getElementById('repaymentRate').textContent = data.repayment_rate + '%';
        document.getElementById('pendingLoansCount').textContent = data.pending_loans + ' pending';
        document.getElementById('preApprovedLoansCount').textContent = data.pre_approved_loans + ' available';
    })
    .catch(error => {
        console.error('Error loading summary data:', error);
    });
    
    // Load active investments
    fetch('/api/investor/active-investments', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('investorAuthToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('activeInvestmentsTable');
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-info-circle text-muted fa-2x mb-3"></i>
                        <p class="mb-0">No active investments found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        data.forEach(investment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${investment.loan_id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${investment.farmer_image || 'images/default-profile.jpg'}" 
                             class="rounded-circle me-2" width="30" height="30">
                        <span>${investment.farmer_name}</span>
                    </div>
                </td>
                <td>৳${investment.amount.toLocaleString()}</td>
                <td>${investment.roi_percentage}%</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(investment.status)}">
                        ${investment.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-details" 
                            data-id="${investment.id}">
                        Details
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error loading active investments:', error);
    });
    
    // Load recent payments
    fetch('/api/investor/recent-payments', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('investorAuthToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('recentPaymentsTable');
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <i class="fas fa-info-circle text-muted fa-2x mb-3"></i>
                        <p class="mb-0">No recent payments found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        data.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
                <td>${payment.loan_id}</td>
                <td>৳${payment.amount.toLocaleString()}</td>
                <td>
                    <span class="badge ${getPaymentStatusBadgeClass(payment.status)}">
                        ${payment.status}
                    </span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error loading recent payments:', error);
    });
}

function initEventListeners() {
    // Investment details click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-details')) {
            const investmentId = e.target.getAttribute('data-id');
            showInvestmentDetails(investmentId);
        }
    });
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        localStorage.removeItem('investorAuthToken');
        window.location.href = 'login.html';
    });
}

function showInvestmentDetails(investmentId) {
    fetch(`/api/investor/investment/${investmentId}`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('investorAuthToken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const modalBody = document.getElementById('investmentModalBody');
        modalBody.innerHTML = `
            <div class="mb-3">
                <h6>Investment Details</h6>
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Loan ID:</strong> ${data.loan_id}</p>
                        <p class="mb-1"><strong>Farmer:</strong> ${data.farmer_name}</p>
                        <p class="mb-1"><strong>Purpose:</strong> ${data.purpose}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Amount:</strong> ৳${data.amount.toLocaleString()}</p>
                        <p class="mb-1"><strong>ROI:</strong> ${data.roi_percentage}%</p>
                        <p class="mb-1"><strong>Maturity Date:</strong> ${new Date(data.maturity_date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <h6>Payment Schedule</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.payment_schedule.map(payment => `
                                <tr>
                                    <td>${new Date(payment.due_date).toLocaleDateString()}</td>
                                    <td>৳${payment.amount.toLocaleString()}</td>
                                    <td>
                                        <span class="badge ${getPaymentStatusBadgeClass(payment.status)}">
                                            ${payment.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="d-flex justify-content-between">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                <a href="investor-payment.html?investment=${data.id}" class="btn btn-success">Make Payment</a>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('investmentModal'));
        modal.show();
    })
    .catch(error => {
        console.error('Error loading investment details:', error);
        alert('Failed to load investment details');
    });
}

function getStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'active': return 'bg-success';
        case 'pending': return 'bg-warning text-dark';
        case 'completed': return 'bg-primary';
        case 'defaulted': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function getPaymentStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'completed': return 'bg-success';
        case 'pending': return 'bg-warning text-dark';
        case 'late': return 'bg-danger';
        default: return 'bg-secondary';
    }
}