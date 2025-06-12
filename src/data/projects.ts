
import type { Project, ProjectScopeCategory, ProjectCategory } from '@/types';
import { ProjectCategoryEnum } from '@/types'; // Import the enum

const defaultUpdatedAt = new Date().toISOString();

// Helper function to ensure scope categories are valid
const validateScopeCategories = (categories: string[]): ProjectScopeCategory[] => {
  const validCategories: ProjectScopeCategory[] = [
    'Cleanup', 'Inspection', 'Installation', 'Renovation', 
    'Repair', 'Replacement', 'Routine', 'Survey', 'Upgrade'
  ];
  return categories.filter(cat => validCategories.includes(cat as ProjectScopeCategory)) as ProjectScopeCategory[];
};

// Helper function to validate project category
const validateProjectCategory = (category: string): ProjectCategory => {
  if (ProjectCategoryEnum.safeParse(category).success) {
    return category as ProjectCategory;
  }
  return ProjectCategoryEnum.Values['Minor Project']; // Default if invalid
};


export const projects: Project[] = [
  {
    id: "P000001",
    name: "Project 1",
    status: "In Progress",
    endDate: "2024-12-31", 
    projectCategory: validateProjectCategory("Major Project"),
    scopeCategory: validateScopeCategories(["Installation"]),
    files: [
      {
        id: "file-P000001-1",
        name: "2024_1206_Galt Parking Lot Plans.pdf",
        type: "document", 
        url: "https://example.com/documents/2024_1206_Galt_Parking_Lot_Plans.pdf",
        uploadedAt: "2024-07-01T10:00:00Z", 
      }
    ],
    updates: [
      {
        id: "update-P000001-1",
        text: "Notes are written here. This is a sample project description for the second project. It includes details about the scope and requirements.", 
        timestamp: "2024-07-01T10:00:00Z", 
      }
    ],
    propertyId: 'ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_10d35dfa90864f268c62d1832ea14b72', 
    progressPercentage: 10, 
    startDate: "2024-06-01", 
  },
  {
    id: "P000002",
    name: "Project 2",
    status: "Cancelled", 
    endDate: "2024-07-15T10:00:00Z", 
    projectCategory: validateProjectCategory("Minor Project"),
    scopeCategory: validateScopeCategories(["Repair"]),
    files: [], 
    updates: [
      {
        id: "update-P000002-1",
        text: "Notes are written here. This is a sample project description for the second project. It includes details about the scope and requirements.", 
        timestamp: "2024-07-15T10:00:00Z", 
      }
    ],
    propertyId: 'ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_10d35dfa90864f268c62d1832ea14b72', 
    progressPercentage: 0, 
    startDate: "2024-07-01", 
  }
];

