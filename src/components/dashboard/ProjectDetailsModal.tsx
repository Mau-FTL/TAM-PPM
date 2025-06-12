'use client';

import { useState, useEffect } from 'react';
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
  project: any | null; // sampleData project structure
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded: (projectId: string, newUpdate: any) => void;
}

const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
  switch (status) {
    case 'Completed': return "pastel-green";
    case 'In Progress': return "pastel-yellow";
    case 'Pending': return "pastel-blue";
    case 'On Hold': return "pastel-pink";
    case 'Cancelled': return "destructive";
    default: return "outline";
  }
};

const getStatusIcon = (status: string) => {
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

const getFileIcon = (documentType: string) => {
  const iconProps = { className: "h-5 w-5 text-muted-foreground mr-2" };
  switch (documentType?.toUpperCase()) {
    case 'PDF':
      return <FileText {...iconProps} />;
    case 'IMAGE':
    case 'JPG':
    case 'PNG':
      return <ImageIcon {...iconProps} />;
    default:
      return <Paperclip {...iconProps} />;
  }
};

export default function ProjectDetailsModal({ 
  project: initialProject, 
  propertyName, 
  isOpen, 
  onClose, 
  onNoteAdded 
}: ProjectDetailsModalProps) {
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
    const newUpdateEntry = {
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

  const handleFileViewClick = (document: any) => {
    if (document.fileUrl) {
      // Handle actual URLs
      if (document.fileUrl.startsWith('http')) {
        const newWindow = window.open(document.fileUrl, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          toast({
            title: "File Preview Blocked",
            description: `Your browser might have blocked the pop-up for ${document.name}. Please check your pop-up blocker settings.`,
            variant: "destructive",
          });
        }
      } else {
        // Handle mock URLs from sampleData
        toast({
          title: "Demo File",
          description: `This is a demo file: ${document.name}. In a real application, this would open the document.`,
          variant: "default",
        });
      }
    } else {
      toast({
        title: "File URL Missing",
        description: `Cannot open ${document.name} as its URL is not available.`,
        variant: "destructive",
      });
    }
  };

  // Handle both old format (updates array) and sampleData format (notes)
  const projectNotes = initialProject.updates || [];
  const projectDocuments = initialProject.documents || initialProject.files || [];

  const lastUpdated = projectNotes.length > 0
    ? new Date(projectNotes[projectNotes.length - 1].timestamp || projectNotes[projectNotes.length - 1].createdAt).toLocaleDateString()
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
                  <CalendarDays className="h-4 w-4 mr-2 text-accent" /> Project Timeline
                </h4>
                <p className="text-foreground text-sm">
                  <strong>Start:</strong> {new Date(initialProject.startDate).toLocaleDateString()}
                </p>
                {initialProject.endDate && (
                  <p className="text-foreground text-sm">
                    <strong>End:</strong> {new Date(initialProject.endDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-foreground text-sm">
                  <strong>Last Updated:</strong> {lastUpdated}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-1">
                  <Tag className="h-4 w-4 mr-2 text-accent" /> Project Details
                </h4>
                <p className="text-foreground text-sm">
                  <strong>Category:</strong> {initialProject.projectCategory || 'N/A'}
                </p>
                <p className="text-foreground text-sm">
                  <strong>Scope:</strong> {initialProject.scopeCategory || 'N/A'}
                </p>
              </div>

              {initialProject.description && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-1">
                    <Info className="h-4 w-4 mr-2 text-accent" /> Description
                  </h4>
                  <p className="text-foreground text-sm">{initialProject.description}</p>
                </div>
              )}

              <Separator />

              {/* Documents */}
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-2">
                  <Paperclip className="h-4 w-4 mr-2 text-accent" /> Documents
                </h4>
                {projectDocuments.length > 0 ? (
                  <ul className="space-y-2">
                    {projectDocuments.map((document: any) => (
                      <li key={document.id} className="flex items-center text-sm p-2 border rounded-md bg-muted/50 hover:bg-muted/80">
                        {getFileIcon(document.documentType || document.type)}
                        <span className="text-foreground flex-grow truncate" title={document.name}>
                          {document.name}
                        </span>
                        {document.description && (
                          <span className="text-xs text-muted-foreground ml-2" title={document.description}>
                            ({document.description})
                          </span>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="ml-2 p-0 h-auto text-accent hover:underline"
                          onClick={() => handleFileViewClick(document)}
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
                  <MessageSquare className="h-4 w-4 mr-2 text-accent" /> Notes
                </h4>
                
                {/* Add New Note Form */}
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
                
                {/* Actual List of Notes */}
                {projectNotes.length > 0 ? (
                  <ScrollArea className="h-[30vh] pr-4">
                    <div className="space-y-3">
                      {projectNotes.slice().reverse().map((note: any) => (
                        <div key={note.id} className="text-sm p-2 border-l-2 border-accent bg-muted/50 rounded-r-md">
                          <p className="text-foreground">{note.text || note.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(note.timestamp || note.createdAt).toLocaleString()}
                          </p>
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