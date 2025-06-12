
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Project, Property } from '@/types';
import ProjectForm from './EditProjectForm'; // Renamed for clarity, handles both edit and add

interface ProjectModalProps {
  project?: Project | Partial<Project>; // For editing existing or pre-filling new
  isNewProject: boolean;
  properties?: Property[]; // For property selection if isNewProject and no project.propertyId
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedProject: Project) => void;
}

export default function ProjectModal({ project, isNewProject, properties, isOpen, onClose, onSave }: ProjectModalProps) {
  if (!isOpen) { // Ensure modal doesn't render if not open, even if project is briefly null
    return null;
  }
  
  const dialogTitle = isNewProject ? "Add New Project" : `Edit Project: ${project?.name || 'Project'}`;
  const dialogDescription = isNewProject 
    ? "Fill in the details below to create a new project."
    : "Modify the details of your project below.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4 pr-6 -mr-6">
          <ProjectForm 
            project={project} 
            isNewProject={isNewProject}
            properties={properties}
            onSave={onSave} 
            onCancel={onClose} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

