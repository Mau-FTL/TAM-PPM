document.addEventListener("DOMContentLoaded", function () {
    // Detect current location to build appropriate paths
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes("/pages/");
    const basePath = isInPagesFolder ? "./" : "./pages/";
  
    // Get current page name for active state
    const currentPage = currentPath.split("/").pop() || "dashboard.html";
  
    // Navigation items with their corresponding file names and correct paths
    const navItems = [
      {
        href: `${basePath}dashboard.html`,
        text: "Dashboard",
        file: "dashboard.html",
      },
      {
        href: `${basePath}parking-portfolio.html`,
        text: "Parking Portfolio",
        file: "parking-portfolio.html",
      },
      {
        href: `${basePath}location.html`,
        text: "Location Details",
        file: "location.html",
      },
      {
        href: `${basePath}project-list.html`,
        text: "Project List",
        file: "project-list.html",
      },
      {
        href: "#transportation",
        text: "Transportation",
        file: null,
      },
    ];
  
    // Build navigation HTML
    let navHTML = "<nav><ul>";
  
    navItems.forEach((item) => {
      let isActive = false;
  
      // Check if current item should be active
      if (item.file) {
        isActive = currentPage === item.file;
      }
  
      const activeClass = isActive ? ' class="active"' : "";
      navHTML += `<li><a href="${item.href}"${activeClass}>${item.text}</a></li>`;
    });
  
    navHTML += "</ul></nav>";
  
    // Insert the navigation
    const navContainer = document.getElementById("nav-container");
    if (navContainer) {
      navContainer.innerHTML = navHTML;
    }
  
    // Add click handlers for smooth scrolling on hash links
    document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
      link.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  });
  