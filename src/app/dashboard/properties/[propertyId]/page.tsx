
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
import { properties as initialPropertiesData } from '@/data/properties';
import { projects as initialProjectsData } from '@/data/projects';
import type { Property, Project, PropertyFormData, PropertyFeature, ProjectUpdate, ProjectScopeCategory } from '@/types';
import { NewProjectDefaultValues } from '@/types';
import { Loader2, ArrowLeft, Edit3, PlusCircle, MapPin as MapPinIcon, CalendarDays, CheckCircle2, ClipboardList, ListChecks, XCircle, Car, Info, Eye, Trash2, Award, Zap, Umbrella, Clock, Lightbulb, Signpost, Shield, TreePine, Recycle, Building2, Sigma, ToyBrick, Ruler, LogIn, LogOut, CreditCard, Gauge, AlertTriangle, Accessibility, Bolt, Bike } from 'lucide-react';
import ProjectDetailsModal from '@/components/dashboard/ProjectDetailsModal';
import ProjectModal from '@/components/dashboard/EditProjectModal';
import EditPropertyModal from '@/components/dashboard/EditPropertyModal';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, ProtectedRoute } from '@/context/AuthContext';

const getFeatureIcon = (feature: PropertyFeature) => {
  const iconProps = { className: "h-4 w-4 mr-1.5" };
  switch (feature) {
    case 'ADA Parking': return <Accessibility {...iconProps} />;
    case '24/7 Parking': return <Clock {...iconProps} />;
    case '7FT Tall Clearance': return <Ruler {...iconProps} />;
    case 'Electric Charging': return <Bolt {...iconProps} />;
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

const getStatusBadgeVariant = (status: Project['status']): BadgeProps['variant'] => {
  switch (status) {
    case 'Completed': return "pastel-green";
    case 'In Progress': return "pastel-yellow";
    case 'Pending': return "pastel-blue";
    case 'On Hold': return "pastel-pink";
    case 'Cancelled': return "destructive";
    default: return "outline";
  }
};

const scopeCategoryBadgeVariants: Record<ProjectScopeCategory, BadgeProps['variant']> = {
  'Cleanup': 'pastel-blue',
  'Inspection': 'pastel-green',
  'Installation': 'pastel-pink',
  'Renovation': 'pastel-yellow',
  'Repair': 'pastel-purple',
  'Replacement': 'pastel-blue',
  'Routine': 'pastel-green',
  'Survey': 'pastel-pink',
  'Upgrade': 'pastel-yellow',
};

const getStatusIcon = (status: Project['status']) => {
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
    if (propertyId) {
      setTimeout(() => {
        const foundProperty = initialPropertiesData.find(p => p.id === propertyId);
        if (foundProperty) {
          setProperty(foundProperty);
          const currentGlobalProjects = initialProjectsData;
          const projectsForProperty = currentGlobalProjects.filter(proj => proj.propertyId === propertyId);
          setPropertyProjects(projectsForProperty);
        } else {
          router.replace('/dashboard/properties');
        }
        setIsDataInitialized(true);
      }, 100);
    } else {
      setIsDataInitialized(false);
      router.replace('/dashboard/properties');
    }
  }, [router, propertyId]);

  const handleOpenNewProjectForm = useCallback(() => {
    if (!property) return;
    setProjectForForm({ ...NewProjectDefaultValues, propertyId: property.id });
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
    const globalIndex = initialProjectsData.findIndex(p => p.id === projectId);
    if (globalIndex !== -1) {
      const projectInGlobal = initialProjectsData[globalIndex];
      initialProjectsData[globalIndex] = { ...projectInGlobal, updates: [...projectInGlobal.updates, newUpdate] };
    }
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
      setPropertyProjects(prevProjects => [savedProject, ...prevProjects]);
      initialProjectsData.unshift(savedProject);
      toast({ title: "Project Added", description: `${savedProject.name} has been successfully added. (Client-side only)` });
    } else {
      setPropertyProjects(prevProjects => prevProjects.map(p => (p.id === savedProject.id ? savedProject : p)));
      const globalProjectIndex = initialProjectsData.findIndex(p => p.id === savedProject.id);
      if (globalProjectIndex !== -1) { initialProjectsData[globalProjectIndex] = savedProject; }
      toast({ title: "Project Updated", description: `${savedProject.name} has been successfully updated. (Client-side only)` });
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
      const globalProjectIndex = initialProjectsData.findIndex(p => p.id === projectToDelete.id);
      if (globalProjectIndex !== -1) { initialProjectsData.splice(globalProjectIndex, 1); }
      toast({ title: "Project Deleted", description: `"${projectToDelete.name}" has been deleted. (Client-side only)`, variant: "destructive" });
    }
    setIsDeleteAlertOpen(false);
    setProjectToDelete(null);
  }, [projectToDelete, toast]);

  const handleOpenEditPropertyModal = useCallback(() => {
    if (property) { setIsEditPropertyModalOpen(true); }
  }, [property]);

  const getAiHintFromUrl = useCallback((url: string | undefined, currentHint: string | undefined): string => {
    if (!url || url.startsWith('https://placehold.co')) { return currentHint || 'property detail image'; }
    try {
 if (url.startsWith('https://firebasestorage.googleapis.com/') || url.includes('.appspot.com/')) {
 return 'firebase storage image'; }
      const hostname = new URL(url).hostname;
      if (hostname.includes('unsplash')) return 'unsplash image';
      if (hostname.includes('pexels')) return 'pexels image';
      return 'external image';
    } catch { return 'property image'; }
  }, []);

  const parseCommaSeparatedString = useCallback((input?: string): string[] => {
    if (!input || typeof input !== 'string') return [];
    return input.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }, []);

  const handleSavePropertyForm = useCallback((updatedPropertyData: PropertyFormData) => {
    if (!property) return;
    const newTotalParking = (updatedPropertyData.generalParking || 0) + (updatedPropertyData.adaParking || 0) + (updatedPropertyData.evParking || 0) + (updatedPropertyData.cityStaffParking || 0) + (updatedPropertyData.lifeguardParking || 0) + (updatedPropertyData.otherSpaces || 0);
    const newTotalLighting = (updatedPropertyData.smallLights || 0) + (updatedPropertyData.largeLights || 0);
    const newTotalSignage = (updatedPropertyData.trafficRegulatorySigns || 0) + (updatedPropertyData.parkingInfoSigns || 0) + (updatedPropertyData.paymentSigns || 0) + (updatedPropertyData.wayfindingSigns || 0) + (updatedPropertyData.trafficDirectionSigns || 0) + (updatedPropertyData.otherSignage || 0);

    const updatedProperty: Property = {
      ...property, 
      name: updatedPropertyData.name,
      address: updatedPropertyData.address,
      description: updatedPropertyData.description,
      features: updatedPropertyData.features || [],
      imageUrl: updatedPropertyData.imageUrl?.trim() || 'https://placehold.co/600x400.png',
      aiHint: getAiHintFromUrl(updatedPropertyData.imageUrl, property.aiHint),
      generalParking: updatedPropertyData.generalParking || 0,
      adaParking: updatedPropertyData.adaParking || 0,
      evParking: updatedPropertyData.evParking || 0,
      cityStaffParking: updatedPropertyData.cityStaffParking || 0,
      lifeguardParking: updatedPropertyData.lifeguardParking || 0,
      otherSpaces: updatedPropertyData.otherSpaces || 0,
      totalParking: newTotalParking,
      smallLights: updatedPropertyData.smallLights || 0,
      largeLights: updatedPropertyData.largeLights || 0,
      totalLighting: newTotalLighting,
      trafficRegulatorySigns: updatedPropertyData.trafficRegulatorySigns || 0,
      parkingInfoSigns: updatedPropertyData.parkingInfoSigns || 0,
      paymentSigns: updatedPropertyData.paymentSigns || 0,
      wayfindingSigns: updatedPropertyData.wayfindingSigns || 0,
      trafficDirectionSigns: updatedPropertyData.trafficDirectionSigns || 0,
      otherSignage: updatedPropertyData.otherSignage || 0,
      totalSignage: newTotalSignage,
      securityFeatures: parseCommaSeparatedString(updatedPropertyData.securityFeaturesInput),
      treesCount: updatedPropertyData.treesCount || 0,
      trashCansCount: updatedPropertyData.trashCansCount || 0,
      elevatorsCount: updatedPropertyData.elevatorsCount || 0,
      stairsCount: updatedPropertyData.stairsCount || 0,
      carStopsCount: updatedPropertyData.carStopsCount || 0,
      bikeFacilities: parseCommaSeparatedString(updatedPropertyData.bikeFacilitiesInput),
      surfaceCondition: updatedPropertyData.surfaceCondition || 'N/A',
      surfaceType: updatedPropertyData.surfaceType || 'N/A',
      clearanceRequirements: updatedPropertyData.clearanceRequirements || 'N/A',
      entryPoints: updatedPropertyData.entryPoints || 0,
      exitPoints: updatedPropertyData.exitPoints || 0,
      paymentSystems: parseCommaSeparatedString(updatedPropertyData.paymentSystemsInput),
      totalMeters: updatedPropertyData.totalMeters || 0,
    };
    setProperty(updatedProperty);
    const globalIndex = initialPropertiesData.findIndex(p => p.id === updatedProperty.id);
    if (globalIndex !== -1) { initialPropertiesData[globalIndex] = updatedProperty; }
    toast({ title: "Property Updated", description: `${updatedProperty.name} has been successfully updated. (Client-side only)` });
    setIsEditPropertyModalOpen(false);
  }, [property, toast, getAiHintFromUrl, parseCommaSeparatedString]);

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
                    src={property.imageUrl?.trim() || 'https://placehold.co/600x400.png'}
                    alt={property.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                    data-ai-hint={property.aiHint || 'property detail image'}
                  />
                </div>
                <div className="p-6">
                  <CardTitle className="font-headline text-5xl mb-2 text-foreground">{property.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">{property.address}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <h4 className="font-semibold text-md text-foreground mb-2 flex items-center">
                  <Info {...iconPropsSmall} /> Description
                </h4>
                <p className="text-sm text-muted-foreground mb-4">{property.description}</p>
                <h4 className="font-semibold text-md text-foreground mb-3 flex items-center">
                  <Award {...iconPropsSmall} /> Property Features
                </h4>
                {property.features && property.features.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.features.map(feature => (
                      <Badge key={feature} variant={featureBadgeVariants[feature] || 'outline'} className="text-xs">
                        {getFeatureIcon(feature)} {feature}
                      </Badge>
                    ))}
                  </div>
                ) : (<p className="text-sm text-muted-foreground mb-4">No specific features listed.</p>)}
                <Separator className="my-4" />
                <Tabs defaultValue="parking_capacity" className="w-full">
                <TabsList className="grid w-full grid-cols-5 gap-4 mb-4">
                    <TabsTrigger value="parking_capacity" aria-label="Parking Capacity"><Car className={cn("h-5 w-5", "text-[hsl(var(--pastel-blue-fg))]")} /></TabsTrigger>
                    <TabsTrigger value="lighting" aria-label="Lighting Details"><Lightbulb className={cn("h-5 w-5", "text-[hsl(var(--pastel-yellow-fg))]")} /></TabsTrigger>
                    <TabsTrigger value="signage" aria-label="Signage Details"><Signpost className={cn("h-5 w-5", "text-[hsl(var(--pastel-green-fg))]")} /></TabsTrigger>
                    <TabsTrigger value="infrastructure" aria-label="Infrastructure & Amenities"><Building2 className={cn("h-5 w-5", "text-[hsl(var(--pastel-purple-fg))]")} /></TabsTrigger>
                    <TabsTrigger value="operational" aria-label="Operational Details"><Gauge className={cn("h-5 w-5", "text-[hsl(var(--pastel-pink-fg))]")} /></TabsTrigger>
                </TabsList>
                <TabsContent value="parking_capacity"><div><h3 className="text-xl font-semibold flex items-center mb-3"><Car className={cn("h-5 w-5 mr-3", "text-[hsl(var(--pastel-blue-fg))]")} /> Parking Capacity</h3><div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm"><DetailItem label="Total Spaces" value={property.totalParking} /><DetailItem label="General" value={property.generalParking} /><DetailItem label="ADA" value={property.adaParking} /><DetailItem label="EV" value={property.evParking} /><DetailItem label="City Staff" value={property.cityStaffParking} /><DetailItem label="Lifeguard" value={property.lifeguardParking} /><DetailItem label="Other" value={property.otherSpaces} /></div></div></TabsContent>
                <TabsContent value="lighting"><div><h3 className="text-xl font-semibold flex items-center mb-3"><Lightbulb className={cn("h-5 w-5 mr-3", "text-[hsl(var(--pastel-yellow-fg))]")} /> Lighting</h3><div className="space-y-1 text-sm"><DetailItem label="Small Lights" value={property.smallLights} /><DetailItem label="Large Lights" value={property.largeLights} /><DetailItem label="Total Lighting Units" value={property.totalLighting} /></div></div></TabsContent>
                <TabsContent value="signage"><div><h3 className="text-xl font-semibold flex items-center mb-3"><Signpost className={cn("h-5 w-5 mr-3", "text-[hsl(var(--pastel-green-fg))]")} /> Signage</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm"><DetailItem label="Traffic Regulatory" value={property.trafficRegulatorySigns} /><DetailItem label="Parking Info" value={property.parkingInfoSigns} /><DetailItem label="Payment System" value={property.paymentSigns} /><DetailItem label="Wayfinding" value={property.wayfindingSigns} /><DetailItem label="Traffic Direction" value={property.trafficDirectionSigns} /><DetailItem label="Other" value={property.otherSignage} /><DetailItem label="Total Signage Units" value={property.totalSignage} /></div></div></TabsContent>
                <TabsContent value="infrastructure"><div><h3 className="text-xl font-semibold flex items-center mb-3"><Building2 className={cn("h-5 w-5 mr-3", "text-[hsl(var(--pastel-purple-fg))]")} /> Infrastructure & Amenities</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm"><DetailItem label="Security Features" value={property.securityFeatures} icon={<Shield {...iconPropsSmall}/>} /><DetailItem label="Trees" value={property.treesCount} icon={<TreePine {...iconPropsSmall}/>} /><DetailItem label="Trash Cans" value={property.trashCansCount} icon={<Recycle {...iconPropsSmall}/>} /><DetailItem label="Elevators" value={property.elevatorsCount} icon={<Sigma {...iconPropsSmall} style={{transform: 'rotate(90deg)'}}/>} /><DetailItem label="Stairs" value={property.stairsCount} /><DetailItem label="Car Stops" value={property.carStopsCount} /><DetailItem label="Bike Facilities" value={property.bikeFacilities} icon={<Bike {...iconPropsSmall}/>}/></div></div></TabsContent>
                <TabsContent value="operational"><div><h3 className="text-xl font-semibold flex items-center mb-3"><Gauge className={cn("h-5 w-5 mr-3", "text-[hsl(var(--pastel-pink-fg))]")} /> Operational Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm"><DetailItem label="Surface Condition" value={property.surfaceCondition} icon={<AlertTriangle {...iconPropsSmall}/>}/><DetailItem label="Surface Type" value={property.surfaceType} icon={<ToyBrick {...iconPropsSmall}/>}/><DetailItem label="Clearance Requirements" value={property.clearanceRequirements} icon={<Ruler {...iconPropsSmall}/>}/><DetailItem label="Entry Points" value={property.entryPoints} icon={<LogIn {...iconPropsSmall}/>}/><DetailItem label="Exit Points" value={property.exitPoints} icon={<LogOut {...iconPropsSmall}/>}/><DetailItem label="Payment Systems" value={property.paymentSystems} icon={<CreditCard {...iconPropsSmall}/>}/><DetailItem label="Total Meters" value={property.totalMeters} /></div></div></TabsContent>
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
                    <CardTitle className="font-headline text-4xl text-foreground">Projects for {property.name}</CardTitle>
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
                              <div className="flex flex-wrap gap-1">
                                {(project.scopeCategory && project.scopeCategory.length > 0) ? (
                                  project.scopeCategory.map(scope => (
                                    <Badge key={scope} variant={scopeCategoryBadgeVariants[scope] || 'secondary'} className="text-xs whitespace-nowrap">
                                      {scope}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">N/A</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{new Date(project.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
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
        propertyName={property.name}
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


    