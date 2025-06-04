document.addEventListener('DOMContentLoaded', function() {
    // Detect current location to build appropriate paths
    const currentPath = window.location.pathname;
    const isInPagesFolder = currentPath.includes('/Pages/');
    const basePath = isInPagesFolder ? '../' : '';
    
    // Get current page name for active state
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Navigation items with their corresponding file names and correct paths
    const navItems = [
        { 
            href: `${basePath}pages/dashboard.html`, 
            text: 'Dashboard', 
            file: 'Dashboard.html', 
            folder: 'Pages' 
        },
        { 
            href: `${basePath}pages/parkingPortfolio.html`, 
            text: 'Parking Portfolio', 
            file: 'ParkingPortfolio.html', 
            folder: 'Pages' 
        },
        { 
            href: `${basePath}pages/location.html`, 
            text: 'Location', 
            file: 'location.html', 
            folder: 'Pages' 
        },
        { 
            href: '#transportationportfolio', 
            text: 'Transportation Portfolio', 
            file: null 
        },
        { 
            href: '#garagelots', 
            text: 'Garage & Lots', 
            file: null 
        },
        { 
            href: `${basePath}pages/projectList.html`, 
            text: 'Project List', 
            file: 'ProjectList.html', 
            folder: 'Pages' 
        }
    ];
    
    // Build navigation HTML
    let navHTML = '<nav><ul>';
    
    navItems.forEach(item => {
        let isActive = false;
        
        // Check if current item should be active
        if (item.file) {
            if (item.folder === 'Pages') {
                // For Pages folder items (including Dashboard)
                isActive = isInPagesFolder && currentPage === item.file;
            }
        }
        
        const activeClass = isActive ? ' class="active"' : '';
        navHTML += `<li><a href="${item.href}"${activeClass}>${item.text}</a></li>`;
    });
    
    navHTML += '</ul></nav>';
    
    // Insert the navigation
    document.getElementById('nav-container').innerHTML = navHTML;
    
    // Add click handlers for smooth scrolling on hash links
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});