// Load farmer navbar
fetch("Partials/farmernavbar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("farmer-navbar-container").innerHTML = data;
    // Load JS after navbar is inserted
    const script = document.createElement("script");
    script.src = "JavaScript/farmernavbar.js";
    document.body.appendChild(script);
  });

// Load farmer footer
fetch("Partials/farmerfooter.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("farmer-footer-container").innerHTML = data;
    // Load JS after footer is inserted
    const script = document.createElement("script");
    script.src = "JavaScript/farmerfooter.js";
    document.body.appendChild(script);
  });

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication status first
  checkAuthStatus();

  // Then load navbar and footer
  loadNavbar();
  loadFooter();
});

function checkAuthStatus() {
  const authToken = localStorage.getItem("farmerAuthToken");
  const currentPage = window.location.pathname.split("/").pop();

  // Pages that don't require authentication
  const publicPages = ["login.html", "register.html", "forgot-password.html"];

  if (!authToken && !publicPages.includes(currentPage)) {
    window.location.href =
      "login.html?redirect=" + encodeURIComponent(window.location.pathname);
  }
}

function loadNavbar() {
  fetch("components/farmer-navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("farmer-navbar-container").innerHTML = data;

      // Only try to load profile if authenticated
      const authToken = localStorage.getItem("farmerAuthToken");
      if (authToken) {
        loadNavbarProfile();
      }

      // Activate current page link
      const currentPage = window.location.pathname.split("/").pop();
      document.querySelectorAll(".nav-link").forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
          link.classList.add("active");
          link.setAttribute("aria-current", "page");
        }
      });
    });
}

function loadNavbarProfile() {
  fetch("/api/farmer/profile", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("farmerAuthToken"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Update profile picture
      const profilePics = document.querySelectorAll(
        ".profile-pic, .profile-pic-sm"
      );
      profilePics.forEach((pic) => {
        pic.src = data.profile_image || "../images/default-profile.jpg";
      });

      // Update profile name
      const profileNames = document.querySelectorAll(
        ".profile-name, #profileNameDropdown"
      );
      profileNames.forEach((name) => {
        name.textContent = `${data.first_name} ${data.last_name}`;
      });

      // Update notification badges if they exist
      if (data.unread_notifications > 0) {
        const badge = document.getElementById("notificationsBadge");
        if (badge) {
          badge.textContent = data.unread_notifications;
          badge.classList.remove("d-none");
        }
      }
    })
    .catch((error) => {
      console.error("Error loading navbar profile:", error);
    });
}