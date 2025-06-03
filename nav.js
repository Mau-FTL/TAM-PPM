document.addEventListener('DOMContentLoaded', function() {
    // Detect if we're in a subfolder by checking the current path
    const currentPath = window.location.pathname;
    const isInSubfolder = currentPath.includes('/ParkingPortfolio/');
    
    // Adjust paths based on current location
    const basePath = isInSubfolder ? '../' : '';
    
    const navHTML = `
        <nav>
            <ul>
                <li><a href="${basePath}index.html">Dashboard</a></li>
                <li><a href="${basePath}ParkingPortfolio/index.html">Parking Portfolio</a></li>
                <li><a href="${basePath}ParkingPortfolio/location.html">Location</a></li>
                <li><a href="#transportationportfolio">Transportation Portfolio</a></li>
                <li><a href="#garagelots">Garage & Lots</a></li>
                <li><a href="#projectlist">Project List</a></li>
            </ul>
        </nav>
    `;
    
    document.getElementById('nav-container').innerHTML = navHTML;
});