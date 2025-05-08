document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentPage = 1;
    const itemsPerPage = 10;
    let loanData = [];
    let filteredLoans = [];
    
    // DOM Elements
    const loanTable = document.getElementById('loanApplicationsTable');
    const pagination = document.getElementById('loanPagination');
    const statusFilter = document.getElementById('loanStatusFilter');
    const amountFilter = document.getElementById('loanAmountFilter');
    const districtFilter = document.getElementById('loanDistrictFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const refreshBtn = document.getElementById('refreshLoansBtn');
    const exportBtn = document.getElementById('exportLoansBtn');
    const loanDetailsModal = new bootstrap.Modal(document.getElementById('loanDetailsModal'));
    
    // Initialize the page
    loadLoanApplications();
    
    // Event Listeners
    applyFiltersBtn.addEventListener('click', applyFilters);
    refreshBtn.addEventListener('click', loadLoanApplications);
    exportBtn.addEventListener('click', exportLoans);
    
    // Load loan applications from database
    function loadLoanApplications() {
        fetch('/api/loans')
            .then(response => response.json())
            .then(data => {
                loanData = data;
                filteredLoans = [...loanData];
                renderLoanTable();
                renderPagination();
            })
            .catch(error => {
                console.error('Error loading loan applications:', error);
                showError('Failed to load loan applications');
            });
    }
    
    // Apply filters to loan data
    function applyFilters() {
        const status = statusFilter.value;
        const amount = amountFilter.value;
        const district = districtFilter.value;
        
        filteredLoans = loanData.filter(loan => {
            // Status filter
            if (status !== 'all' && loan.status !== status) return false;
            
            // Amount filter
            if (amount !== 'all') {
                const loanAmount = parseFloat(loan.amount);
                if (amount === '0-50000' && loanAmount > 50000) return false;
                if (amount === '50000-200000' && (loanAmount <= 50000 || loanAmount > 200000)) return false;
                if (amount === '200000-500000' && (loanAmount <= 200000 || loanAmount > 500000)) return false;
                if (amount === '500000+' && loanAmount <= 500000) return false;
            }
            
            // District filter
            if (district !== 'all' && loan.district !== district) return false;
            
            return true;
        });
        
        currentPage = 1;
        renderLoanTable();
        renderPagination();
    }
    
    // Render loan table with pagination
    function renderLoanTable() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const loansToDisplay = filteredLoans.slice(startIndex, endIndex);
        
        loanTable.innerHTML = '';
        
        if (loansToDisplay.length === 0) {
            loanTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-info-circle text-muted fa-2x mb-3"></i>
                        <p class="mb-0">No loan applications found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        loansToDisplay.forEach(loan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${loan.farmer_image || 'images/default-profile.jpg'}" 
                             class="rounded-circle me-2" width="30" height="30">
                        <span>${loan.farmer_name}</span>
                    </div>
                </td>
                <td>৳${parseFloat(loan.amount).toLocaleString()}</td>
                <td>${loan.purpose}</td>
                <td>${loan.district}</td>
                <td><span class="badge ${getStatusBadgeClass(loan.status)}">${loan.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-details" 
                            data-id="${loan.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            loanTable.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const loanId = this.getAttribute('data-id');
                showLoanDetails(loanId);
            });
        });
    }
    
    // Render pagination controls
    function renderPagination() {
        const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
        
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderLoanTable();
                renderPagination();
            }
        });
        pagination.appendChild(prevLi);
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                renderLoanTable();
                renderPagination();
            });
            pagination.appendChild(li);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderLoanTable();
                renderPagination();
            }
        });
        pagination.appendChild(nextLi);
    }
    
    // Show loan details in modal
    function showLoanDetails(loanId) {
        fetch(`/api/loans/${loanId}`)
            .then(response => response.json())
            .then(loan => {
                const modalBody = document.getElementById('loanDetailsBody');
                
                // Format dates
                const createdDate = new Date(loan.created_at).toLocaleDateString();
                const harvestDate = new Date(loan.harvest_date).toLocaleDateString();
                
                modalBody.innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Loan Information</h6>
                            <div class="mb-3">
                                <p class="mb-1"><strong>Loan ID:</strong> ${loan.id}</p>
                                <p class="mb-1"><strong>Amount:</strong> ৳${parseFloat(loan.amount).toLocaleString()}</p>
                                <p class="mb-1"><strong>Purpose:</strong> ${loan.purpose}</p>
                                <p class="mb-1"><strong>Interest Rate:</strong> ${loan.interest_rate}%</p>
                                <p class="mb-1"><strong>Repayment Period:</strong> ${loan.repayment_period} months</p>
                                <p class="mb-1"><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(loan.status)}">${loan.status}</span></p>
                                <p class="mb-1"><strong>Applied On:</strong> ${createdDate}</p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6>Farmer Information</h6>
                            <div class="d-flex align-items-center mb-3">
                                <img src="${loan.farmer_image || 'images/default-profile.jpg'}" 
                                     class="rounded-circle me-3" width="60" height="60">
                                <div>
                                    <h5 class="mb-1">${loan.farmer_name}</h5>
                                    <p class="mb-1 small text-muted">${loan.farmer_email}</p>
                                    <p class="mb-0 small text-muted">${loan.farmer_phone}</p>
                                </div>
                            </div>
                            <div class="mb-3">
                                <p class="mb-1"><strong>Farm Location:</strong> ${loan.district}</p>
                                <p class="mb-1"><strong>Farm Size:</strong> ${loan.farm_size} acres</p>
                                <p class="mb-1"><strong>Crop Type:</strong> ${loan.crop_type}</p>
                                <p class="mb-1"><strong>Expected Harvest:</strong> ${harvestDate}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <h6>Documents</h6>
                        <div class="row">
                            ${loan.documents.map(doc => `
                                <div class="col-md-4 mb-3">
                                    <div class="card document-card">
                                        <div class="card-body text-center">
                                            <i class="fas ${getDocumentIcon(doc.type)} fa-3x mb-3 text-success"></i>
                                            <p class="mb-1 small">${doc.name}</p>
                                            <a href="${doc.url}" target="_blank" class="btn btn-sm btn-outline-success mt-2">
                                                <i class="fas fa-download me-1"></i> Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                // Update modal buttons based on status
                const approveBtn = document.getElementById('approveLoanBtn');
                const rejectBtn = document.getElementById('rejectLoanBtn');
                
                if (loan.status === 'pending') {
                    approveBtn.style.display = 'inline-block';
                    rejectBtn.style.display = 'inline-block';
                    
                    approveBtn.onclick = function() {
                        updateLoanStatus(loanId, 'approved');
                    };
                    
                    rejectBtn.onclick = function() {
                        updateLoanStatus(loanId, 'rejected');
                    };
                } else {
                    approveBtn.style.display = 'none';
                    rejectBtn.style.display = 'none';
                }
                
                loanDetailsModal.show();
            })
            .catch(error => {
                console.error('Error loading loan details:', error);
                showError('Failed to load loan details');
            });
    }
    
    // Update loan status
    function updateLoanStatus(loanId, status) {
        fetch(`/api/loans/${loanId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('investorAuthToken')}`
            },
            body: JSON.stringify({ status })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update status');
            return response.json();
        })
        .then(() => {
            showSuccess(`Loan ${status} successfully`);
            loanDetailsModal.hide();
            loadLoanApplications();
        })
        .catch(error => {
            console.error('Error updating loan status:', error);
            showError('Failed to update loan status');
        });
    }
    
    // Export loans to CSV
    function exportLoans() {
        const headers = ['ID', 'Farmer', 'Amount', 'Purpose', 'District', 'Status', 'Date'];
        const csvContent = [
            headers.join(','),
            ...filteredLoans.map(loan => [
                loan.id,
                `"${loan.farmer_name}"`,
                loan.amount,
                `"${loan.purpose}"`,
                loan.district,
                loan.status,
                new Date(loan.created_at).toLocaleDateString()
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `loans_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Helper functions
    function getStatusBadgeClass(status) {
        switch(status.toLowerCase()) {
            case 'pending': return 'badge-pending';
            case 'approved': return 'badge-approved';
            case 'rejected': return 'badge-rejected';
            case 'disbursed': return 'badge-disbursed';
            case 'completed': return 'badge-completed';
            default: return 'badge-secondary';
        }
    }
    
    function getDocumentIcon(type) {
        switch(type) {
            case 'nid': return 'fa-id-card';
            case 'land': return 'fa-file-contract';
            case 'crop': return 'fa-image';
            default: return 'fa-file-alt';
        }
    }
    
    function showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
        alert.style.zIndex = '1100';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    function showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
        alert.style.zIndex = '1100';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
});