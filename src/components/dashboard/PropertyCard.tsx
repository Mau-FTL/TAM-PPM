
'use client';

import { useState } from 'react';
import Image from 'next/image'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Property, Project as ProjectType, PropertyFeature } from '@/types';
import ProjectInfo from './ProjectInfo';
import { PlusCircle, Eye, Ruler, Award, Clock, Accessibility, Zap, Umbrella } from 'lucide-react'; 

interface PropertyCardProps {
  property: Property;
  initialProjects: ProjectType[];
  onProjectDataChange: (propertyId: string, updatedProjects: ProjectType[]) => void;
}

const getFeatureIcon = (feature: PropertyFeature) => {
  const iconProps = { className: "h-3 w-3 mr-1" }; 
  switch (feature) {
    case 'ADA Parking': return <Accessibility {...iconProps} />;
    case '24/7 Parking': return <Clock {...iconProps} />;
    case '7FT Tall Clearance': return <Ruler {...iconProps} />; 
    case 'Electric Charging': return <Zap {...iconProps} />;
    case 'Roof Covering': return <Umbrella {...iconProps} />;
    default: return <Award {...iconProps} />;
  }
};

const featureBadgeVariants: Record<PropertyFeature, BadgeProps['variant']> = {
  'ADA Parking': 'pastel-blue',
  '24/7 Parking': 'pastel-green',
  '7FT Tall Clearance': 'pastel-pink',
  'Electric Charging': 'pastel-yellow',
  'Roof Covering': 'pastel-purple',
};

export default function PropertyCard({ property, initialProjects, onProjectDataChange }: PropertyCardProps) {
  const [projects, setProjects] = useState<ProjectType[]>(initialProjects);
  const router = useRouter(); 

  const handleProjectUpdate = (updatedProject: ProjectType) => {
    const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    onProjectDataChange(property.id, updatedProjects);
  };

  return (
    <Card id={`property-${property.id}`} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col animate-subtle-slide-up scroll-mt-20">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={property.imageUrl?.trim() || 'https://placehold.co/600x400.png'}
            alt={property.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
            data-ai-hint={property.aiHint || 'property image'}
          />
        </div>
        <div className="p-6">
          <CardTitle className="text-xl mb-1 text-foreground">{property.name}</CardTitle>
          {property.features && property.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {property.features.map(feature => ( 
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
              aria-label={`View ${property.name} details`}
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
