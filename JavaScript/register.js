document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const steps = document.querySelectorAll(".form-step");
    const nextBtns = document.querySelectorAll(".next-btn");
    const prevBtns = document.querySelectorAll(".prev-btn");

    let currentStep = 0;

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle("active", i === index);
        });
    }

    nextBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStep === 0) {
                const selected = document.querySelector("input[name='userType']:checked");
                if (!selected) {
                    showNotification("Please select an account type.", "danger");
                    return;
                }
            }

            if (currentStep === 1 && !validateStep2()) return;

            currentStep++;
            showStep(currentStep);
            if (currentStep === 2) toggleRoleFields();
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            currentStep--;
            showStep(currentStep);
        });
    });

    function toggleRoleFields() {
        const role = document.querySelector("input[name='userType']:checked")?.value;
        document.querySelectorAll(".role-fields").forEach(div => div.style.display = "none");
        if (role === "farmer") document.getElementById("farmerFields").style.display = "block";
        else if (role === "investor") document.getElementById("investorFields").style.display = "block";
        else if (role === "user") document.getElementById("userFields").style.display = "block";
    }

    document.getElementById("togglePassword").addEventListener("click", () => {
        const input = document.getElementById("password");
        input.type = input.type === "password" ? "text" : "password";
    });

    document.getElementById("toggleConfirmPassword").addEventListener("click", () => {
        const input = document.getElementById("confirmPassword");
        input.type = input.type === "password" ? "text" : "password";
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validateFinalStep()) return;

        const formData = new FormData();

        const role = document.querySelector("input[name='userType']:checked").value;
        formData.append("userType", role);
        formData.append("name", document.getElementById("name").value.trim());
        formData.append("email", document.getElementById("email").value.trim());
        formData.append("password", document.getElementById("password").value.trim());

        // Role-specific fields
        if (role === "farmer") {
            formData.append("farmLocation", document.getElementById("farmLocation").value.trim());
            formData.append("farmSize", document.getElementById("farmSize").value);
            formData.append("landDocument", document.getElementById("landDocument").files[0]);
            formData.append("nidFront", document.getElementById("nidFront").files[0]);
            formData.append("nidBack", document.getElementById("nidBack").files[0]);
        } else if (role === "investor") {
            formData.append("companyName", document.getElementById("companyName").value.trim());
            formData.append("investmentRange", document.getElementById("investmentRange").value);
            formData.append("companyDocument", document.getElementById("companyDocument").files[0]);
            formData.append("investorNid", document.getElementById("investorNid").files[0]);
        } else if (role === "user") {
            const interests = Array.from(document.getElementById("interests").selectedOptions)
                                   .map(opt => opt.value);
            formData.append("interests", JSON.stringify(interests));
        }

        try {
            const res = await fetch("register.php", {
                method: "POST",
                body: formData
            });

            const result = await res.json();

            if (result.success) {
                showNotification("Account created successfully!", "success");
                setTimeout(() => window.location.href = "login.html", 2000);
            } else {
                showNotification(result.message || "Registration failed.", "danger");
            }
        } catch (err) {
            console.error("Error:", err);
            showNotification("An error occurred. Try again later.", "danger");
        }
    });

    function validateStep2() {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!name || !email || !password || !confirmPassword) {
            showNotification("Please fill in all fields.", "danger");
            return false;
        }

        if (password.length < 8) {
            showNotification("Password must be at least 8 characters.", "danger");
            return false;
        }

        if (password !== confirmPassword) {
            showNotification("Passwords do not match.", "danger");
            return false;
        }

        return true;
    }

    function validateFinalStep() {
        if (!document.getElementById("terms").checked) {
            showNotification("You must agree to the terms.", "danger");
            return false;
        }

        const role = document.querySelector("input[name='userType']:checked").value;

        if (role === "farmer") {
            if (!document.getElementById("nidFront").files.length ||
                !document.getElementById("nidBack").files.length) {
                showNotification("Please upload both NID sides.", "danger");
                return false;
            }
        }

        if (role === "investor") {
            if (!document.getElementById("investorNid").files.length) {
                showNotification("Please upload your NID.", "danger");
                return false;
            }
        }

        return true;
    }

    function showNotification(message, type = "success") {
        const notification = document.getElementById("notification");
        const alert = document.createElement("div");
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = "alert";
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        notification.innerHTML = "";
        notification.appendChild(alert);

        setTimeout(() => {
            alert.classList.remove("show");
            alert.remove();
        }, 4000);
    }

    showStep(currentStep);
});