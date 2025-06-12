'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/dashboard/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Property, Project, ProjectUpdate, ProjectScopeCategory } from '@/types';
import { NewProjectDefaultValues } from '@/types';
import { Loader2, Search, Eye, ListChecks, ClipboardList, CheckCircle2, XCircle, Edit3, Trash2, PlusCircle, Tag } from 'lucide-react';
import ProjectDetailsModal from '@/components/dashboard/ProjectDetailsModal';
import ProjectModal from '@/components/dashboard/EditProjectModal';
import { useToast } from "@/hooks/use-toast";
import { useAuth, ProtectedRoute } from '@/context/AuthContext';

// Import the new data service based on sampleData.ts
import { dataService, type Note, type Document } from '@/lib/dataService';

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
};

function AllProjectsContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin, isLoadingAuth } = useAuth();
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProjectForView, setSelectedProjectForView] = useState<Project | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [projectForForm, setProjectForForm] = useState<Project | Partial<Project> | null>(null);
  const [isProjectFormModalOpen, setIsProjectFormModalOpen] = useState(false);
  const [isNewProjectMode, setIsNewProjectMode] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  useEffect(() => {
    const fetchDataFromSampleData = () => {
      try {
        console.log("Loading data from sampleData...");
        const fetchedProperties = dataService.getProperties();
        const fetchedProjects = dataService.getProjects();
        
        setProperties(fetchedProperties);
        setProjects(fetchedProjects);
        
        console.log("Loaded from sampleData:", {
          properties: fetchedProperties.length,
          projects: fetchedProjects.length
        });
        
        toast({
          title: "Data Loaded",
          description: `Successfully loaded ${fetchedProjects.length} projects and ${fetchedProperties.length} properties from sample data.`,
          variant: "default"
        });
      } catch (error) {
        console.error("Error loading data from sampleData:", error);
        toast({ 
          title: "Error", 
          description: "Failed to load data from sample data.", 
          variant: "destructive" 
        });
      }
      setIsDataInitialized(true);
    };
    
    fetchDataFromSampleData();
  }, [toast]);

  const getPropertyName = useCallback((propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'N/A';
  }, [properties]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) {
      return projects;
    }
    return projects.filter(project => {
      const propertyName = getPropertyName(project.propertyId).toLowerCase();
      const scopeCategoriesString = (project.scopeCategory || []).join(' ').toLowerCase();
      return (
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        propertyName.includes(searchTerm.toLowerCase()) ||
        project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scopeCategoriesString.includes(searchTerm.toLowerCase())
      );
    });
  }, [projects, searchTerm, getPropertyName]);

  const handleNoteAddedToProject = async (projectId: string, newNote: { content: string }) => {
    try {
      // In a real app, this would save to backend
      // For now, just update local state
      const newUpdate: ProjectUpdate = {
        id: `note-${Date.now()}`,
        timestamp: new Date().toISOString(),
        text: newNote.content,
      };

      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === projectId
            ? { ...p, updates: [...p.updates, newUpdate] }
            : p
        )
      );

      // Update the selected project in the view modal if it's the current one
      if (selectedProjectForView && selectedProjectForView.id === projectId) {
        setSelectedProjectForView(prev => prev ? {
          ...prev,
          updates: [...prev.updates, newUpdate]
        } : null);
      }

      toast({
        title: "Note Added",
        description: "Note has been added to the project.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error adding note to project:", error);
      toast({ 
        title: "Error", 
        description: "Failed to add note.", 
        variant: "destructive" 
      });
    }
  };

  const handleAddDocumentToProject = async (projectId: string, newDocument: { name: string; fileUrl: string; description?: string }) => {
    try {
      // In a real app, this would save to backend
      // For now, just update local state
      const newFile = {
        id: `doc-${Date.now()}`,
        name: newDocument.name,
        type: 'document' as const,
        uploadedAt: new Date().toISOString(),
        url: newDocument.fileUrl,
      };

      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === projectId
            ? { ...p, files: [...p.files, newFile] }
            : p
        )
      );

      // Update the selected project in the view modal if it's the current one
      if (selectedProjectForView && selectedProjectForView.id === projectId) {
        setSelectedProjectForView(prev => prev ? {
          ...prev,
          files: [...prev.files, newFile]
        } : null);
      }

      toast({
        title: "Document Added",
        description: "Document has been added to the project.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error adding document to project:", error);
      toast({ 
        title: "Error", 
        description: "Failed to add document.", 
        variant: "destructive" 
      });
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProjectForView(project);
    setIsViewModalOpen(true);
  };

  const handleOpenEditProjectForm = (project: Project) => {
    setProjectForForm(project);
    setIsNewProjectMode(false);
    setIsProjectFormModalOpen(true);
  };

  const handleOpenNewProjectForm = () => {
    setProjectForForm(NewProjectDefaultValues);
    setIsNewProjectMode(true);
    setIsProjectFormModalOpen(true);
  };

  const handleSaveProjectForm = async (savedProject: Project) => {
    if (isNewProjectMode) {
      // Add new project to local state
      const newProject = {
        ...savedProject,
        id: `proj-${Date.now()}`,
        updates: [],
        files: [],
        progressPercentage: 0,
      };
      setProjects(prevProjects => [newProject, ...prevProjects]);
      toast({ 
        title: "Project Added", 
        description: `${savedProject.name} has been successfully added.` 
      });
    } else {
      // Update existing project in local state
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === savedProject.id ? savedProject : p)
      );
      toast({ 
        title: "Project Updated", 
        description: `${savedProject.name} has been successfully updated.` 
      });
    }
    setIsProjectFormModalOpen(false);
    setProjectForForm(null);
  };

  const handleDeleteProjectClick = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
      toast({ 
        title: "Project Deleted", 
        description: `"${projectToDelete.name}" has been deleted.`, 
        variant: "destructive" 
      });
    }
    setIsDeleteAlertOpen(false);
    setProjectToDelete(null);
  };

  if (!isDataInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Loading project data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-5xl font-bold font-headline text-foreground">All Projects</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-card"
                aria-label="Search all projects"
              />
            </div>
            {isAdmin && (
              <Button onClick={handleOpenNewProjectForm} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
              </Button>
            )}
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scope Category</TableHead>
                      <TableHead className="hidden md:table-cell">Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">{project.name}</TableCell>
                        <TableCell>{getPropertyName(project.propertyId)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(project.status)} className="text-xs whitespace-nowrap">
                            {getStatusIcon(project.status)}
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(project.scopeCategory && project.scopeCategory.length > 0) ? (
                              project.scopeCategory.map(scope => (
                                <Badge key={scope} variant={scopeCategoryBadgeVariants[scope as ProjectScopeCategory] || 'secondary'} className="text-xs whitespace-nowrap">
                                  {scope}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="link" size="icon" className="text-accent hover:underline h-8 w-8 p-0" onClick={() => handleViewProject(project)} aria-label={`View project ${project.name}`}>
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
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 bg-card rounded-lg shadow-sm">
            <ListChecks className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Projects Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "No projects match your search criteria." : "There are currently no projects to display."}
            </p>
            {isAdmin && (
              <Button onClick={handleOpenNewProjectForm} variant="outline" className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
              </Button>
            )}
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        FTL TAM PPM Published 2025
      </footer>

      <ProjectDetailsModal
        project={selectedProjectForView}
        propertyName={selectedProjectForView ? getPropertyName(selectedProjectForView.propertyId) : ''}
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedProjectForView(null); }}
        onNoteAdded={(projectId, newUpdate) => handleNoteAddedToProject(projectId, { content: newUpdate.text })}
      />
      
      {isProjectFormModalOpen && isAdmin && (
        <ProjectModal
          project={projectForForm || undefined}
          isNewProject={isNewProjectMode}
          properties={properties}
          isOpen={isProjectFormModalOpen}
          onClose={() => { setIsProjectFormModalOpen(false); setProjectForForm(null); }}
          onSave={handleSaveProjectForm}
        />
      )}
      
      {isAdmin && (
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project
                "{projectToDelete?.name}" from your current session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProject} className={buttonVariants({ variant: "destructive" })}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

export default function AllProjectsPage() {
  return (
    <ProtectedRoute>
      <AllProjectsContent />
    </ProtectedRoute>
  );
}