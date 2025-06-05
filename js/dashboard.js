// Dashboard functionality for TAM-PPM
document.addEventListener("DOMContentLoaded", function () {
    // Load dashboard data
    loadDashboardData();
  
    // Add dashboard specific styling
    addDashboardStyles();
  });
  
  async function loadDashboardData() {
    try {
      // In a real application, this would come from an API
      // For now, we'll use mock data or try to load from our JSON file
      const projects = await loadProjectData();
  
      if (projects && projects.length > 0) {
        updateProjectStats(projects);
        renderRecentProjects(projects);
        renderUpcomingProjects(projects);
      } else {
        // Use mock data if no projects loaded
        useMockData();
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      useMockData();
    }
  }
  
  async function loadProjectData() {
    try {
      const response = await fetch("../data/projects.json");
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("Could not load project data, using mock data");
    }
    return null;
  }
  
  function updateProjectStats(projects) {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) => p.Status === "Active" || p.Status === "Pending"
    ).length;
  
    document.getElementById("total-projects").textContent = totalProjects;
    document.getElementById("active-projects").textContent = activeProjects;
  }
  
  function renderRecentProjects(projects) {
    const container = document.getElementById("recent-projects");
    const recentProjects = projects.slice(0, 5); // Get first 5 projects
  
    const projectsHTML = recentProjects
      .map(
        (project) => `
          <div class="project-item">
              <div class="project-info">
                  <h4>${project.Title}</h4>
                  <p>${project["Project Category"]} - ${project.Status}</p>
                  <span class="project-id">${project._id}</span>
              </div>
              <div class="project-status">
                  <span class="status-badge status-${project.Status.toLowerCase()}">${
          project.Status
        }</span>
              </div>
          </div>
      `
      )
      .join("");
  
    container.innerHTML = projectsHTML;
  }
  
  function renderUpcomingProjects(projects) {
    const container = document.getElementById("upcoming-projects");
    const upcomingProjects = projects
      .filter((p) => p.Status === "Pending" || p.Status === "Active")
      .slice(0, 3);
  
    const projectsHTML = upcomingProjects
      .map(
        (project) => `
          <div class="upcoming-card">
              <h4>${project.Title}</h4>
              <p>${project["Project Category"]}</p>
              <div class="card-footer">
                  <span class="status-badge status-${project.Status.toLowerCase()}">${
          project.Status
        }</span>
                  <span class="project-scope">${
                    Array.isArray(project["Scope Category"])
                      ? project["Scope Category"].join(", ")
                      : project["Scope Category"]
                  }</span>
              </div>
          </div>
      `
      )
      .join("");
  
    container.innerHTML = projectsHTML;
  }
  
  function useMockData() {
    // Mock project stats
    document.getElementById("total-projects").textContent = "8";
    document.getElementById("active-projects").textContent = "3";
  
    // Mock recent projects
    const recentProjectsHTML = `
          <div class="project-item">
              <div class="project-info">
                  <h4>Parking Lot Renovation</h4>
                  <p>Major Project - Active</p>
                  <span class="project-id">P000001</span>
              </div>
              <div class="project-status">
                  <span class="status-badge status-active">Active</span>
              </div>
          </div>
          <div class="project-item">
              <div class="project-info">
                  <h4>EV Charging Station Install</h4>
                  <p>Minor Project - Pending</p>
                  <span class="project-id">P000002</span>
              </div>
              <div class="project-status">
                  <span class="status-badge status-pending">Pending</span>
              </div>
          </div>
          <div class="project-item">
              <div class="project-info">
                  <h4>Garage Lighting Upgrade</h4>
                  <p>Minor Project - Completed</p>
                  <span class="project-id">P000003</span>
              </div>
              <div class="project-status">
                  <span class="status-badge status-completed">Completed</span>
              </div>
          </div>
      `;
  
    // Mock upcoming projects
    const upcomingProjectsHTML = `
          <div class="upcoming-card">
              <h4>Downtown Garage Repair</h4>
              <p>Major Project</p>
              <div class="card-footer">
                  <span class="status-badge status-pending">Pending</span>
                  <span class="project-scope">Repair, Maintenance</span>
              </div>
          </div>
          <div class="upcoming-card">
              <h4>Lot 5 Resurfacing</h4>
              <p>Minor Project</p>
              <div class="card-footer">
                  <span class="status-badge status-active">Active</span>
                  <span class="project-scope">Installation</span>
              </div>
          </div>
          <div class="upcoming-card">
              <h4>ADA Compliance Update</h4>
              <p>Major Project</p>
              <div class="card-footer">
                  <span class="status-badge status-pending">Pending</span>
                  <span class="project-scope">Upgrade, Compliance</span>
              </div>
          </div>
      `;
  
    document.getElementById("recent-projects").innerHTML = recentProjectsHTML;
    document.getElementById("upcoming-projects").innerHTML = upcomingProjectsHTML;
  }
  
  function addDashboardStyles() {
    // Add dashboard-specific CSS if not already included
    const style = document.createElement("style");
    style.textContent = `
          /* Dashboard Specific Styles */
          .dashboard-overview {
              margin-bottom: var(--space-2xl);
          }
          
          .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: var(--space-lg);
              margin-bottom: var(--space-2xl);
          }
          
          .stat-card {
              background: var(--color-bg-primary);
              border-radius: var(--border-radius-lg);
              padding: var(--space-lg);
              box-shadow: var(--shadow-md);
              text-align: center;
              transition: transform var(--transition-base);
          }
          
          .stat-card:hover {
              transform: translateY(-2px);
              box-shadow: var(--shadow-lg);
          }
          
          .stat-card h3 {
              margin-bottom: var(--space-sm);
              color: var(--color-text-secondary);
              font-size: var(--font-sm);
              text-transform: uppercase;
              letter-spacing: 0.5px;
          }
          
          .stat-number {
              font-size: var(--font-3xl);
              font-weight: 700;
              color: var(--color-primary);
              margin-bottom: var(--space-xs);
          }
          
          .stat-change {
              font-size: var(--font-sm);
              color: var(--color-text-muted);
              margin: 0;
          }
          
          .dashboard-section {
              margin-bottom: var(--space-2xl);
              background: var(--color-bg-primary);
              border-radius: var(--border-radius-lg);
              padding: var(--space-xl);
              box-shadow: var(--shadow-sm);
          }
          
          .dashboard-section h2 {
              margin-bottom: var(--space-base);
              color: var(--color-text-primary);
              border-bottom: 2px solid var(--color-border-primary);
              padding-bottom: var(--space-sm);
          }
          
          .section-description {
              color: var(--color-text-muted);
              margin-bottom: var(--space-lg);
          }
          
          .project-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: var(--space-base);
              border-bottom: 1px solid var(--color-border-primary);
              transition: background-color var(--transition-base);
          }
          
          .project-item:hover {
              background-color: var(--color-bg-secondary);
          }
          
          .project-item:last-child {
              border-bottom: none;
          }
          
          .project-info h4 {
              margin-bottom: var(--space-xs);
              color: var(--color-text-primary);
          }
          
          .project-info p {
              margin: 0;
              color: var(--color-text-secondary);
              font-size: var(--font-sm);
          }
          
          .project-id {
              font-family: var(--font-family-mono);
              font-size: var(--font-xs);
              color: var(--color-text-muted);
              background: var(--color-bg-secondary);
              padding: 2px 6px;
              border-radius: var(--border-radius-sm);
          }
          
          .project-cards {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: var(--space-lg);
          }
          
          .upcoming-card {
              background: var(--color-bg-secondary);
              border-radius: var(--border-radius-base);
              padding: var(--space-base);
              transition: all var(--transition-base);
          }
          
          .upcoming-card:hover {
              transform: translateY(-2px);
              box-shadow: var(--shadow-md);
          }
          
          .upcoming-card h4 {
              margin-bottom: var(--space-xs);
              color: var(--color-text-primary);
          }
          
          .upcoming-card p {
              margin-bottom: var(--space-sm);
              color: var(--color-text-secondary);
              font-size: var(--font-sm);
          }
          
          .card-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: var(--space-base);
          }
          
          .project-scope {
              font-size: var(--font-xs);
              color: var(--color-text-muted);
          }
          
          .quick-actions {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: var(--space-lg);
          }
          
          .action-card {
              background: var(--color-bg-secondary);
              border-radius: var(--border-radius-lg);
              padding: var(--space-lg);
              text-align: center;
              text-decoration: none;
              color: var(--color-text-primary);
              transition: all var(--transition-base);
              border: 2px solid transparent;
          }
          
          .action-card:hover {
              transform: translateY(-4px);
              box-shadow: var(--shadow-lg);
              border-color: var(--color-primary);
              text-decoration: none;
              color: var(--color-text-primary);
          }
          
          .action-icon {
              font-size: var(--font-3xl);
              margin-bottom: var(--space-base);
          }
          
          .action-card h3 {
              margin-bottom: var(--space-sm);
              color: var(--color-text-primary);
          }
          
          .action-card p {
              margin: 0;
              color: var(--color-text-muted);
              font-size: var(--font-sm);
          }
          
          .section-actions {
              margin-top: var(--space-lg);
              text-align: center;
          }
          
          .btn {
              display: inline-block;
              padding: var(--space-sm) var(--space-lg);
              border-radius: var(--border-radius-base);
              text-decoration: none;
              font-weight: 500;
              transition: all var(--transition-base);
          }
          
          .btn-primary {
              background-color: var(--color-primary);
              color: var(--color-white);
              border: 2px solid var(--color-primary);
          }
          
          .btn-primary:hover {
              background-color: var(--color-primary-dark);
              border-color: var(--color-primary-dark);
              text-decoration: none;
              color: var(--color-white);
          }
          
          /* Status badges */
          .status-badge {
              display: inline-block;
              padding: var(--space-xs) var(--space-sm);
              border-radius: var(--border-radius-full);
              font-size: var(--font-xs);
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
          }
          
          .status-active {
              background-color: rgba(16, 185, 129, 0.1);
              color: var(--color-success);
              border: 1px solid var(--color-success);
          }
          
          .status-pending {
              background-color: rgba(245, 158, 11, 0.1);
              color: var(--color-warning);
              border: 1px solid var(--color-warning);
          }
          
          .status-completed {
              background-color: rgba(59, 130, 246, 0.1);
              color: var(--color-info);
              border: 1px solid var(--color-info);
          }
          
          .status-failed {
              background-color: rgba(239, 68, 68, 0.1);
              color: var(--color-error);
              border: 1px solid var(--color-error);
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
              .stats-grid {
                  grid-template-columns: repeat(2, 1fr);
                  gap: var(--space-base);
              }
              
              .dashboard-section {
                  padding: var(--space-base);
              }
              
              .project-item {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: var(--space-sm);
              }
              
              .quick-actions {
                  grid-template-columns: repeat(2, 1fr);
                  gap: var(--space-base);
              }
          }
          
          @media (max-width: 480px) {
              .stats-grid {
                  grid-template-columns: 1fr;
              }
              
              .quick-actions {
                  grid-template-columns: 1fr;
              }
              
              .project-cards {
                  grid-template-columns: 1fr;
              }
          }
      `;
  
    document.head.appendChild(style);
  }
  