
'use client';

import { useState, useEffect } from 'react';
import type { Project, ProjectFile, ProjectUpdate, ProjectScopeCategory } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building, CalendarDays, CheckCircle2, ClipboardList, FileText, Info, ListChecks, Loader2, MessageSquare, Paperclip, Tag, XCircle, ImageIcon, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ProjectDetailsModalProps {
  project: Project | null;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded: (projectId: string, newUpdate: ProjectUpdate) => void;
}

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

const getFileIcon = (type: ProjectFile['type']) => {
  const iconProps = { className: "h-5 w-5 text-muted-foreground mr-2" };
  switch (type) {
    case 'document':
      return <FileText {...iconProps} />;
    case 'image':
      return <ImageIcon {...iconProps} />;
    default:
      return <Paperclip {...iconProps} />;
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


export default function ProjectDetailsModal({ project: initialProject, propertyName, isOpen, onClose, onNoteAdded }: ProjectDetailsModalProps) {
  const { toast } = useToast();
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewNoteText('');
    }
  }, [initialProject, isOpen]);

  if (!initialProject) {
    return null;
  }

  const handleAddNote = () => {
    if (!newNoteText.trim()) {
      toast({ title: "Cannot add empty note", variant: "destructive", description: "Please enter some text for the note." });
      return;
    }
    if (!initialProject) return;

    setIsAddingNote(true);
    const newUpdateEntry: ProjectUpdate = {
      id: `update-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      text: newNoteText.trim(),
    };

    setTimeout(() => {
      onNoteAdded(initialProject.id, newUpdateEntry);
      setNewNoteText('');
      toast({ title: "Note Added", description: "New project note has been recorded." });
      setIsAddingNote(false);
    }, 500);
  };

  const handleFileViewClick = (file: ProjectFile) => {
    if (file.url) {
      const newWindow = window.open(file.url, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Pop-up likely blocked
        toast({
          title: "File Preview Blocked",
          description: `Your browser might have blocked the pop-up for ${file.name}. Please check your pop-up blocker settings.`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "File URL Missing",
        description: `Cannot open ${file.name} as its URL is not available.`,
        variant: "destructive",
      });
    }
  };


  const lastUpdated = initialProject.updates.length > 0
    ? new Date(initialProject.updates[initialProject.updates.length - 1].timestamp).toLocaleDateString()
    : new Date(initialProject.startDate).toLocaleDateString();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">{initialProject.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4 pr-6 -mr-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 py-4">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-1">
                  <Building className="h-4 w-4 mr-2 text-accent" /> Property
                </h4>
                <p className="text-foreground">{propertyName}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-1">
                  <Info className="h-4 w-4 mr-2 text-accent" /> Status
                </h4>
                <Badge variant={getStatusBadgeVariant(initialProject.status)} className="text-xs whitespace-nowrap">
                  {getStatusIcon(initialProject.status)}
                  {initialProject.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-1">
                  <CalendarDays className="h-4 w-4 mr-2 text-accent" /> Time of Completion (End Date)
                </h4>
                <p className="text-foreground">{new Date(initialProject.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-1">
                  <CalendarDays className="h-4 w-4 mr-2 text-accent" /> Last Updated
                </h4>
                <p className="text-foreground">{lastUpdated}</p>
              </div>
              <div>
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-1">
                  <Tag className="h-4 w-4 mr-2 text-accent" /> Project Category
                  </h4>
                  <p className="text-foreground">{initialProject.projectCategory || 'N/A'}</p>
              </div>
              <div>
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-1">
                      <Tag className="h-4 w-4 mr-2 text-accent" /> Scope Category
                  </h4>
                  {initialProject.scopeCategory && initialProject.scopeCategory.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                      {initialProject.scopeCategory.map(scope => (
                          <Badge key={scope} variant={scopeCategoryBadgeVariants[scope] || 'secondary'} className="text-xs">{scope}</Badge>
                      ))}
                      </div>
                  ) : (
                      <p className="text-foreground">N/A</p>
                  )}
              </div>

              <Separator />

              {/* Documents */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-2">
                  <Paperclip className="h-4 w-4 mr-2 text-accent" /> Documents
                </h4>
                {initialProject.files.length > 0 ? (
                  <ul className="space-y-2">
                    {initialProject.files.map((file: ProjectFile) => (
                      <li key={file.id} className="flex items-center text-sm p-2 border rounded-md bg-muted/50 hover:bg-muted/80">
                        {getFileIcon(file.type)}
                        <span className="text-foreground flex-grow truncate" title={file.name}>{file.name}</span>
                        {file.size && <span className="text-xs text-muted-foreground ml-2">({file.size})</span>}
                        <Button
                            variant="link"
                            size="sm"
                            className="ml-2 p-0 h-auto text-accent hover:underline"
                            onClick={() => handleFileViewClick(file)}
                        >
                            View
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents attached to this project.</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Notes */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-2">
                  <MessageSquare className="h-4 w-4 mr-2 text-accent" /> Notes (Updates)
                </h4>
                 {/* ADD NEW NOTE FORM */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor={`new-note-modal-${initialProject.id}`}>Add New Note</Label>
                  <Textarea
                    id={`new-note-modal-${initialProject.id}`}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Describe recent activity or progress..."
                    className="min-h-[60px]"
                    disabled={isAddingNote}
                  />
                  <Button onClick={handleAddNote} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/80" disabled={isAddingNote}>
                    {isAddingNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {isAddingNote ? 'Adding Note...' : 'Add Note'}
                  </Button>
                </div>
                {/* ACTUAL LIST OF NOTES */}
                {initialProject.updates.length > 0 ? (
                   <ScrollArea className="h-[30vh] pr-4">
                    <div className="space-y-3">
                      {initialProject.updates.slice().reverse().map((update: ProjectUpdate) => (
                        <div key={update.id} className="text-sm p-2 border-l-2 border-accent bg-muted/50 rounded-r-md">
                          <p className="text-foreground">{update.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(update.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes or updates for this project.</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
