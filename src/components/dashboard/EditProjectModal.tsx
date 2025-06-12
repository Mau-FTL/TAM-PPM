'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import EditProjectForm from './EditProjectForm'; // Using the new improved form

interface EditProjectModalProps {
  project?: any | Partial<any>; // From sampleData or new project
  isNewProject: boolean;
  properties?: any[]; // Available properties for selection
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: any) => void;
}

export default function EditProjectModal({ 
  project, 
  isNewProject, 
  properties, 
  isOpen, 
  onClose, 
  onSave 
}: EditProjectModalProps) {
  if (!isOpen) {
    return null;
  }
  
  const dialogTitle = isNewProject ? "Add New Project" : `Edit Project: ${project?.name || 'Project'}`;
  const dialogDescription = isNewProject 
    ? "Fill in the details below to create a new project."
    : "Modify the details of your project below.";

  // Transform form data back to sampleData structure
  const handleSave = (formData: any) => {
    const transformedData = {
      // Generate ID for new projects matching sampleData format
      id: project?.id || `P${Date.now().toString().slice(-4)}`,
      
      // Basic project info
      name: formData.name,
      description: formData.description || '',
      
      // Property reference (sampleData uses 'property' field)
      property: formData.propertyId,
      propertyId: formData.propertyId, // Keep both for compatibility
      
      // Dates in ISO format
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      
      // Status and categories
      status: formData.status,
      projectCategory: formData.projectCategory,
      scopeCategory: formData.scopeCategory, // Single string in sampleData
      
      // Documents array (preserve existing or empty)
      documents: project?.documents || [],
      
      // Additional fields for compatibility with existing components
      updates: project?.updates || [],
      files: project?.files || [],
      progressPercentage: project?.progressPercentage || (formData.status === 'Completed' ? 100 : formData.status === 'In Progress' ? 50 : 0),
      currentSummary: formData.description || ''
    };
    
    onSave(transformedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4 pr-6 -mr-6">
          <EditProjectForm 
            project={project}
            isNewProject={isNewProject}
            properties={properties}
            onSave={handleSave} 
            onCancel={onClose} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}