// This JSON object represents a sample data source for a project management system.
// It includes various entities such as Documents, Notes, Projects, Properties, and Users.
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
}