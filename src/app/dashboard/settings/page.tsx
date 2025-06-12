
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole, AppUser, Property, PropertyFormData, PropertyFeatureEnum, SqlProperty } from "@/types"; // Added SqlProperty
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label"; // Added Label import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; 
import { useRouter } from "next/navigation";
import { getAuth, getIdToken, type User } from 'firebase/auth';
import { app } from '@/lib/firebaseInit';
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from "lucide-react"; 
import AppHeader from "@/components/dashboard/AppHeader";
import { useToast } from "@/hooks/use-toast";
import { properties as initialPropertiesData } from '@/data/properties'; 
import EditPropertyModal from '@/components/dashboard/EditPropertyModal'; 

const firebaseAuth = app ? getAuth(app) : undefined;
const GRAPHQL_ENDPOINT = "https://studio--tam-ppm.us-central1.hosted.app/graphql";

// Helper to determine AI hint from URL (copied from propertyId page)
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

// Helper to parse comma-separated string (copied from propertyId page)
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Property Management State
  const [managedProperties, setManagedProperties] = useState<Property[]>(initialPropertiesData.slice(0, 5).map(p => ({...p, status: 'active' as 'active' | 'disabled'}))); 
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
    const fetchUsers = async () => {
      if (!firebaseAuth || !user) {
        setFetchError("User not authenticated or Firebase Auth not initialized.");
        return;
      }
      setFetchError(null);

      try {
        const idToken = await getIdToken(user as User);
        const response = await fetch(`${firebaseAuth.app.options.databaseURL}/users.json?auth=${idToken}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
          console.error("Firebase error response:", errorData);
          throw new Error(`HTTP error! status: ${response.status}. Message: ${errorData.error || 'Unknown error'}`);
        }
        const data = await response.json();
        if (data) {
          const fetchedUsers: AppUser[] = Object.keys(data).map(key => ({
            id: key,
            email: data[key].email,
            name: data[key].email.split('@')[0], 
            role: data[key].role as UserRole,
          }));
          setUsers(fetchedUsers);
          setInitialUsers(JSON.parse(JSON.stringify(fetchedUsers)));
        } else {
          setUsers([]);
          setInitialUsers([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch users:", error);
        setFetchError(error.message || "An unexpected error occurred while fetching users.");
        toast({ title: "Fetch Error", description: error.message || "Could not fetch users.", variant: "destructive" });
      }
    };

    if (isAdmin && user) {
      fetchUsers();
    }
  }, [isAdmin, user, toast]);

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
    if (!firebaseAuth || !user) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    if (!hasChanges) {
      toast({ title: "No Changes", description: "There are no changes to save.", variant: "default" });
      return;
    }
    setIsSaving(true);
    try {
      const idToken = await getIdToken(user as User);
      const updates: { [key: string]: any } = {};
      users.forEach(appUser => {
        const initialRole = initialUsers.find(u => u.id === appUser.id)?.role;
        if (initialRole !== appUser.role) {
          updates[`/users/${appUser.id}/role`] = appUser.role;
        }
      });
      if (Object.keys(updates).length === 0) {
         toast({ title: "No Effective Changes", description: "No roles were modified.", variant: "default" });
         setIsSaving(false);
         setInitialUsers(JSON.parse(JSON.stringify(users)));
         return;
      }
      const response = await fetch(`${firebaseAuth.app.options.databaseURL}/.json?auth=${idToken}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        throw new Error(`HTTP error! status: ${response.status}. Message: ${errorData.error || 'Unknown error'}`);
      }
      setInitialUsers(JSON.parse(JSON.stringify(users))); // Update initial state on successful save
      setHasChanges(false); // Reset hasChanges flag
      toast({ title: "Success", description: "User roles saved successfully to Firebase." });
    } catch (error: any) {
      console.error("Failed to save user settings:", error);
      toast({ title: "Save Failed", description: error.message || "Could not save user settings.", variant: "destructive" });
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
    toast({ title: "Status Updated", description: "Property status toggled (client-side).", variant: "default" });
  };

  const handleDeletePropertyClick = (property: Property) => {
    setPropertyToDelete(property);
    setIsDeletePropertyAlertOpen(true);
  };

  const confirmDeleteProperty = () => {
    if (propertyToDelete) {
      setManagedProperties(prev => prev.filter(p => p.id !== propertyToDelete!.id));
      // TODO: Add GraphQL mutation to delete property from backend
      toast({ title: "Property Deleted", description: `"${propertyToDelete.name}" deleted (client-side).`, variant: "destructive" });
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
    if (!firebaseAuth || !user) {
      toast({ title: "Authentication Error", description: "You must be logged in to add a property.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true); // Indicate loading state
    let idToken;
    try {
      idToken = await getIdToken(user as User);
    } catch (error) {
      console.error("Error getting ID token:", error);
      toast({ title: "Authentication Error", description: "Could not verify user session. Please try again.", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const mutation = `
      mutation CreateNewProperty($name: String!, $address: String!) {
        property_insert(data: {name: $name, address: $address}) {
          id # Or a more suitable unique identifier from your backend
          name
          address
          # Add other fields you expect back from the mutation
        }
      }
    `;

    const variables = {
      name: formData.name,
      address: formData.address,
      // Include other relevant fields from formData if your mutation accepts them
    };

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.errors) {
        console.error("GraphQL Error:", result.errors);
        const errorMessage = result.errors?.[0]?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const createdPropertyData = result.data?.property_insert;

      if (!createdPropertyData || !createdPropertyData.id) {
          console.error("GraphQL response missing property data or ID:", result.data);
          throw new Error("Failed to create property: No ID returned from server.");
      }

      // TODO: The server should ideally return the full SqlProperty object.
      // For now, we construct a client-side version for the UI.
      // This will need to be aligned with the actual SqlProperty type if you display more fields.
      const newPropertyForClientState: Property = {
        id: createdPropertyData.id, // Use ID from server
        name: createdPropertyData.name,
        address: createdPropertyData.address,
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
        evChargersCount: 0, // Not in form, default to 0
        bikeFacilities: parseCommaSeparatedString(formData.bikeFacilitiesInput),
        surfaceCondition: formData.surfaceCondition || 'N/A',
        surfaceType: formData.surfaceType || 'N/A',
        clearanceRequirements: formData.clearanceRequirements || 'N/A',
        entryPoints: formData.entryPoints || 0,
        exitPoints: formData.exitPoints || 0,
        paymentSystems: parseCommaSeparatedString(formData.paymentSystemsInput),
        totalMeters: formData.totalMeters || 0,
        // @ts-ignore status is added for client-side management here
        status: 'active', 
      };

      setManagedProperties(prev => [newPropertyForClientState, ...prev]);
      toast({ title: "Property Added", description: `"${newPropertyForClientState.name}" added successfully via GraphQL.` });
      handleClosePropertyModal();

    } catch (error: any) {
      console.error("Failed to save property via GraphQL:", error);
      toast({ title: "Save Failed", description: error.message || "Could not save property to the server.", variant: "destructive" });
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
          {fetchError && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive border border-destructive rounded-md">
              <p className="font-semibold">Error Fetching Users:</p>
              <p>{fetchError}</p>
            </div>
          )}
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
          {users.length === 0 && !fetchError && !isLoadingAuth && (
            <p className="text-muted-foreground mt-4 text-center">No users found or yet to be loaded.</p>
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managedProperties.map((prop) => (
                    <TableRow key={prop.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">{prop.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                           {/* @ts-ignore status is valid here for client side */}
                          <Switch
                            checked={prop.status === 'active'}
                            onCheckedChange={() => handleTogglePropertyStatus(prop.id)}
                            id={`status-${prop.id}`}
                            aria-label={`Toggle status for ${prop.name}`}
                            disabled={isSaving}
                          />
                           {/* @ts-ignore status is valid here for client side */}
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
                This action cannot be undone. This will remove the property "{propertyToDelete?.name}" from the list (client-side).
                Real deletion from the server requires a separate GraphQL call.
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

