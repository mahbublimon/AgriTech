document.addEventListener('DOMContentLoaded', function() {
    // Loan form submission
    const loanForm = document.getElementById('loanForm');
    if (loanForm) {
        loanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const inputs = this.querySelectorAll('input, select');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (isValid) {
                // Simulate form submission
                alert('Your loan application has been submitted successfully! Our team will contact you within 24 hours.');
                this.reset();
                
                // In a real app, you would send data to your backend here
                // fetch('/api/loans', { method: 'POST', body: JSON.stringify(formData) })
            } else {
                alert('Please fill in all required fields');
            }
        });
    }
    
    // Add input validation
    const loanAmountInput = document.querySelector('input[type="number"]');
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = '';
            }
        });
    }
});