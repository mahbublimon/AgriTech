document.addEventListener('DOMContentLoaded', function() {
    // Support form submission
    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = supportForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Sending...';
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // In a real app, this would be an AJAX call to your backend
                alert('Your support request has been submitted successfully!');
                
                // Reset form
                supportForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i> Send Message';
                
                // Hide modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
                modal.hide();
            }, 1500);
        });
    }
    
    // Track footer link clicks (for analytics)
    document.querySelectorAll('.investor-footer a').forEach(link => {
        link.addEventListener('click', function() {
            const linkText = this.textContent.trim();
            const linkUrl = this.getAttribute('href');
            console.log(`Footer link clicked: ${linkText} (${linkUrl})`);
            // In a real app, you would send this to your analytics platform
        });
    });
});