'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import EditPropertyForm from './EditPropertyForm'; // Using the new improved form

interface EditPropertyModalProps {
  property: any | null; // Can be sampleData property or null for new
  isOpen: boolean;
  onClose: () => void;
  onSave: (propertyData: any) => void;
}

export default function EditPropertyModal({ property, isOpen, onClose, onSave }: EditPropertyModalProps) {
  if (!isOpen) {
    return null;
  }
  
  const isNewProperty = !property || !property.id;
  
  const dialogTitle = isNewProperty ? "Add New Property" : `Edit Property: ${property?.details?.name || property?.name || 'Property'}`;
  const dialogDescription = isNewProperty 
    ? "Fill in the details below to create a new property."
    : "Modify the details of the property below.";

  // Transform form data back to sampleData structure
  const handleSave = (formData: any) => {
    const transformedData = {
      // Generate ID for new properties
      id: property?.id || `PRK${Date.now().toString().slice(-4)}`,
      
      // Basic details section
      details: {
        name: formData.name,
        address: formData.address,
        description: formData.description,
        imgURL: formData.imageUrl || 'https://placehold.co/600x400.png'
      },
      
      // Metadata section
      metadata: {
        lastUpdated: new Date().toISOString().split('T')[0],
        dataVersion: "1.0",
        status: "active"
      },
      
      // Property features section
      propertyFeatures: {
        adaParkingAvailable: formData.adaParkingAvailable || false,
        electricChargingAvailable: formData.electricChargingAvailable || false,
        roofCovering: formData.roofCovering || false,
        sevenFtTallClearance: formData.sevenFtTallClearance || false,
        twentyFourSevenParking: formData.twentyFourSevenParking || false
      },
      
      // Parking capacity section
      parkingCapacity: {
        totalParking: {
          generalParking: formData.generalParking || 0,
          adaParking: formData.adaParking || 0,
          evParking: formData.evParking || 0,
          cityStaffParking: formData.cityStaffParking || 0,
          lifeguardParking: formData.lifeguardParking || 0,
          otherParking: formData.otherParking || 0
        }
      },
      
      // Lighting section
      lighting: {
        totalLighting: {
          smallLights: formData.smallLights || 0,
          largeLights: formData.largeLights || 0
        }
      },
      
      // Infrastructure amenities section
      infrastructureAmenities: {
        accessibilityFeatures: formData.adaParkingAvailable ? ["ADA Compliant", "Accessible Pathways"] : [],
        bikeFacilities: formData.bikeFacilities || [],
        carStops: formData.carStops || 0,
        hasElevators: formData.hasElevators || false,
        elevatorCount: formData.elevatorCount || 0,
        securityFeatures: formData.securityFeatures || [],
        stairs: formData.stairs || 0,
        trashCans: true, // Default assumption
        ventilation: false,
        decorativePavers: false,
        artOrPlaceMaking: false,
        crosswalks: false,
        streetFurniture: [],
        retailSpace: false,
        officeSpace: false,
        landscaping: {
          grassGroundCover: false,
          flowerBeds: false,
          bushes: false,
          trees: false,
          irrigation: false
        },
        technology: {
          surfaceMounts: false,
          networking: false,
          cameraTracking: false,
          evInfrastructure: formData.electricChargingAvailable || false
        }
      },
      
      // Operational details section
      operationalDetails: {
        clearanceRequirements: formData.clearanceRequirements || "No restrictions",
        accessPoints: {
          entrances: formData.entrances || 1,
          exits: formData.exits || 1
        },
        paymentSystems: formData.paymentSystems || [],
        surfaceCondition: formData.surfaceCondition || "Good",
        surfaceType: formData.surfaceType || ["Asphalt"],
        totalMeters: formData.totalMeters || 0
      },
      
      // Signage section (using defaults since not in form)
      signage: {
        totalSignage: {
          otherSignage: 0,
          parkingInfoSignage: 0,
          paymentSystemSignage: 0,
          trafficDirectionSignage: 0,
          trafficRegulatorySignage: 0,
          wayfindingSignage: 0
        }
      },
      
      // Location (optional - could be added to form later)
      location: property?.location || {
        latitude: 0,
        longitude: 0
      }
    };
    
    onSave(transformedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4 pr-6 -mr-6">
          <EditPropertyForm 
            property={property}
            onSave={handleSave} 
            onCancel={onClose} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}