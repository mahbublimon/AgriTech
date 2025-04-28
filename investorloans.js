document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loanApplicationsTable = document.getElementById('loanApplicationsTable');
    const loanDetailsModal = new bootstrap.Modal(document.getElementById('loanDetailsModal'));
    const loanDetailsBody = document.getElementById('loanDetailsBody');
    const approveLoanBtn = document.getElementById('approveLoanBtn');
    const rejectLoanBtn = document.getElementById('rejectLoanBtn');
    const loanStatusFilter = document.getElementById('loanStatusFilter');
    const loanAmountFilter = document.getElementById('loanAmountFilter');
    const loanDistrictFilter = document.getElementById('loanDistrictFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const exportLoansBtn = document.getElementById('exportLoansBtn');
    const refreshLoansBtn = document.getElementById('refreshLoansBtn');
    
    // Current page and items per page
    let currentPage = 1;
    const itemsPerPage = 10;
    let totalLoans = 0;
    let totalPages = 0;
    let loans = [];
    let currentLoanId = null;
    
    // Sample loan data (in a real app, this would come from an API)
    const sampleLoans = [
        {
            id: 'L-1001',
            farmerId: 'F-5001',
            farmerName: 'Abdul Karim',
            amount: 75000,
            purpose: 'Purchase seeds and fertilizers for rice cultivation',
            district: 'rangpur',
            status: 'pending',
            appliedDate: '2023-05-15',
            duration: '12 months',
            interestRate: '8%',
            repaymentPlan: 'Monthly installments',
            farmSize: '2 acres',
            creditScore: 75,
            documents: ['id_proof.pdf', 'land_docs.pdf']
        },
        {
            id: 'L-1002',
            farmerId: 'F-5002',
            farmerName: 'Rahima Begum',
            amount: 120000,
            purpose: 'Buy dairy cows to expand milk production',
            district: 'bogra',
            status: 'pending',
            appliedDate: '2023-05-18',
            duration: '18 months',
            interestRate: '7.5%',
            repaymentPlan: 'Bi-monthly installments',
            farmSize: '3 acres',
            creditScore: 82,
            documents: ['id_proof.pdf', 'cattle_shed_plan.pdf']
        },
        {
            id: 'L-1003',
            farmerId: 'F-5003',
            farmerName: 'Kamal Hossain',
            amount: 250000,
            purpose: 'Install irrigation system for vegetable farm',
            district: 'dhaka',
            status: 'approved',
            appliedDate: '2023-04-10',
            approvedDate: '2023-04-15',
            duration: '24 months',
            interestRate: '9%',
            repaymentPlan: 'Quarterly installments',
            farmSize: '5 acres',
            creditScore: 68,
            documents: ['id_proof.pdf', 'land_docs.pdf', 'irrigation_quote.pdf']
        },
        {
            id: 'L-1004',
            farmerId: 'F-5004',
            farmerName: 'Fatema Akter',
            amount: 50000,
            purpose: 'Purchase poultry feed and supplements',
            district: 'chittagong',
            status: 'disbursed',
            appliedDate: '2023-03-05',
            approvedDate: '2023-03-10',
            disbursedDate: '2023-03-12',
            duration: '6 months',
            interestRate: '10%',
            repaymentPlan: 'Monthly installments',
            farmSize: '1 acre',
            creditScore: 71,
            documents: ['id_proof.pdf', 'poultry_license.pdf']
        },
        {
            id: 'L-1005',
            farmerId: 'F-5005',
            farmerName: 'Mohammad Ali',
            amount: 180000,
            purpose: 'Expand fish farming operations',
            district: 'khulna',
            status: 'completed',
            appliedDate: '2022-11-20',
            approvedDate: '2022-11-25',
            disbursedDate: '2022-11-28',
            completedDate: '2023-05-28',
            duration: '6 months',
            interestRate: '8.5%',
            repaymentPlan: 'Monthly installments',
            farmSize: '4 acres',
            creditScore: 79,
            documents: ['id_proof.pdf', 'pond_lease.pdf']
        }
    ];
    
    // Fetch loans (simulating API call)
    function fetchLoans() {
        // In a real app, this would be an API call
        return new Promise(resolve => {
            setTimeout(() => {
                // Generate more loans for pagination demo
                const allLoans = JSON.parse(JSON.stringify(sampleLoans));
                for (let i = 0; i < 15; i++) {
                    const loan = JSON.parse(JSON.stringify(sampleLoans[i % sampleLoans.length]));
                    loan.id = `L-${1006 + i}`;
                    loan.amount = Math.floor(loan.amount * (0.8 + Math.random() * 0.4));
                    loan.status = ['pending', 'approved', 'rejected', 'disbursed', 'completed'][Math.floor(Math.random() * 5)];
                    allLoans.push(loan);
                }
                resolve(allLoans);
            }, 500);
        });
    }
    
    // Render loan applications
    function renderLoans() {
        loanApplicationsTable.innerHTML = '';
        
        // Apply filters
        let filteredLoans = [...loans];
        const statusFilter = loanStatusFilter.value;
        const amountFilter = loanAmountFilter.value;
        const districtFilter = loanDistrictFilter.value;
        
        if (statusFilter !== 'all') {
            filteredLoans = filteredLoans.filter(loan => loan.status === statusFilter);
        }
        
        if (districtFilter !== 'all') {
            filteredLoans = filteredLoans.filter(loan => loan.district === districtFilter);
        }
        
        if (amountFilter !== 'all') {
            const [min, max] = amountFilter.split('-').map(Number);
            if (amountFilter.endsWith('+')) {
                filteredLoans = filteredLoans.filter(loan => loan.amount >= min);
            } else {
                filteredLoans = filteredLoans.filter(loan => loan.amount >= min && loan.amount <= max);
            }
        }
        
        totalLoans = filteredLoans.length;
        totalPages = Math.ceil(totalLoans / itemsPerPage);
        
        // Get current page loans
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const loansToDisplay = filteredLoans.slice(startIndex, endIndex);
        
        if (loansToDisplay.length === 0) {
            loanApplicationsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h4>No loan applications found</h4>
                        <p>Try adjusting your filters</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Render loans
        loansToDisplay.forEach(loan => {
            const row = document.createElement('tr');
            
            // Status badge
            let statusBadge = '';
            switch (loan.status) {
                case 'pending':
                    statusBadge = '<span class="badge bg-warning">Pending</span>';
                    break;
                case 'approved':
                    statusBadge = '<span class="badge bg-info">Approved</span>';
                    break;
                case 'rejected':
                    statusBadge = '<span class="badge bg-danger">Rejected</span>';
                    break;
                case 'disbursed':
                    statusBadge = '<span class="badge bg-primary">Disbursed</span>';
                    break;
                case 'completed':
                    statusBadge = '<span class="badge bg-success">Completed</span>';
                    break;
            }
            
            row.innerHTML = `
                <td>${loan.id}</td>
                <td>${loan.farmerName}</td>
                <td>৳${loan.amount.toLocaleString()}</td>
                <td>${loan.purpose.substring(0, 30)}...</td>
                <td>${loan.district.charAt(0).toUpperCase() + loan.district.slice(1)}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-success view-loan-btn" data-id="${loan.id}">
                        <i class="fas fa-eye me-1"></i> View
                    </button>
                </td>
            `;
            loanApplicationsTable.appendChild(row);
        });
        
        // Render pagination
        renderPagination();
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-loan-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const loanId = this.getAttribute('data-id');
                showLoanDetails(loanId);
            });
        });
    }
    
    // Show loan details
    function showLoanDetails(loanId) {
        const loan = loans.find(l => l.id === loanId);
        if (!loan) return;
        
        currentLoanId = loanId;
        
        // Format dates
        const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };
        
        // Documents list
        let documentsList = '';
        if (loan.documents && loan.documents.length > 0) {
            documentsList = loan.documents.map(doc => 
                `<li><a href="#" class="text-decoration-none"><i class="fas fa-file-pdf text-danger me-2"></i>${doc}</a></li>`
            ).join('');
        } else {
            documentsList = '<li>No documents uploaded</li>';
        }
        
        loanDetailsBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Loan Information</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <tr>
                                <th>Loan ID:</th>
                                <td>${loan.id}</td>
                            </tr>
                            <tr>
                                <th>Farmer:</th>
                                <td>${loan.farmerName} (ID: ${loan.farmerId})</td>
                            </tr>
                            <tr>
                                <th>Amount:</th>
                                <td>৳${loan.amount.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <th>Purpose:</th>
                                <td>${loan.purpose}</td>
                            </tr>
                            <tr>
                                <th>District:</th>
                                <td>${loan.district.charAt(0).toUpperCase() + loan.district.slice(1)}</td>
                            </tr>
                            <tr>
                                <th>Farm Size:</th>
                                <td>${loan.farmSize}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="col-md-6">
                    <h6>Financial Details</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <tr>
                                <th>Applied Date:</th>
                                <td>${formatDate(loan.appliedDate)}</td>
                            </tr>
                            <tr>
                                <th>Status:</th>
                                <td>${loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</td>
                            </tr>
                            ${loan.approvedDate ? `
                            <tr>
                                <th>Approved Date:</th>
                                <td>${formatDate(loan.approvedDate)}</td>
                            </tr>
                            ` : ''}
                            ${loan.disbursedDate ? `
                            <tr>
                                <th>Disbursed Date:</th>
                                <td>${formatDate(loan.disbursedDate)}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <th>Duration:</th>
                                <td>${loan.duration}</td>
                            </tr>
                            <tr>
                                <th>Interest Rate:</th>
                                <td>${loan.interestRate}</td>
                            </tr>
                            <tr>
                                <th>Repayment Plan:</th>
                                <td>${loan.repaymentPlan}</td>
                            </tr>
                            <tr>
                                <th>Credit Score:</th>
                                <td>${loan.creditScore}/100</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <h6 class="mt-4">Supporting Documents</h6>
            <ul class="list-unstyled">
                ${documentsList}
            </ul>
            
            ${loan.status === 'pending' ? `
            <div class="alert alert-warning mt-3">
                <i class="fas fa-exclamation-circle me-2"></i>
                This loan application is pending review. Please evaluate the farmer's details and documents before making a decision.
            </div>
            ` : ''}
        `;
        
        // Update action buttons based on status
        if (loan.status === 'pending') {
            approveLoanBtn.style.display = 'inline-block';
            rejectLoanBtn.style.display = 'inline-block';
            approveLoanBtn.textContent = 'Approve Loan';
        } else if (loan.status === 'approved') {
            approveLoanBtn.style.display = 'inline-block';
            rejectLoanBtn.style.display = 'none';
            approveLoanBtn.textContent = 'Mark as Disbursed';
        } else if (loan.status === 'disbursed') {
            approveLoanBtn.style.display = 'inline-block';
            rejectLoanBtn.style.display = 'none';
            approveLoanBtn.textContent = 'Mark as Completed';
        } else {
            approveLoanBtn.style.display = 'none';
            rejectLoanBtn.style.display = 'none';
        }
        
        loanDetailsModal.show();
    }
    
    // Approve or update loan status
    approveLoanBtn.addEventListener('click', function() {
        const loan = loans.find(l => l.id === currentLoanId);
        if (!loan) return;
        
        if (loan.status === 'pending') {
            loan.status = 'approved';
            loan.approvedDate = new Date().toISOString();
        } else if (loan.status === 'approved') {
            loan.status = 'disbursed';
            loan.disbursedDate = new Date().toISOString();
        } else if (loan.status === 'disbursed') {
            loan.status = 'completed';
            loan.completedDate = new Date().toISOString();
        }
        
        // In a real app, you would update the loan in the database here
        // For this demo, we'll just update our local array
        localStorage.setItem('loans', JSON.stringify(loans));
        
        // Show success message
        alert(`Loan ${loan.id} status updated to ${loan.status}`);
        
        // Refresh the table
        renderLoans();
        
        // Close modal
        loanDetailsModal.hide();
    });
    
    // Reject loan
    rejectLoanBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reject this loan application?')) {
            const loan = loans.find(l => l.id === currentLoanId);
            if (!loan) return;
            
            loan.status = 'rejected';
            
            // In a real app, you would update the loan in the database here
            // For this demo, we'll just update our local array
            localStorage.setItem('loans', JSON.stringify(loans));
            
            // Show success message
            alert(`Loan ${loan.id} has been rejected`);
            
            // Refresh the table
            renderLoans();
            
            // Close modal
            loanDetailsModal.hide();
        }
    });
    
    // Initialize
    fetchLoans().then(data => {
        loans = data;
        renderLoans();
    });
    
    // Load navbar and footer
    fetch('../Partials/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Set active nav
            const investorLoansLink = document.querySelector('.nav-link[href="investor-loans.html"]');
            if (investorLoansLink) {
                investorLoansLink.classList.add('active');
            }
        });

    fetch('../Partials/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });
});