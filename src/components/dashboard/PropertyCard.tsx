'use client';

import { useState } from 'react';
import Image from 'next/image'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProjectInfo from './ProjectInfo';
import { PlusCircle, Eye, Ruler, Award, Clock, Accessibility, Zap, Umbrella } from 'lucide-react'; 

// Import the data service types
import { dataService, type Property, type Project } from '@/lib/dataService';

interface PropertyCardProps {
  property: Property;
  initialProjects: Project[];
  onProjectDataChange: (propertyId: string, updatedProjects: Project[]) => void;
}

// Map property features from sampleData structure
const getFeatureIcon = (feature: string) => {
  const iconProps = { className: "h-3 w-3 mr-1" }; 
  switch (feature) {
    case 'ADA Parking':
    case 'ADA Compliant': 
      return <Accessibility {...iconProps} />;
    case '24/7 Parking':
    case 'twentyFourSevenParking':
      return <Clock {...iconProps} />;
    case '7FT Tall Clearance':
    case 'sevenFtTallClearance': 
      return <Ruler {...iconProps} />; 
    case 'Electric Charging':
    case 'electricChargingAvailable':
      return <Zap {...iconProps} />;
    case 'Roof Covering':
    case 'roofCovering':
      return <Umbrella {...iconProps} />;
    default: 
      return <Award {...iconProps} />;
  }
};

const featureBadgeVariants: Record<string, BadgeProps['variant']> = {
  'ADA Parking': 'pastel-blue',
  'ADA Compliant': 'pastel-blue',
  '24/7 Parking': 'pastel-green',
  'twentyFourSevenParking': 'pastel-green',
  '7FT Tall Clearance': 'pastel-pink',
  'sevenFtTallClearance': 'pastel-pink',
  'Electric Charging': 'pastel-yellow',
  'electricChargingAvailable': 'pastel-yellow',
  'Roof Covering': 'pastel-purple',
  'roofCovering': 'pastel-purple',
};

// Helper function to derive features from property data
const derivePropertyFeatures = (property: Property): string[] => {
  const features: string[] = [];
  
  // Check if it's sampleData format (has infrastructureAmenities, propertyFeatures, etc.)
  if ('infrastructureAmenities' in property) {
    // Handle sampleData structure
    const infraFeatures = (property as any).infrastructureAmenities?.accessibilityFeatures || [];
    if (infraFeatures.includes('ADA Compliant')) {
      features.push('ADA Compliant');
    }
    
    const propFeatures = (property as any).propertyFeatures || {};
    if (propFeatures.adaParkingAvailable) features.push('ADA Parking');
    if (propFeatures.electricChargingAvailable) features.push('Electric Charging');
    if (propFeatures.roofCovering) features.push('Roof Covering');
    if (propFeatures.sevenFtTallClearance) features.push('7FT Tall Clearance');
    if (propFeatures.twentyFourSevenParking) features.push('24/7 Parking');
  } else {
    // Handle regular Property structure
    if (property.features) {
      features.push(...property.features);
    }
  }
  
  return features;
};

export default function PropertyCard({ property, initialProjects, onProjectDataChange }: PropertyCardProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const router = useRouter(); 

  const handleProjectUpdate = (updatedProject: Project) => {
    const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    onProjectDataChange(property.id, updatedProjects);
  };

  // Get property display data - handle both sampleData and regular Property formats
  const displayName = property.name || (property as any).details?.name || 'Unknown Property';
  const displayImage = property.imageUrl || (property as any).details?.imgURL || 'https://placehold.co/600x400.png';
  const displayFeatures = derivePropertyFeatures(property);
  const aiHint = property.aiHint || 'property image';

  return (
    <Card id={`property-${property.id}`} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col animate-subtle-slide-up scroll-mt-20">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={displayImage}
            alt={displayName}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            data-ai-hint={aiHint}
          />
        </div>
        <div className="p-6">
          <CardTitle className="text-xl mb-1 text-foreground">{displayName}</CardTitle>
          {displayFeatures && displayFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {displayFeatures.map(feature => ( 
                <Badge key={feature} variant={featureBadgeVariants[feature] || 'outline'} className="text-xs px-1.5 py-0.5">
                  {getFeatureIcon(feature)}
                  {feature}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <h4 className="text-md font-semibold text-foreground mb-3">Projects Overview:</h4>
        {projects.length > 0 ? (
          projects.slice(0, 1).map(project => ( 
            <div key={project.id} id={`project-${project.id}`} className="scroll-mt-20">
              <ProjectInfo 
                project={project} 
                onProjectUpdate={handleProjectUpdate} 
                showFileManagement={false} 
                allowAddingNotes={false} // Ensure add note form is not shown on card
              />
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No active projects for this property.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 bg-muted/30 border-t">
        <div className="flex w-full justify-center items-center">
           <Link href={`/dashboard/properties/${property.id}`} passHref legacyBehavior className="w-full">
            <Button
              variant="outline"
              size="sm"
              aria-label={`View ${displayName} details`}
              className="w-full"
            >
              <Eye size={16} className="mr-1.5" /> View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}