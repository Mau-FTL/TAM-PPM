'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/dashboard/AppHeader';
import PropertyCard from '@/components/dashboard/PropertyCard';
import { Input } from '@/components/ui/input';
import { projects as initialProjectsData } from '@/data/projects';
import type { Property, Project } from '@/types';
import { Loader2, Search, MapPin, AlertTriangle } from 'lucide-react';
import { useAuth, ProtectedRoute } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";

// Import the new data service based on sampleData.ts
import { dataService } from '@/lib/dataService';

function PropertiesContent() {
  const router = useRouter();
  const { user, isAdmin, isLoadingAuth } = useAuth();
  const { toast } = useToast();
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>(initialProjectsData); // Keep projects from mock for now
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertiesFromSampleData = () => {
      if (!user) { 
        setIsDataInitialized(true);
        return;
      }

      setIsDataInitialized(false);
      setFetchError(null);

      try {
        console.log("Loading properties from sampleData...");
        const fetchedProperties = dataService.getProperties();
        setProperties(fetchedProperties);
        console.log("Loaded properties from sampleData:", fetchedProperties.length);
        
        if (fetchedProperties.length === 0) {
          toast({
            title: "No Properties Found",
            description: "No properties were found in the sample data.",
            variant: "default"
          });
        } else {
          toast({
            title: "Properties Loaded",
            description: `Successfully loaded ${fetchedProperties.length} properties from sample data.`,
            variant: "default"
          });
        }
      } catch (error: any) {
        console.error("Error loading properties from sampleData:", error);
        setFetchError(error.message || "Failed to load properties from sample data.");
        toast({
          title: "Error Loading Properties",
          description: error.message || "Could not load properties.",
          variant: "destructive",
        });
      } finally {
        setIsDataInitialized(true);
      }
    };

    if (!isLoadingAuth) { 
      fetchPropertiesFromSampleData();
    }
  }, [isLoadingAuth, user, toast]);

  const handleProjectDataChange = (propertyId: string, updatedProjects: Project[]) => {
    setProjects(prevProjects => {
      const otherProjects = prevProjects.filter(p => p.propertyId !== propertyId);
      return [...otherProjects, ...updatedProjects];
    });
  };

  const filteredProperties = useMemo(() => {
    if (!searchTerm) {
      return properties;
    }
    return properties.filter(property =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.address && property.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [properties, searchTerm]);

  const isLoading = isLoadingAuth || !isDataInitialized;

  if (isLoading) { 
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <AppHeader />
        <main className="flex-grow container mx-auto flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
          <p className="text-lg font-medium">Loading properties data...</p>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-5xl font-bold font-headline text-foreground">Parking Portfolio</h2>
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search parking locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-card"
              aria-label="Search parking locations"
            />
          </div>
        </div>
        
        {fetchError && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3" />
            <div>
              <p className="font-semibold">Error Loading Properties:</p>
              <p>{fetchError}</p>
            </div>
          </div>
        )}

        {!fetchError && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                initialProjects={projects.filter(p => p.propertyId === property.id)}
                onProjectDataChange={handleProjectDataChange}
              />
            ))}
          </div>
        ) : (
          !fetchError && (
            <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg shadow-sm">
              <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? "No Matches Found" : "No Parking Locations Found"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No locations match your search criteria." 
                  : "No properties were found in the sample data."}
              </p>
            </div>
          )
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        FTL TAM PPM Published 2025
      </footer>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <ProtectedRoute>
      <PropertiesContent />
    </ProtectedRoute>
  );
}