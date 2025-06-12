// src/lib/dataService.ts
const sampleDataSource = {
  "Documents": {
    "doc0001": {
      "description": "This is a test document for Project 1.",
      "documentType": "PDF",
      "fileUrl": "www.example.com/test_document.pdf",
      "name": "Test_Document.pdf",
      "project": "P0001",
      "uploadDate": "2025-10-01T00:00:00Z"
    },
    "doc0002": {
      "description": "This is a test document 2 for Project 1.",
      "documentType": "PDF",
      "fileUrl": "www.example.com/test_document2.pdf",
      "name": "Test_Document2.pdf",
      "project": "P0001",
      "uploadDate": "2025-10-01T00:00:00Z"
    }
  },
  "Notes": {
    "N0001": {
      "content": "Test Note for Project 1",
      "createdAt": "2025-10-01T00:00:00Z",
      "project": "P0001"
    }
  },
  "Projects": {
    "P0001": {
      "description": "This project is a test project.",
      "documents": ["doc0001", "doc0002"],
      "endDate": "2025-10-01T00:00:00Z",
      "name": "Project 1",
      "projectCategory": "Minor Project",
      "property": "PRK0001",
      "scopeCategory": "Routine",
      "startDate": "2025-10-01T00:00:00Z",
      "status": "In Progress"
    }
  },
  "Properties": {
    "PRK0001": {
      "details": {
        "name": "City Hall Garage",
        "address": "100 N Andrews Ave, Fort Lauderdale, FL 33301",
        "description": "This four-story parking garage is owned by Maril Hunter and maintained by our organization under a management agreement. City staff are authorized to park on the first and fourth floors only. The second and third floors are designated exclusively for occupants of 1 Broward building.",
        "imgURL": "https://firebasestorage.googleapis.com/v0/b/tam-ppm.firebasestorage.app/o/img%2FCity_Hall_Garage_3.jpg?alt=media&token=de792c1b-063a-4244-868d-44cdadab2c92"
      },
      "metadata": {
        "lastUpdated": "2025-06-12",
        "dataVersion": "1.0",
        "status": "active"
      },
      "location": {
        "latitude": 26.1224,
        "longitude": -80.1373
      },
      "infrastructureAmenities": {
        "accessibilityFeatures": ["ADA Compliant", "Accessible Pathways"],
        "bikeFacilities": ["Bike Rack"],
        "carStops": 4,
        "hasElevators": true,
        "elevatorCount": 2,
        "securityFeatures": ["Cameras", "Well-Lit"],
        "stairs": 1,
        "trashCans": true,
        "ventilation": false,
        "decorativePavers": false,
        "artOrPlaceMaking": false,
        "crosswalks": false,
        "streetFurniture": ["Benches"],
        "retailSpace": false,
        "officeSpace": false,
        "landscaping": {
          "grassGroundCover": false,
          "flowerBeds": false,
          "bushes": true,
          "trees": true,
          "irrigation": false
        },
        "technology": {
          "surfaceMounts": true,
          "networking": true,
          "cameraTracking": false,
          "evInfrastructure": true
        }
      },
      "lighting": {
        "totalLighting": {
          "largeLights": 5,
          "smallLights": 10
        }
      },
      "operationalDetails": {
        "clearanceRequirements": "7ft 6in",
        "accessPoints": {
          "entrances": 4,
          "exits": 3
        },
        "paymentSystems": ["Pay Station", "Mobile App"],
        "surfaceCondition": "Not too bad",
        "surfaceType": ["Asphalt"],
        "totalMeters": 10
      },
      "parkingCapacity": {
        "totalParking": {
          "adaParking": 10,
          "cityStaffParking": 1,
          "evParking": 5,
          "generalParking": 100,
          "lifeguardParking": 0,
          "otherParking": 0
        }
      },
      "propertyFeatures": {
        "adaParkingAvailable": true,
        "electricChargingAvailable": true,
        "roofCovering": true,
        "sevenFtTallClearance": true,
        "twentyFourSevenParking": true
      },
      "signage": {
        "totalSignage": {
          "otherSignage": 1,
          "parkingInfoSignage": 5,
          "paymentSystemSignage": 3,
          "trafficDirectionSignage": 2,
          "trafficRegulatorySignage": 5,
          "wayfindingSignage": 4
        }
      }
    }
  },
  "Users": {
    "THx2lb98mLWCBWAXK8gfA4O19Xw1": {
      "email": "MSanchez@fortlauderdale.gov",
      "role": "editor"
    },
    "VzrTwAs7dhda5DC7BvVOyIEloSA2": {
      "email": "KrThompson@fortlauderdale.gov",
      "role": "viewer"
    },
    "eQBW2kxrVGdVm9YLzrHyUSRA6172": {
      "email": "mbaquero@fortlauderdale.gov",
      "role": "admin"
    }
  }
};

// Transform sampleData structure to component-friendly format
export interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  imageUrl?: string;
  features?: string[];
  aiHint?: string;
  totalParking: number;
  adaParking: number;
  evParking: number;
  generalParking: number;
  cityStaffParking: number;
  lifeguardParking: number;
  otherSpaces: number;
  // Lighting
  smallLights: number;
  largeLights: number;
  totalLighting: number;
  // Signage
  trafficRegulatorySigns: number;
  parkingInfoSigns: number;
  paymentSigns: number;
  wayfindingSigns: number;
  trafficDirectionSigns: number;
  otherSignage: number;
  totalSignage: number;
  // Infrastructure
  securityFeatures: string[];
  treesCount: number;
  trashCansCount: number;
  elevatorsCount: number;
  stairsCount: number;
  carStopsCount: number;
  evChargersCount: number;
  bikeFacilities: string[];
  // Operational
  surfaceCondition: string;
  surfaceType: string;
  clearanceRequirements: string;
  entryPoints: number;
  exitPoints: number;
  paymentSystems: string[];
  totalMeters: number;
}

export interface Project {
  id: string;
  name: string;
  propertyId: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  startDate: string;
  endDate?: string;
  projectCategory: string;
  scopeCategory: string[];
  updates: ProjectUpdate[];
  files: ProjectFile[];
  progressPercentage: number;
  currentSummary?: string;
}

export interface ProjectUpdate {
  id: string;
  timestamp: string;
  text: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'other';
  uploadedAt: string;
  size?: string;
  url?: string;
}

export interface Document {
  id: string;
  name: string;
  fileUrl: string;
  uploadDate: string;
  description?: string;
  documentType?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

// Helper function to derive property features from the data
function derivePropertyFeatures(propertyData: any): string[] {
  const features: string[] = [];
  
  if (propertyData.propertyFeatures?.adaParkingAvailable) {
    features.push('ADA Parking');
  }
  if (propertyData.propertyFeatures?.electricChargingAvailable) {
    features.push('Electric Charging');
  }
  if (propertyData.propertyFeatures?.roofCovering) {
    features.push('Roof Covering');
  }
  if (propertyData.propertyFeatures?.sevenFtTallClearance) {
    features.push('7FT Tall Clearance');
  }
  if (propertyData.propertyFeatures?.twentyFourSevenParking) {
    features.push('24/7 Parking');
  }
  
  return features;
}

class DataService {
  private data = sampleDataSource;

  // Properties
  getProperties(): Property[] {
    return Object.entries(this.data.Properties).map(([id, prop]) => {
      const parkingCapacity = prop.parkingCapacity.totalParking;
      const lighting = prop.lighting.totalLighting;
      const signage = prop.signage.totalSignage;
      
      return {
        id,
        name: prop.details.name,
        address: prop.details.address,
        description: prop.details.description,
        imageUrl: prop.details.imgURL,
        features: derivePropertyFeatures(prop),
        aiHint: 'parking garage',
        
        // Parking capacity
        totalParking: Object.values(parkingCapacity).reduce((a, b) => a + b, 0),
        adaParking: parkingCapacity.adaParking,
        evParking: parkingCapacity.evParking,
        generalParking: parkingCapacity.generalParking,
        cityStaffParking: parkingCapacity.cityStaffParking,
        lifeguardParking: parkingCapacity.lifeguardParking,
        otherSpaces: parkingCapacity.otherParking,
        
        // Lighting
        smallLights: lighting.smallLights,
        largeLights: lighting.largeLights,
        totalLighting: lighting.smallLights + lighting.largeLights,
        
        // Signage
        trafficRegulatorySigns: signage.trafficRegulatorySignage,
        parkingInfoSigns: signage.parkingInfoSignage,
        paymentSigns: signage.paymentSystemSignage,
        wayfindingSigns: signage.wayfindingSignage,
        trafficDirectionSigns: signage.trafficDirectionSignage,
        otherSignage: signage.otherSignage,
        totalSignage: Object.values(signage).reduce((a, b) => a + b, 0),
        
        // Infrastructure
        securityFeatures: prop.infrastructureAmenities.securityFeatures,
        treesCount: prop.infrastructureAmenities.landscaping.trees ? 5 : 0,
        trashCansCount: prop.infrastructureAmenities.trashCans ? 3 : 0,
        elevatorsCount: prop.infrastructureAmenities.elevatorCount,
        stairsCount: prop.infrastructureAmenities.stairs,
        carStopsCount: prop.infrastructureAmenities.carStops,
        evChargersCount: parkingCapacity.evParking, // Assume 1 charger per EV space
        bikeFacilities: prop.infrastructureAmenities.bikeFacilities,
        
        // Operational
        surfaceCondition: prop.operationalDetails.surfaceCondition,
        surfaceType: prop.operationalDetails.surfaceType.join(', '),
        clearanceRequirements: prop.operationalDetails.clearanceRequirements,
        entryPoints: prop.operationalDetails.accessPoints.entrances,
        exitPoints: prop.operationalDetails.accessPoints.exits,
        paymentSystems: prop.operationalDetails.paymentSystems,
        totalMeters: prop.operationalDetails.totalMeters,
      };
    });
  }

  getProperty(id: string): Property | undefined {
    return this.getProperties().find(p => p.id === id);
  }

  // Projects
  getProjects(): Project[] {
    return Object.entries(this.data.Projects).map(([id, proj]) => ({
      id,
      name: proj.name,
      propertyId: proj.property,
      description: proj.description,
      status: proj.status as any,
      startDate: proj.startDate,
      endDate: proj.endDate,
      projectCategory: proj.projectCategory,
      scopeCategory: [proj.scopeCategory], // Convert single string to array
      updates: this.getNotesForProject(id).map(note => ({
        id: note.id,
        timestamp: note.createdAt,
        text: note.content,
      })),
      files: this.getDocumentsForProject(id).map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.documentType === 'PDF' ? 'document' : 'other' as any,
        uploadedAt: doc.uploadDate,
        url: doc.fileUrl,
      })),
      progressPercentage: proj.status === 'Completed' ? 100 : (proj.status === 'In Progress' ? 50 : 0),
      currentSummary: proj.description,
    }));
  }

  getProjectsForProperty(propertyId: string): Project[] {
    return this.getProjects().filter(p => p.propertyId === propertyId);
  }

  // Documents
  getDocumentsForProject(projectId: string): Document[] {
    return Object.entries(this.data.Documents)
      .filter(([_, doc]) => doc.project === projectId)
      .map(([id, doc]) => ({
        id,
        name: doc.name,
        fileUrl: doc.fileUrl,
        uploadDate: doc.uploadDate,
        description: doc.description,
        documentType: doc.documentType,
      }));
  }

  // Notes
  getNotesForProject(projectId: string): Note[] {
    return Object.entries(this.data.Notes)
      .filter(([_, note]) => note.project === projectId)
      .map(([id, note]) => ({
        id,
        content: note.content,
        createdAt: note.createdAt,
      }));
  }

  // Users (for admin check)
  getUsers() {
    return Object.entries(this.data.Users).map(([id, user]) => ({
      id,
      email: user.email,
      role: user.role,
    }));
  }

  isAdmin(email: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    return user?.role === 'admin';
  }
}

export const dataService = new DataService();