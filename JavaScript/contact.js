// Form Submission Handling
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Simple validation
    if (!name || !email || !subject || !message) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Simulate form submission (replace with actual AJAX/fetch)
    console.log('Form submitted:', { name, email, phone, subject, message });
    
    // Show success message
    alert('Thank you! Your message has been sent. We will contact you soon.');
    
    // Reset form
    this.reset();
});

// Optional: Add animation to form inputs
const inputs = document.querySelectorAll('.form-control');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });
});