// TAM-PPM Simple Password Login
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");
    const loginButton = document.getElementById("login-button");
    const passwordInput = document.getElementById("password");
  
    // Handle form submission - just check if password field has content
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const password = passwordInput.value.trim();
  
      // Reset states
      hideMessages();
      setLoadingState(true);
  
      // Simple validation - just check if password field has content
      if (password) {
        showSuccess();
  
        // Store logged in state
        localStorage.setItem("tam_ppm_logged_in", "true");
        localStorage.setItem("tam_ppm_login_time", new Date().toISOString());
  
        // Redirect to dashboard after brief delay
        setTimeout(() => {
          window.location.href = "/pages/dashboard.html";
        }, 800);
      } else {
        showError();
        setLoadingState(false);
      }
    });
  
    // Alternative: Direct button click handler (backup)
    loginButton.addEventListener("click", function (e) {
      e.preventDefault();
  
      const password = passwordInput.value.trim();
  
      if (password) {
        setLoadingState(true);
        showSuccess();
  
        localStorage.setItem("tam_ppm_logged_in", "true");
  
        setTimeout(() => {
          window.location.href = "/pages/dashboard.html";
        }, 800);
      } else {
        showError();
      }
    });
  
    // Show error message
    function showError() {
      loginForm.classList.add("has-error");
      loginForm.classList.remove("has-success");
      errorMessage.style.display = "block";
      successMessage.style.display = "none";
    }
  
    // Show success message
    function showSuccess() {
      loginForm.classList.add("has-success");
      loginForm.classList.remove("has-error");
      successMessage.style.display = "block";
      errorMessage.style.display = "none";
      setLoadingState(false);
    }
  
    // Hide all messages
    function hideMessages() {
      loginForm.classList.remove("has-error", "has-success");
      errorMessage.style.display = "none";
      successMessage.style.display = "none";
    }
  
    // Set loading state
    function setLoadingState(loading) {
      if (loading) {
        loginForm.classList.add("loading");
        loginButton.disabled = true;
        loginButton.textContent = "Accessing...";
      } else {
        loginForm.classList.remove("loading");
        loginButton.disabled = false;
        loginButton.textContent = "Access Dashboard";
      }
    }
  
    // Check if user is already logged in
    function checkExistingLogin() {
      const isLoggedIn = localStorage.getItem("tam_ppm_logged_in");
      if (isLoggedIn === "true") {
        // User is already logged in, redirect to dashboard
        window.location.href = "/pages/dashboard.html";
      }
    }
  
    // Initialize
    checkExistingLogin(); // Check if already logged in
    passwordInput.focus(); // Focus the password field automatically
  
    // Add keyboard shortcuts
    document.addEventListener("keydown", function (e) {
      // Enter key submits form when password input is focused
      if (e.key === "Enter" && document.activeElement === passwordInput) {
        loginForm.dispatchEvent(new Event("submit"));
      }
    });
  
    // Clear error message when user starts typing
    passwordInput.addEventListener("input", function () {
      if (loginForm.classList.contains("has-error")) {
        hideMessages();
      }
    });
  
    passwordInput.addEventListener("focus", function () {
      if (loginForm.classList.contains("has-error")) {
        hideMessages();
      }
    });
  
    // Debug: Add console log to verify script is loaded
    console.log("TAM-PPM Simple Password Login loaded successfully");
  });
  