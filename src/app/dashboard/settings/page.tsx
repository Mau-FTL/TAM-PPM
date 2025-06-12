"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole, AppUser, Property, PropertyFormData } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; 
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from "lucide-react"; 
import AppHeader from "@/components/dashboard/AppHeader";
import { useToast } from "@/hooks/use-toast";
import EditPropertyModal from '@/components/dashboard/EditPropertyModal'; 

// Import the new data service based on sampleData.ts
import { dataService } from '@/lib/dataService';

// Helper to determine AI hint from URL
const getAiHintFromUrl = (url: string | undefined, currentHint: string | undefined): string => {
  if (!url || url.startsWith('https://placehold.co')) { return currentHint || 'property detail image'; }
  try {
    if (url.startsWith('https://firebasestorage.googleapis.com/') || url.includes('.appspot.com/')) {
      return 'firebase storage image';
    }
    const hostname = new URL(url).hostname;
    if (hostname.includes('unsplash')) return 'unsplash image';
    if (hostname.includes('pexels')) return 'pexels image';
    return 'external image';
  } catch { return 'property image'; }
};

// Helper to parse comma-separated string
const parseCommaSeparatedString = (input?: string): string[] => {
  if (!input || typeof input !== 'string') return [];
  return input.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

const SettingsPage = () => {
  const { user, isAdmin, isLoadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<AppUser[]>([]);
  const [initialUsers, setInitialUsers] = useState<AppUser[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  // Property Management State
  const [managedProperties, setManagedProperties] = useState<(Property & { status: 'active' | 'disabled' })[]>([]);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeletePropertyAlertOpen, setIsDeletePropertyAlertOpen] = useState(false);

  // State for Add/Edit Property Modal
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [currentPropertyForModal, setCurrentPropertyForModal] = useState<Property | null>(null); 

  useEffect(() => {
    if (!isLoadingAuth && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isLoadingAuth, isAdmin, router]);

  useEffect(() => {
    const fetchDataFromSampleData = () => {
      try {
        console.log("Loading users and properties from sampleData...");
        
        // Load users from sampleData
        const fetchedUsers: AppUser[] = dataService.getUsers().map(user => ({
          id: user.id,
          email: user.email,
          name: user.email.split('@')[0], // Use email prefix as name
          role: user.role as UserRole,
        }));
        
        // Load properties from sampleData
        const fetchedProperties = dataService.getProperties().map(p => ({
          ...p,
          status: 'active' as 'active' | 'disabled'
        }));

        setUsers(fetchedUsers);
        setInitialUsers(JSON.parse(JSON.stringify(fetchedUsers)));
        setManagedProperties(fetchedProperties);
        
        console.log("Loaded from sampleData:", {
          users: fetchedUsers.length,
          properties: fetchedProperties.length
        });
        
        toast({
          title: "Settings Loaded",
          description: `Loaded ${fetchedUsers.length} users and ${fetchedProperties.length} properties from sample data.`,
          variant: "default"
        });
      } catch (error: any) {
        console.error("Failed to load settings data:", error);
        toast({ 
          title: "Load Error", 
          description: error.message || "Could not load settings data.", 
          variant: "destructive" 
        });
      }
      setIsDataInitialized(true);
    };

    if (isAdmin && user && !isLoadingAuth) {
      fetchDataFromSampleData();
    }
  }, [isAdmin, user, isLoadingAuth, toast]);

  useEffect(() => {
    if (initialUsers.length === 0 && users.length === 0) {
      setHasChanges(false);
      return;
    }
    if (initialUsers.length !== users.length) {
      setHasChanges(true);
      return;
    }
    const initialRolesMap = new Map(initialUsers.map(u => [u.id, u.role]));
    let changed = false;
    for (const currentUser of users) {
      if (initialRolesMap.get(currentUser.id) !== currentUser.role) {
        changed = true;
        break;
      }
    }
    if (!changed && users.length > 0 && initialUsers.length > 0) {
         const currentUserIds = new Set(users.map(u => u.id));
         for (const initialUser of initialUsers) {
             if (!currentUserIds.has(initialUser.id)) {
                 changed = true;
                 break;
             }
         }
    }
    setHasChanges(changed);
  }, [users, initialUsers]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    ));
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) {
      toast({ title: "No Changes", description: "There are no changes to save.", variant: "default" });
      return;
    }
    
    setIsSaving(true);
    
    // Simulate saving to backend
    try {
      // In a real app, this would make API calls to save user role changes
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      setInitialUsers(JSON.parse(JSON.stringify(users))); // Update initial state on successful save
      setHasChanges(false); // Reset hasChanges flag
      
      toast({ 
        title: "Success", 
        description: "User roles saved successfully (simulated save to sample data)." 
      });
    } catch (error: any) {
      console.error("Failed to save user settings:", error);
      toast({ 
        title: "Save Failed", 
        description: error.message || "Could not save user settings.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Property Management Handlers
  const handleTogglePropertyStatus = (propertyId: string) => {
    setManagedProperties(prev =>
      prev.map(p =>
        p.id === propertyId ? { ...p, status: p.status === 'active' ? 'disabled' : 'active' } : p
      )
    );
    toast({ 
      title: "Status Updated", 
      description: "Property status toggled (local state only).", 
      variant: "default" 
    });
  };

  const handleDeletePropertyClick = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeletePropertyAlertOpen(true);
  };

  const confirmDeleteProperty = () => {
    if (propertyToDelete) {
      setManagedProperties(prev => prev.filter(p => p.id !== propertyToDelete!.id));
      toast({ 
        title: "Property Deleted", 
        description: `"${propertyToDelete.name}" deleted from local state.`, 
        variant: "destructive" 
      });
    }
    setIsDeletePropertyAlertOpen(false);
    setPropertyToDelete(null);
  };

  const handleOpenAddPropertyModal = () => {
    setCurrentPropertyForModal(null); 
    setIsPropertyModalOpen(true);
  };

  const handleClosePropertyModal = () => {
    setIsPropertyModalOpen(false);
    setCurrentPropertyForModal(null);
  };

  const handleSaveProperty = async (formData: PropertyFormData) => {
    setIsSaving(true);
    
    try {
      // Simulate saving to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProperty: Property & { status: 'active' | 'disabled' } = {
        id: `prop-${Date.now()}`, // Generate new ID
        name: formData.name,
        address: formData.address,
        description: formData.description,
        features: formData.features || [],
        imageUrl: formData.imageUrl?.trim() || 'https://placehold.co/600x400.png',
        aiHint: getAiHintFromUrl(formData.imageUrl, undefined),
        generalParking: formData.generalParking || 0,
        adaParking: formData.adaParking || 0,
        evParking: formData.evParking || 0,
        cityStaffParking: formData.cityStaffParking || 0,
        lifeguardParking: formData.lifeguardParking || 0,
        otherSpaces: formData.otherSpaces || 0,
        totalParking: (formData.generalParking || 0) + (formData.adaParking || 0) + (formData.evParking || 0) + (formData.cityStaffParking || 0) + (formData.lifeguardParking || 0) + (formData.otherSpaces || 0),
        smallLights: formData.smallLights || 0,
        largeLights: formData.largeLights || 0,
        totalLighting: (formData.smallLights || 0) + (formData.largeLights || 0),
        trafficRegulatorySigns: formData.trafficRegulatorySigns || 0,
        parkingInfoSigns: formData.parkingInfoSigns || 0,
        paymentSigns: formData.paymentSigns || 0,
        wayfindingSigns: formData.wayfindingSigns || 0,
        trafficDirectionSigns: formData.trafficDirectionSigns || 0,
        otherSignage: formData.otherSignage || 0,
        totalSignage: (formData.trafficRegulatorySigns || 0) + (formData.parkingInfoSigns || 0) + (formData.paymentSigns || 0) + (formData.wayfindingSigns || 0) + (formData.trafficDirectionSigns || 0) + (formData.otherSignage || 0),
        securityFeatures: parseCommaSeparatedString(formData.securityFeaturesInput),
        treesCount: formData.treesCount || 0,
        trashCansCount: formData.trashCansCount || 0,
        elevatorsCount: formData.elevatorsCount || 0,
        stairsCount: formData.stairsCount || 0,
        carStopsCount: formData.carStopsCount || 0,
        evChargersCount: 0, // Default
        bikeFacilities: parseCommaSeparatedString(formData.bikeFacilitiesInput),
        surfaceCondition: formData.surfaceCondition || 'N/A',
        surfaceType: formData.surfaceType || 'N/A',
        clearanceRequirements: formData.clearanceRequirements || 'N/A',
        entryPoints: formData.entryPoints || 0,
        exitPoints: formData.exitPoints || 0,
        paymentSystems: parseCommaSeparatedString(formData.paymentSystemsInput),
        totalMeters: formData.totalMeters || 0,
        status: 'active',
      };

      setManagedProperties(prev => [newProperty, ...prev]);
      toast({ 
        title: "Property Added", 
        description: `"${newProperty.name}" added successfully (local state only).` 
      });
      handleClosePropertyModal();

    } catch (error: any) {
      console.error("Failed to save property:", error);
      toast({ 
        title: "Save Failed", 
        description: error.message || "Could not save property.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAuth || (!isAdmin && !isLoadingAuth)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-lg font-medium mt-4">Loading settings or unauthorized...</p>
      </div>
    );
  }

  if (!isDataInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-lg font-medium mt-4">Loading settings data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <h1 className="text-4xl font-bold font-headline text-foreground mb-8">System Settings</h1>
        
        {/* User Settings Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold font-headline text-foreground mb-4">User Role Management</h2>
          <div className="overflow-x-auto bg-card p-6 rounded-lg shadow-md">
            <table className="min-w-full text-card-foreground">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left font-semibold">Email</th>
                  <th className="py-3 px-4 text-left font-semibold">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((appUser) => (
                  <tr key={appUser.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">{appUser.email}</td>
                    <td className="py-3 px-4">
                      <Select
                        value={appUser.role}
                        onValueChange={(value: UserRole) => handleRoleChange(appUser.id, value)}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="w-[180px] bg-background">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="text-muted-foreground mt-4 text-center">No users found in sample data.</p>
          )}
          <div className="mt-6 text-right">
            <Button onClick={handleSaveChanges} variant="success" disabled={!hasChanges || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save User Roles"}
            </Button>
          </div>
        </section>

        {/* Property Management Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold font-headline text-foreground">Property Management</h2>
            <Button variant="outline" onClick={handleOpenAddPropertyModal} disabled={isSaving}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Property
            </Button>
          </div>
          <div className="overflow-x-auto bg-card p-6 rounded-lg shadow-md">
            {managedProperties.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Total Parking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managedProperties.map((prop) => (
                    <TableRow key={prop.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{prop.name}</TableCell>
                      <TableCell className="text-muted-foreground">{prop.address}</TableCell>
                      <TableCell className="text-muted-foreground">{prop.totalParking} spaces</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={prop.status === 'active'}
                            onCheckedChange={() => handleTogglePropertyStatus(prop.id)}
                            id={`status-${prop.id}`}
                            aria-label={`Toggle status for ${prop.name}`}
                            disabled={isSaving}
                          />
                          <Label htmlFor={`status-${prop.id}`} className="text-sm">
                            {prop.status === 'active' ? 'Active' : 'Disabled'}
                          </Label>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="link" size="icon" className="text-destructive hover:underline h-8 w-8 p-0" onClick={() => handleDeletePropertyClick(prop)} aria-label={`Delete property ${prop.name}`} disabled={isSaving}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No properties to manage. Click "Add New Property" to begin.</p>
            )}
          </div>
        </section>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        FTL TAM PPM Published 2025
      </footer>

      {/* Property Modal for Add/Edit */}
      {isPropertyModalOpen && (
        <EditPropertyModal
          property={currentPropertyForModal} 
          isOpen={isPropertyModalOpen}
          onClose={handleClosePropertyModal}
          onSave={handleSaveProperty}
        />
      )}

      {/* Delete Property Confirmation Dialog */}
      {propertyToDelete && (
        <AlertDialog open={isDeletePropertyAlertOpen} onOpenChange={setIsDeletePropertyAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove the property "{propertyToDelete?.name}" from the local state.
                In a real application, this would also remove it from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeletePropertyAlertOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProperty} className={buttonVariants({ variant: "destructive" })}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default SettingsPage;