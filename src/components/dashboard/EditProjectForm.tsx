'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateForInput } from '@/lib/utils';
import { z } from 'zod';

// Import the data service
import { dataService } from '@/lib/dataService';

// Simplified project schema matching sampleData structure
const ProjectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  propertyId: z.string().min(1, "Property selection is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled', 'On Hold']),
  projectCategory: z.enum(['Minor Project', 'Major Project']),
  scopeCategory: z.string().min(1, "Scope category is required"), // Single select in sampleData
});

type ProjectFormData = z.infer<typeof ProjectFormSchema>;

interface ProjectFormProps {
  project?: any; // From sampleData or new
  isNewProject: boolean;
  properties?: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

// Options based on your sampleData structure
const PROJECT_STATUS_OPTIONS = [
  'Pending',
  'In Progress', 
  'Completed',
  'Cancelled',
  'On Hold'
];

const PROJECT_CATEGORY_OPTIONS = [
  'Minor Project',
  'Major Project'
];

const SCOPE_CATEGORY_OPTIONS = [
  'Routine',
  'Cleanup',
  'Inspection', 
  'Installation',
  'Renovation',
  'Repair',
  'Replacement',
  'Survey',
  'Upgrade'
];

export default function ProjectForm({ project, isNewProject, properties, onSave, onCancel }: ProjectFormProps) {
  const [availableProperties, setAvailableProperties] = useState(properties || []);

  // Load properties from dataService if not provided
  useEffect(() => {
    if (!properties || properties.length === 0) {
      try {
        const propertiesFromService = dataService.getProperties();
        setAvailableProperties(propertiesFromService);
      } catch (error) {
        console.error('Error loading properties:', error);
      }
    }
  }, [properties]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      propertyId: project?.property || project?.propertyId || '',
      startDate: project?.startDate ? formatDateForInput(project.startDate) : formatDateForInput(new Date().toISOString()),
      endDate: project?.endDate ? formatDateForInput(project.endDate) : formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
      status: project?.status || 'Pending',
      projectCategory: project?.projectCategory || 'Minor Project',
      scopeCategory: project?.scopeCategory || 'Routine',
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    // Transform data to match expected format
    const transformedData = {
      id: isNewProject ? `P${Date.now().toString().slice(-4)}` : project?.id,
      name: data.name,
      description: data.description,
      property: data.propertyId,
      propertyId: data.propertyId,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      status: data.status,
      projectCategory: data.projectCategory,
      scopeCategory: data.scopeCategory, // Single string in sampleData
      documents: project?.documents || [],
      updates: project?.updates || [],
      files: project?.files || [],
      progressPercentage: project?.progressPercentage || 0,
      currentSummary: data.description,
    };
    
    onSave(transformedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Property Selection - Single select dropdown (required) */}
            {isNewProject && (
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableProperties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name || property.details?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter project description" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status - Single select dropdown (required) */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROJECT_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Category - Single select dropdown (required) */}
            <FormField
              control={form.control}
              name="projectCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROJECT_CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scope Category - Single select dropdown (required) */}
            <FormField
              control={form.control}
              name="scopeCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SCOPE_CATEGORY_OPTIONS.map((scope) => (
                        <SelectItem key={scope} value={scope}>
                          {scope}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            {isNewProject ? 'Create Project' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}