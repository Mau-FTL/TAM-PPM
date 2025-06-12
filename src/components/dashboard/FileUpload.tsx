
'use client';

import { useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText, Image as ImageIcon, Paperclip, Trash2 } from 'lucide-react';
import type { ProjectFile } from '@/types';
import { uploadFile, deleteFile } from '@/lib/storageService';

interface FileUploadProps {
  projectId: string;
  uploadedFiles: ProjectFile[];
  onFileUpload: (file: ProjectFile) => void;
  onFileDelete: (fileId: string) => void;
}

const getFileIcon = (type: ProjectFile['type']) => {
  switch (type) {
    case 'document':
      return <FileText className="h-5 w-5 text-muted-foreground" />;
    case 'image':
      return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
    default:
      return <Paperclip className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function FileUpload({ projectId, uploadedFiles, onFileUpload, onFileDelete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track which file is being deleted

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const processUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    const storagePath = `documents/${projectId}/${Date.now()}-${selectedFile.name}`; // Unique path

    try {
      const downloadUrl = await uploadFile(selectedFile, storagePath);

      const newFile: ProjectFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Still generate a local ID
        name: selectedFile.name,
        type: selectedFile.type.startsWith('image/') ? 'image' : (selectedFile.type === 'application/pdf' ? 'document' : 'other'),
        uploadedAt: new Date().toISOString(),
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        url: downloadUrl, // Use the download URL
        storagePath: storagePath, // Store the storage path
      };

      onFileUpload(newFile);
      setSelectedFile(null);
      // Clear the file input visually
      const fileInput = document.getElementById(`file-upload-${projectId}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

    } catch (error) {
      console.error("Error uploading file:", error);
      // You might want to add a toast notification here
    }
    setIsUploading(false);
  };

  const handleDeleteClick = async (file: ProjectFile) => {
    if (!file.storagePath) {
      onFileDelete(file.id); // Delete from state if no storage path (e.g., mock file)
      return;
    }
    setIsDeleting(file.id);
    try {
      await deleteFile(file.storagePath);
      onFileDelete(file.id);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
    setIsDeleting(null);
  };

  const handleViewClick = (file: ProjectFile) => {
    if (file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
      window.open(file.url, '_blank');
    } else {
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.write(newTabContent);
        newTab.document.close();
      } else {
        alert(`Mock view for file: ${file.name}. (Pop-up blocked)`);
      }
    }
  };

  return (
    <div className="space-y-4 mt-4 p-4 border rounded-md bg-card/50">
      <h4 className="font-medium text-md">Files:</h4>
      <div className="space-y-3">
        <div>
          <Label htmlFor={`file-upload-${projectId}`} className="sr-only">Choose file</Label>
          <Input
            id={`file-upload-${projectId}`}
            type="file"
            onChange={handleFileChange}
            className="text-sm h-14 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            disabled={isUploading}
          />
        </div>
        <Button 
          type="button"
          variant="info"
          onClick={processUpload}
          disabled={!selectedFile || isUploading} 
          className="w-full sm:w-auto"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">Uploaded Files:</h5>
          <ul className="divide-y divide-border rounded-md border">
            {uploadedFiles.map((file) => (
              <li key={file.id} className="flex items-center justify-between p-3 hover:bg-muted/50 animate-subtle-fade-in">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[150px] sm:max-w-xs" title={file.name}>{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(file.uploadedAt).toLocaleDateString()} {file.size ? `(${file.size})` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="link" size="sm" className="p-0 h-auto text-accent hover:underline" onClick={() => handleViewClick(file)}>
                     View
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onFileDelete(file.id)} aria-label={`Delete ${file.name}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
