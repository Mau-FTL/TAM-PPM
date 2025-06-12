
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Property, PropertyFormData } from '@/types';
import EditPropertyForm from './EditPropertyForm';

interface EditPropertyModalProps {
  property: Property | null; // Changed to allow null for "add new" mode
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPropertyData: PropertyFormData) => void;
}

export default function EditPropertyModal({ property, isOpen, onClose, onSave }: EditPropertyModalProps) {
  if (!isOpen) { // Do not render if not open, even if property is briefly null during state change
    return null;
  }
  
  const isNewProperty = !property || !property.id; // Determine if it's for adding a new property

  const dialogTitle = isNewProperty ? "Add New Property" : `Edit Property: ${property?.name || 'Property'}`;
  const dialogDescription = isNewProperty 
    ? "Fill in the details below to create a new property."
    : "Modify the details of the property below.";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4 pr-6 -mr-6">
          {/* Pass the potentially null property to the form; form handles defaults */}
          <EditPropertyForm 
            property={property || {} as Property} // Pass empty object if null for form init
            onSave={onSave} 
            onCancel={onClose} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
