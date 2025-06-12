
'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectFile, ProjectUpdate } from '@/types';
import { ProjectStatusEnum } from '@/types';
import { CalendarDays, CheckCircle2, ClipboardList, ListChecks, Loader2, Send, XCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import { differenceInDays, formatDistanceToNowStrict, isPast, isToday, isValid, parseISO, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectInfoProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
  showFileManagement?: boolean;
  allowAddingNotes?: boolean; 
}

const statusColors: Record<Project['status'], BadgeProps['variant']> = {
  [ProjectStatusEnum.Values.Pending]: "pastel-blue",
  [ProjectStatusEnum.Values['In Progress']]: "pastel-yellow",
  [ProjectStatusEnum.Values['On Hold']]: "pastel-pink",
  [ProjectStatusEnum.Values.Completed]: "pastel-green",
  [ProjectStatusEnum.Values.Cancelled]: "destructive",
};

const getStatusIcon = (status: Project['status']) => {
  const iconProps = { className: "mr-2 h-4 w-4" };
  switch (status) {
    case ProjectStatusEnum.Values.Pending: return <ClipboardList {...iconProps} />;
    case ProjectStatusEnum.Values['In Progress']: return <Loader2 {...iconProps} className={`${iconProps.className} animate-spin`} />;
    case ProjectStatusEnum.Values.Completed: return <CheckCircle2 {...iconProps} />;
    case ProjectStatusEnum.Values['On Hold']: return <XCircle {...iconProps} />;
    case ProjectStatusEnum.Values.Cancelled: return <XCircle {...iconProps} />;
    default: return <ListChecks {...iconProps} />;
  }
}

const getCompletionText = (endDateISO: string, status: Project['status']): string => {
  if (status === 'Completed') {
    return 'Completed';
  }
  if (status === 'Cancelled') {
    return ''; 
  }

  const endDate = parseISO(endDateISO);
  if (!isValid(endDate)) {
    return 'Invalid end date';
  }

  const today = startOfToday(); 
  const daysDiff = differenceInDays(endDate, today); 

  if (status === 'In Progress') {
    if (daysDiff < 0) { 
      const daysOverdue = Math.abs(daysDiff);
      return `Overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}`;
    }
    if (daysDiff === 0) { 
      return 'Due today';
    }
    return `Due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
  }
  
  // For 'Pending' and 'On Hold' statuses if not due today or past.
  if (isToday(endDate)) { 
    return 'Completes today';
  }
  if (isPast(endDate)) { 
    return `Ended ${formatDistanceToNowStrict(endDate, { addSuffix: true, unit: 'day' })}`;
  }
  return `Completes in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
};


export default function ProjectInfo({ project: initialProject, onProjectUpdate, showFileManagement = true, allowAddingNotes = true }: ProjectInfoProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();

  const handleAddNote = () => {
    if (!newNoteText.trim()) {
      toast({ title: "Cannot add empty note", variant: "destructive" });
      return;
    }
    setIsAddingNote(true);
    const newUpdateEntry: ProjectUpdate = { 
      id: `update-${Date.now()}`, 
      timestamp: new Date().toISOString(),
      text: newNoteText.trim(),
    };
    setTimeout(() => {
      const updatedProject = { ...project, updates: [...project.updates, newUpdateEntry] };
      setProject(updatedProject);
      onProjectUpdate(updatedProject); 
      setNewNoteText('');
      toast({ title: "Note Added", description: "New project note has been recorded." });
      setIsAddingNote(false);
    }, 500);
  };

  const handleFileUpload = (file: ProjectFile) => {
    const updatedProject = { ...project, files: [...project.files, file] };
    setProject(updatedProject);
    onProjectUpdate(updatedProject);
    toast({ title: "File Uploaded", description: `${file.name} has been added to the project.` });
  };

  const handleFileDelete = (fileId: string) => {
    const updatedFiles = project.files.filter(f => f.id !== fileId);
    const updatedProject = { ...project, files: updatedFiles };
    setProject(updatedProject);
    onProjectUpdate(updatedProject);
    toast({ title: "File Deleted", description: `File has been removed from the project.` });
  };
  
  const completionText = getCompletionText(project.endDate, project.status);
  const latestUpdate = project.updates.length > 0 ? project.updates.slice().reverse()[0] : null;

  return (
    <div className="mt-4 space-y-4 p-4 border border-border rounded-lg bg-card shadow-sm">
      <h3 className="text-xl font-semibold font-headline text-foreground">{project.name}</h3>
      
      <div className="flex items-center space-x-2">
        <Badge variant={statusColors[project.status]}>
          {getStatusIcon(project.status)}
          {project.status}
        </Badge>
        {project.status !== 'Cancelled' && completionText && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-1.5 h-4 w-4" />
            <span>{completionText}</span>
          </div>
        )}
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="notes" className={cn({'border-b-0': !allowAddingNotes && !showFileManagement})}>
          <AccordionTrigger className="text-md font-medium">
            {allowAddingNotes ? "Notes" : "Latest Note"}
          </AccordionTrigger>
          <AccordionContent>
            {allowAddingNotes ? (
              <>
                {project.updates.length > 0 ? (
                  <ScrollArea className="h-60 pr-4">
                    <ul className="space-y-3">
                      {project.updates.slice().reverse().map(update => (
                        <li key={update.id} className="text-sm p-2 border-l-2 border-accent bg-secondary/30 rounded-r-md animate-subtle-slide-up">
                          <p className="text-foreground">{update.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(update.timestamp).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                )}
                <div className="mt-4 space-y-2">
                  <Label htmlFor={`new-note-${project.id}`}>Add New Note</Label>
                  <Textarea 
                    id={`new-note-${project.id}`}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Describe recent activity or progress..."
                    className="min-h-[60px]"
                  />
                  <Button onClick={handleAddNote} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/80" disabled={isAddingNote}>
                     {isAddingNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {isAddingNote ? 'Adding Note...' : 'Add Note'}
                  </Button>
                </div>
              </>
            ) : (
              latestUpdate ? (
                <div className="text-sm p-2 border-l-2 border-accent bg-secondary/30 rounded-r-md">
                  <p className="text-foreground">{latestUpdate.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(latestUpdate.timestamp).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              )
            )}
          </AccordionContent>
        </AccordionItem>

        {showFileManagement && (
          <AccordionItem value="files">
            <AccordionTrigger className="text-md font-medium">Project Files</AccordionTrigger>
            <AccordionContent>
              <FileUpload 
                projectId={project.id} 
                uploadedFiles={project.files}
                onFileUpload={handleFileUpload}
                onFileDelete={handleFileDelete}
              />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}

