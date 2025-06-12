'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import AppHeader from '@/components/dashboard/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, ArrowLeft, Edit3, PlusCircle, MapPin as MapPinIcon, CalendarDays, CheckCircle2, ClipboardList, ListChecks, XCircle, Car, Info, Eye, Trash2, Award, Zap, Umbrella, Clock, Lightbulb, Signpost, Shield, TreePine, Recycle, Building2, Sigma, ToyBrick, Ruler, LogIn, LogOut, CreditCard, Gauge, AlertTriangle, Accessibility, Bolt, Bike } from 'lucide-react';
import ProjectDetailsModal from '@/components/dashboard/ProjectDetailsModal';
import ProjectModal from '@/components/dashboard/EditProjectModal';
import EditPropertyModal from '@/components/dashboard/EditPropertyModal';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, ProtectedRoute } from '@/context/AuthContext';

// Import the data service
import { dataService, type Property, type Project, type ProjectUpdate } from '@/lib/dataService';

const getFeatureIcon = (feature: string) => {
  const iconProps = { className: "h-4 w-4 mr-1.5" };
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
      return <Bolt {...iconProps} />;
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

const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
  switch (status) {
    case 'Completed': return "pastel-green";
    case 'In Progress': return "pastel-yellow";
    case 'Pending': return "pastel-blue";
    case 'On Hold': return "pastel-pink";
    case 'Cancelled': return "destructive";
    default: return "outline";
  }
};

const getStatusIcon = (status: string) => {
  const iconProps = { className: "mr-2 h-4 w-4" };
  switch (status) {
    case 'Pending': return <ClipboardList {...iconProps} />;
    case 'In Progress': return <Loader2 className={`${iconProps.className} animate-spin`} />;
    case 'Completed': return <CheckCircle2 {...iconProps} />;
    case 'On Hold': return <XCircle {...iconProps} />;
    case 'Cancelled': return <XCircle {...iconProps} />;
    default: return <ListChecks {...iconProps} />;
  }
}

const DetailItem: React.FC<{ label: string; value: string | number | string[] | undefined; icon?: React.ReactNode; className?: string }> = ({ label, value, icon, className }) => {
  if (value === undefined || (Array.isArray(value) && value.length === 0) || value === 'N/A' || value === null || (typeof value === 'number' && isNaN(value))) {
    return (
      <div className={cn("mb-2", className)}>
        <span className="text-sm font-medium text-muted-foreground flex items-center">{icon}{label}:</span>
        <span className="text-sm text-foreground ml-1">N/A</span>
      </div>
    );
  }
  return (
    <div className={cn("mb-2", className)}>
      <span className="text-sm font-medium text-muted-foreground flex items-center">{icon}{label}:</span>
      {Array.isArray(value) ? (
        value.map((item, index) => <Badge key={index} variant="secondary" className="ml-1 text-xs">{item}</Badge>)
      ) : (
        <span className="text-sm text-foreground ml-1">{String(value)}</span>
      )}
    </div>
  );
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

// Helper function to get display data from property (handles both formats)
const getPropertyDisplayData = (property: Property) => {
  const isSampleDataFormat = 'details' in property;
  
  return {
    name: isSampleDataFormat ? (property as any).details?.name : property.name,
    address: isSampleDataFormat ? (property as any).details?.address : property.address,
    description: isSampleDataFormat ? (property as any).details?.description : property.description,
    imageUrl: isSampleDataFormat ? (property as any).details?.imgURL : property.imageUrl,
    features: derivePropertyFeatures(property),
    
    // Parking data
    totalParking: isSampleDataFormat 
      ? Object.values((property as any).parkingCapacity?.totalParking || {}).reduce((a: number, b: number) => a + b, 0)
      : property.totalParking,
    generalParking: isSampleDataFormat ? (property as any).parkingCapacity?.totalParking?.generalParking : property.generalParking,
    adaParking: isSampleDataFormat ? (property as any).parkingCapacity?.totalParking?.adaParking : property.adaParking,
    evParking: isSampleDataFormat ? (property as any).parkingCapacity?.totalParking?.evParking : property.evParking,
    cityStaffParking: isSampleDataFormat ? (property as any).parkingCapacity?.totalParking?.cityStaffParking : property.cityStaffParking,
    lifeguardParking: isSampleDataFormat ? (property as any).parkingCapacity?.totalParking?.lifeguardParking : property.lifeguardParking,
    otherSpaces: isSampleDataFormat ? (property as any).parkingCapacity?.totalParking?.otherParking : property.otherSpaces,
    
    // Lighting
    smallLights: isSampleDataFormat ? (property as any).lighting?.totalLighting?.smallLights : property.smallLights,
    largeLights: isSampleDataFormat ? (property as any).lighting?.totalLighting?.largeLights : property.largeLights,
    totalLighting: isSampleDataFormat 
      ? ((property as any).lighting?.totalLighting?.smallLights || 0) + ((property as any).lighting?.totalLighting?.largeLights || 0)
      : property.totalLighting,
    
    // Infrastructure
    securityFeatures: isSampleDataFormat ? (property as any).infrastructureAmenities?.securityFeatures : property.securityFeatures,
    elevatorCount: isSampleDataFormat ? (property as any).infrastructureAmenities?.elevatorCount : property.elevatorsCount,
    stairs: isSampleDataFormat ? (property as any).infrastructureAmenities?.stairs : property.stairsCount,
    carStops: isSampleDataFormat ? (property as any).infrastructureAmenities?.carStops : property.carStopsCount,
    bikeFacilities: isSampleDataFormat ? (property as any).infrastructureAmenities?.bikeFacilities : property.bikeFacilities,
    
    // Operational
    surfaceCondition: isSampleDataFormat ? (property as any).operationalDetails?.surfaceCondition : property.surfaceCondition,
    surfaceType: isSampleDataFormat 
      ? (property as any).operationalDetails?.surfaceType?.join?.(', ') || (property as any).operationalDetails?.surfaceType
      : property.surfaceType,
    clearanceRequirements: isSampleDataFormat ? (property as any).operationalDetails?.clearanceRequirements : property.clearanceRequirements,
    entryPoints: isSampleDataFormat ? (property as any).operationalDetails?.accessPoints?.entrances : property.entryPoints,
    exitPoints: isSampleDataFormat ? (property as any).operationalDetails?.accessPoints?.exits : property.exitPoints,
    paymentSystems: isSampleDataFormat ? (property as any).operationalDetails?.paymentSystems : property.paymentSystems,
    totalMeters: isSampleDataFormat ? (property as any).operationalDetails?.totalMeters : property.totalMeters,
  };
};

function PropertyDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.propertyId as string;
  const { toast } = useToast();
  const { user, isAdmin, isLoadingAuth } = useAuth();
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  const [property, setProperty] = useState<Property | null>(null);
  const [propertyProjects, setPropertyProjects] = useState<Project[]>([]);

  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [projectForForm, setProjectForForm] = useState<Project | Partial<Project> | null>(null);
  const [isProjectFormModalOpen, setIsProjectFormModalOpen] = useState(false);
  const [isNewProjectMode, setIsNewProjectMode] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false);

  useEffect(() => {
    const fetchPropertyData = () => {
      if (!propertyId) {
        setIsDataInitialized(false);
        router.replace('/dashboard/properties');
        return;
      }

      try {
        console.log("Loading property data from sampleData...");
        
        // Get property from dataService
        const foundProperty = dataService.getProperty(propertyId);
        if (foundProperty) {
          setProperty(foundProperty);
          
          // Get projects for this property
          const projectsForProperty = dataService.getProjectsForProperty(propertyId);
          setPropertyProjects(projectsForProperty);
          
          console.log("Loaded property data:", {
            property: foundProperty.name,
            projects: projectsForProperty.length
          });
          
          toast({
            title: "Property Loaded",
            description: `Loaded ${foundProperty.name} with ${projectsForProperty.length} projects.`,
            variant: "default"
          });
        } else {
          console.log("Property not found:", propertyId);
          toast({
            title: "Property Not Found",
            description: "The requested property could not be found.",
            variant: "destructive"
          });
          router.replace('/dashboard/properties');
        }
      } catch (error: any) {
        console.error("Error loading property data:", error);
        toast({
          title: "Error Loading Property",
          description: error.message || "Could not load property data.",
          variant: "destructive"
        });
        router.replace('/dashboard/properties');
      } finally {
        setIsDataInitialized(true);
      }
    };

    if (!isLoadingAuth) {
      fetchPropertyData();
    }
  }, [propertyId, router, isLoadingAuth, toast]);

  const handleOpenNewProjectForm = useCallback(() => {
    if (!property) return;
    const newProjectDefaults = {
      name: '',
      description: '',
      propertyId: property.id,
      property: property.id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Pending',
      projectCategory: 'Minor Project',
      scopeCategory: 'Routine',
      documents: [],
      updates: [],
      files: [],
      progressPercentage: 0,
    };
    setProjectForForm(newProjectDefaults);
    setIsNewProjectMode(true);
    setIsProjectFormModalOpen(true);
  }, [property]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && !isProjectModalOpen && !isProjectFormModalOpen && !isDeleteAlertOpen && !isEditPropertyModalOpen && isDataInitialized) {
      const elementId = window.location.hash.substring(1);
      if (elementId === 'add-new-project' && property && isAdmin) {
        handleOpenNewProjectForm();
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } else {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [isDataInitialized, propertyId, router, isProjectModalOpen, isProjectFormModalOpen, isDeleteAlertOpen, isEditPropertyModalOpen, property, isAdmin, handleOpenNewProjectForm]);

  const handleNoteAddedToProject = useCallback((projectId: string, newUpdate: ProjectUpdate) => {
    let updatedModalProject: Project | undefined;
    setPropertyProjects(prevPropertyProjects => {
      const newPropertyProjectsList = prevPropertyProjects.map(p => {
        if (p.id === projectId) {
          updatedModalProject = { ...p, updates: [...p.updates, newUpdate] };
          return updatedModalProject;
        }
        return p;
      });
      return newPropertyProjectsList;
    });
    
    if (selectedProjectForModal && selectedProjectForModal.id === projectId && updatedModalProject) {
      setSelectedProjectForModal(updatedModalProject);
    }
  }, [selectedProjectForModal]);

  const handleViewProjectDetails = useCallback((project: Project) => {
    setSelectedProjectForModal(project);
    setIsProjectModalOpen(true);
  }, []);

  const handleOpenEditProjectForm = useCallback((project: Project) => {
    setProjectForForm(project);
    setIsNewProjectMode(false);
    setIsProjectFormModalOpen(true);
  }, []);

  const handleSaveProjectForm = useCallback((savedProject: Project) => {
    if (isNewProjectMode) {
      const newProject = {
        ...savedProject,
        id: savedProject.id || `P${Date.now().toString().slice(-4)}`,
      };
      setPropertyProjects(prevProjects => [newProject, ...prevProjects]);
      toast({ title: "Project Added", description: `${savedProject.name} has been successfully added. (Local state only)` });
    } else {
      setPropertyProjects(prevProjects => prevProjects.map(p => (p.id === savedProject.id ? savedProject : p)));
      toast({ title: "Project Updated", description: `${savedProject.name} has been successfully updated. (Local state only)` });
    }
    setIsProjectFormModalOpen(false);
    setProjectForForm(null);
  }, [isNewProjectMode, toast]);

  const handleDeleteProjectClick = useCallback((project: Project) => {
    setProjectToDelete(project);
    setIsDeleteAlertOpen(true);
  }, []);

  const confirmDeleteProject = useCallback(() => {
    if (projectToDelete) {
      setPropertyProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
      toast({ title: "Project Deleted", description: `"${projectToDelete.name}" has been deleted. (Local state only)`, variant: "destructive" });
    }
    setIsDeleteAlertOpen(false);
    setProjectToDelete(null);
  }, [projectToDelete, toast]);

  const handleOpenEditPropertyModal = useCallback(() => {
    if (property) { setIsEditPropertyModalOpen(true); }
  }, [property]);

  const handleSavePropertyForm = useCallback((updatedPropertyData: any) => {
    if (!property) return;
    
    // For demo purposes, just update local state
    setProperty(updatedPropertyData);
    toast({ title: "Property Updated", description: `Property has been successfully updated. (Local state only)` });
    setIsEditPropertyModalOpen(false);
  }, [property, toast]);

  if (!isDataInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <MapPinIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-6">The property you are looking for does not exist or could not be loaded.</p>
          <Button onClick={() => router.push('/dashboard/properties')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
          </Button>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
          FTL TAM PPM Published 2025
        </footer>
      </div>
    );
  }

  const displayData = getPropertyDisplayData(property);
  const iconPropsSmall = { className: "h-4 w-4 mr-2 text-accent" };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="p-0">
                <div className="relative h-60 w-full">
                  <Image
                    src={displayData.imageUrl || 'https://placehold.co/600x400.png'}
                    alt={displayData.name || 'Property'}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                    data-ai-hint="property detail image"
                  />
                </div>
                <div className="p-6">
                  <CardTitle className="font-headline text-5xl mb-2 text-foreground">{displayData.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">{displayData.address}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <h4 className="font-semibold text-md text-foreground mb-2 flex items-center">
                  <Info {...iconPropsSmall} /> Description
                </h4>
                <p className="text-sm text-muted-foreground mb-4">{displayData.description}</p>
                <h4 className="font-semibold text-md text-foreground mb-3 flex items-center">
                  <Award {...iconPropsSmall} /> Property Features
                </h4>
                {displayData.features && displayData.features.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {displayData.features.map(feature => (
                      <Badge key={feature} variant={featureBadgeVariants[feature] || 'outline'} className="text-xs">
                        {getFeatureIcon(feature)} {feature}
                      </Badge>
                    ))}
                  </div>
                ) : (<p className="text-sm text-muted-foreground mb-4">No specific features listed.</p>)}
                <Separator className="my-4" />
                <Tabs defaultValue="parking_capacity" className="w-full">
                <TabsList className="grid w-full grid-cols-3 gap-4 mb-4">
                    <TabsTrigger value="parking_capacity" aria-label="Parking Capacity"><Car className={cn("h-5 w-5", "text-[hsl(var(--pastel-blue-fg))]")} /></TabsTrigger>
                    <TabsTrigger value="lighting" aria-label="Lighting Details"><Lightbulb className={cn("h-5 w-5", "text-[hsl(var(--pastel-yellow-fg))]")} /></TabsTrigger>
                    <TabsTrigger value="operational" aria-label="Operational Details"><Gauge className={cn("h-5 w-5", "text-[hsl(var(--pastel-pink-fg))]")} /></TabsTrigger>
                </TabsList>
                <TabsContent value="parking_capacity"><div><h3 className="text-xl font-semibold flex items-center mb-3"><Car className={cn("h-5 w-5 mr-3", "text-[hsl(var(--pastel-blue-fg))]")} /> Parking Capacity</h3><div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm"><DetailItem label="Total Spaces" value={displayData.totalParking} /><DetailItem label="General" value={displayData.generalParking} /><DetailItem label="ADA" value={displayData.adaParking} /><DetailItem label="EV" value={displayData.evParking} /><DetailItem label="City Staff" value={displayData.cityStaffParking} /><DetailItem label="Lifeguard" value={displayData.lifeguardParking} /><DetailItem label="Other" value={displayData.otherSpaces} /></div></div></TabsContent>
                <TabsContent value="lighting"><div><h3 className="text-xl font-semibold flex items-center mb-3"><Lightbulb className={cn("h-5 w-5 mr-3", "text-[hsl(var(--pastel-yellow-fg))]")} /> Lighting</h3><div className="space-y-1 text-sm"><DetailItem label="Small Lights" value={displayData.smallLights} /><DetailItem label="Large Lights" value={displayData.largeLights} /><DetailItem label="Total Lighting Units" value={displayData.totalLighting} /></div></div></TabsContent>
                <TabsContent value="operational"><div><h3 className="text-xl font-semibold flex items-center mb-3"><Gauge className={cn("h-5 w-5 mr-3", "text-[hsl(var(--pastel-pink-fg))]")} /> Operational Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm"><DetailItem label="Surface Condition" value={displayData.surfaceCondition} icon={<AlertTriangle {...iconPropsSmall}/>}/><DetailItem label="Surface Type" value={displayData.surfaceType} icon={<ToyBrick {...iconPropsSmall}/>}/><DetailItem label="Clearance Requirements" value={displayData.clearanceRequirements} icon={<Ruler {...iconPropsSmall}/>}/><DetailItem label="Entry Points" value={displayData.entryPoints} icon={<LogIn {...iconPropsSmall}/>}/><DetailItem label="Exit Points" value={displayData.exitPoints} icon={<LogOut {...iconPropsSmall}/>}/><DetailItem label="Payment Systems" value={displayData.paymentSystems} icon={<CreditCard {...iconPropsSmall}/>}/><DetailItem label="Total Meters" value={displayData.totalMeters} /></div></div></TabsContent>
                </Tabs>
                <Separator className="my-4" />
                {isAdmin && (
                  <Button variant="outline" onClick={handleOpenEditPropertyModal} className="w-full">
                      <Edit3 className="mr-2 h-4 w-4" /> Edit Property Details
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-4xl text-foreground">Projects for {displayData.name}</CardTitle>
                    <CardDescription>Overview of all projects related to this parking location.</CardDescription>
                </div>
                {isAdmin && (
                  <Button variant="outline" onClick={handleOpenNewProjectForm} size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {propertyProjects.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Scope Category</TableHead>
                          <TableHead className="hidden md:table-cell">Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {propertyProjects.map((project) => (
                          <TableRow key={project.id} id={`project-${project.id}`} className="hover:bg-muted/50 scroll-mt-20" >
                            <TableCell className="font-medium text-foreground">{project.name}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(project.status)} className="text-xs whitespace-nowrap">
                                {getStatusIcon(project.status)} {project.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {project.scopeCategory ? (
                                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                  {project.scopeCategory}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{new Date(project.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="link" size="icon" className="text-accent hover:underline h-8 w-8 p-0" onClick={() => handleViewProjectDetails(project)} aria-label={`View project ${project.name}`}>
                                 <Eye className="h-4 w-4" />
                              </Button>
                              {isAdmin && (
                                <>
                                  <Button variant="link" size="icon" className="text-muted-foreground hover:text-accent hover:underline h-8 w-8 p-0" onClick={() => handleOpenEditProjectForm(project)} aria-label={`Edit project ${project.name}`}>
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="link" size="icon" className="text-destructive hover:underline h-8 w-8 p-0" onClick={() => handleDeleteProjectClick(project)} aria-label={`Delete project ${project.name}`}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No projects found for this property.</p>
                    {isAdmin && (
                      <Button variant="outline" className="mt-4" onClick={handleOpenNewProjectForm}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        FTL TAM PPM Published 2025
      </footer>

      <ProjectDetailsModal
        project={selectedProjectForModal}
        propertyName={displayData.name || 'Unknown Property'}
        isOpen={isProjectModalOpen}
        onClose={() => { setIsProjectModalOpen(false); setSelectedProjectForModal(null); }}
        onNoteAdded={handleNoteAddedToProject}
      />
      {isProjectFormModalOpen && isAdmin && (
       <ProjectModal
          project={projectForForm || undefined}
          isNewProject={isNewProjectMode}
          isOpen={isProjectFormModalOpen}
          onClose={() => { setIsProjectFormModalOpen(false); setProjectForForm(null); }}
          onSave={handleSaveProjectForm}
        />
      )}
      {isAdmin && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the project "{projectToDelete?.name}" from this property in your current session.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDeleteProject} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
      {isEditPropertyModalOpen && property && isAdmin && (
        <EditPropertyModal
          property={property}
          isOpen={isEditPropertyModalOpen}
          onClose={() => setIsEditPropertyModalOpen(false)}
          onSave={handleSavePropertyForm}
        />
      )}
    </div>
  );
}

export default function PropertyDetailsPage() {
  return (
    <ProtectedRoute>
      <PropertyDetailsContent />
    </ProtectedRoute>
  );
}