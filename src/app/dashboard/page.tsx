'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/components/dashboard/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase, Clock, MapPin, CheckCircle, ListChecks, Settings, FileText, LayoutDashboard, PlusCircle, ParkingSquare, BarChart3, Eye } from 'lucide-react';
import PropertyCard from '@/components/dashboard/PropertyCard'; 
import { useAuth, ProtectedRoute } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";

// Import the new data service
import { dataService, type Property, type Project } from '@/lib/dataService';

function DashboardContent() {
  const router = useRouter();
  const { user, isAdmin, isLoadingAuth } = useAuth();
  const { toast } = useToast();
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);

  useEffect(() => {
    const fetchDataFromSampleData = () => {
      if (!user) { 
        setIsDataInitialized(true);
        return;
      }

      try {
        console.log("Loading dashboard data from sampleData...");
        
        // Load data from dataService
        const fetchedProperties = dataService.getProperties();
        const fetchedProjects = dataService.getProjects();
        
        setProperties(fetchedProperties);
        setProjects(fetchedProjects);
        setActiveProjectsCount(fetchedProjects.filter(p => p.status === 'In Progress').length);
        
        console.log("Loaded dashboard data:", {
          properties: fetchedProperties.length,
          projects: fetchedProjects.length,
          activeProjects: fetchedProjects.filter(p => p.status === 'In Progress').length
        });
        
        toast({
          title: "Dashboard Loaded",
          description: `Loaded ${fetchedProjects.length} projects and ${fetchedProperties.length} properties from sample data.`,
          variant: "default"
        });
      } catch (error: any) {
        console.error("Error loading dashboard data:", error);
        toast({
          title: "Error Loading Dashboard",
          description: error.message || "Could not load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setIsDataInitialized(true);
      }
    };

    if (!isLoadingAuth && user) {
      fetchDataFromSampleData();
    }
  }, [isLoadingAuth, user, toast]);

  const handleProjectDataChange = (propertyId: string, updatedProjectsForProperty: Project[]) => {
    setProjects(prevProjects => {
      const otherProjects = prevProjects.filter(p => p.propertyId !== propertyId);
      return [...otherProjects, ...updatedProjectsForProperty];
    });
  };

  if (!isDataInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Loading dashboard data...</p>
      </div>
    );
  }
  
  const upcomingCompletions = projects
    .filter(p => p.status === 'In Progress' || p.status === 'Pending')
    .sort((a, b) => new Date(a.endDate || '').getTime() - new Date(b.endDate || '').getTime())
    .slice(0, 3);

  const recentProjectUpdates = projects 
    .sort((a, b) => {
      const lastUpdateA = a.updates.length > 0 ? new Date(a.updates[a.updates.length -1].timestamp).getTime() : new Date(a.startDate).getTime();
      const lastUpdateB = b.updates.length > 0 ? new Date(b.updates[b.updates.length -1].timestamp).getTime() : new Date(b.startDate).getTime();
      return lastUpdateB - lastUpdateA;
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-5xl font-bold font-headline text-foreground mb-8">Dashboard Overview</h2>

        {/* Stats Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{projects.length}</div>
                <p className="text-xs text-muted-foreground">Across all properties</p> 
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{activeProjectsCount}</div>
                <p className="text-xs text-muted-foreground">{projects.filter(p => p.status === 'In Progress').length} in progress</p>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Parking Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{properties.length}</div>
                <p className="text-xs text-muted-foreground">Managed properties</p> 
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                   {projects.length > 0 ? `${Math.round((projects.filter(p=>p.status === 'Completed').length / projects.length) * 100)}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Based on current data</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Upcoming Completions */}
          <section className="lg:col-span-1">
            <h3 className="text-2xl font-semibold font-headline text-foreground mb-4">Upcoming Completions</h3>
             <p className="text-sm text-muted-foreground mb-4">View upcoming project completions and deadlines.</p>
            <Card className="shadow-md">
              <CardContent className="pt-6">
                {upcomingCompletions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingCompletions.map(project => {
                      const property = properties.find(p => p.id === project.propertyId);
                      return (
                        <div key={project.id} className="p-4 border rounded-md hover:bg-muted/50 transition-colors">
                          <h4 className="font-semibold text-foreground">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Property: {property?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                          </p>
                          {property && (
                            <Link href={`/dashboard/properties/${property.id}#project-${project.id}`} passHref>
                              <Button variant="link" size="sm" className="p-0 h-auto text-accent hover:underline">View Details</Button>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming project completions.</p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Recent Projects */}
          <section className="lg:col-span-1">
            <h3 className="text-2xl font-semibold font-headline text-foreground mb-4">Recent Projects</h3>
            <p className="text-sm text-muted-foreground mb-4">Latest project updates and status changes.</p>
            <Card className="shadow-md">
              <CardContent className="pt-6">
                {recentProjectUpdates.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjectUpdates.map(project => {
                      const property = properties.find(p => p.id === project.propertyId);
                      return(
                        <div key={project.id} className="p-4 border rounded-md hover:bg-muted/50 transition-colors">
                          <h4 className="font-semibold text-foreground">{project.name}</h4>
                           <p className="text-sm text-muted-foreground">
                            Property: {property?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Status: {project.status}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last Update: {project.updates.length > 0 ? new Date(project.updates[project.updates.length - 1].timestamp).toLocaleDateString() : new Date(project.startDate).toLocaleDateString()}
                          </p>
                          {property && (
                            <Link href={`/dashboard/properties/${property.id}#project-${project.id}`} passHref>
                              <Button variant="link" size="sm" className="p-0 h-auto text-accent hover:underline">View Project</Button>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent project updates.</p>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/projects" passHref className="w-full">
                  <Button variant="outline" className="w-full">View All Projects</Button>
                </Link>
              </CardFooter>
            </Card>
          </section>
        </div>

        {/* Detailed Property & Project View - Optional: Show some featured properties or recent ones */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold font-headline text-foreground">Featured Properties</h3>
            <Link href="/dashboard/properties" passHref>
              <Button variant="outline">View All Properties <Eye className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {properties.slice(0,3).map(property => ( 
                <PropertyCard
                  key={property.id}
                  property={property}
                  initialProjects={projects.filter(p => p.propertyId === property.id)}
                  onProjectDataChange={handleProjectDataChange}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No properties to display.</p>
          )}
        </section>
        
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        FTL TAM PPM Published 2025
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}