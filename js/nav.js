document.addEventListener('DOMContentLoaded', function() {
    // Detect current location to build appropriate paths
    const currentPath = window.location.pathname;
    const isInSubfolder = currentPath.includes('/ParkingPortfolio/');
    const basePath = isInSubfolder ? '../' : '';
    
    // Get current page name for active state
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Navigation items with their corresponding file names
    const navItems = [
        { href: `${basePath}index.html`, text: 'Dashboard', file: 'index.html' },
        { href: `${basePath}ParkingPortfolio/index.html`, text: 'Parking Portfolio', file: 'index.html', folder: 'ParkingPortfolio' },
        { href: `${basePath}ParkingPortfolio/location.html`, text: 'Location', file: 'location.html', folder: 'ParkingPortfolio' },
        { href: '#transportationportfolio', text: 'Transportation Portfolio', file: null },
        { href: '#garagelots', text: 'Garage & Lots', file: null },
        { href: `${basePath}PropertyList/index.html`, text: 'Project List', file: null }
    ];
    
    // Build navigation HTML
    let navHTML = '<nav><ul>';
    
    navItems.forEach(item => {
        let isActive = false;
        
        // Check if current item should be active
        if (item.file) {
            if (item.folder) {
                // For subfolder items
                isActive = isInSubfolder && currentPage === item.file && currentPath.includes(item.folder);
            } else {
                // For root items
                isActive = !isInSubfolder && currentPage === item.file;
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