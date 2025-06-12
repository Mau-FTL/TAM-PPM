'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Project, ProjectFormData, Property, ProjectScopeCategory, ProjectFile, ProjectCategory } from '@/types';
import { ProjectFormSchema, ProjectStatusEnum, NewProjectDefaultValues, ProjectScopeCategoryEnum, ProjectCategoryEnum } from '@/types';
import { formatDateForInput } from '@/lib/utils';
import FileUpload from './FileUpload';
import { Separator } from '@/components/ui/separator';

interface ProjectFormProps {
  project?: Project | Partial<Project>;
  isNewProject: boolean;
  properties?: Property[];
  onSave: (data: Project) => void;
  onCancel: () => void;
}

const allScopeCategories = ProjectScopeCategoryEnum.options;
const allProjectCategories = ProjectCategoryEnum.options;

export default function ProjectForm({ project, isNewProject, properties, onSave, onCancel }: ProjectFormProps) {
  const defaultVals = isNewProject
    ? {
        ...NewProjectDefaultValues,
        propertyId: project?.propertyId || '',
        name: project?.name || NewProjectDefaultValues.name,
        scopeCategory: [],
        projectCategory: NewProjectDefaultValues.projectCategory,
        status: ProjectStatusEnum.Values.Pending, // Updated default status
      }
    : {
        name: project?.name || '',
        startDate: project?.startDate ? formatDateForInput(project.startDate) : '',
        endDate: project?.endDate ? formatDateForInput(project.endDate) : '',
        status: project?.status || ProjectStatusEnum.Values.Pending, // Updated default status
        projectCategory: project?.projectCategory || ProjectCategoryEnum.Values['Minor Project'],
        scopeCategory: project?.scopeCategory || [],
        propertyId: project?.propertyId || '',
      };

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: defaultVals as ProjectFormData,
  });

  const [managedFiles, setManagedFiles] = useState<ProjectFile[]>(project?.files || []);

  useEffect(() => {
    setManagedFiles(project?.files || []);
  }, [project?.files]);

  const handleFileUploadInternal = (file: ProjectFile) => {
    setManagedFiles(prevFiles => [...prevFiles, file]);
  };

  const handleFileDeleteInternal = (fileId: string) => {
    setManagedFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
  };

  const onSubmit = (data: ProjectFormData) => {
    const submittedProject: Project = {
      ...(isNewProject ? {} : project),
      id: isNewProject ? `proj-${Date.now()}-${Math.random().toString(36).substring(2,7)}` : project!.id,
      propertyId: data.propertyId,
      name: data.name,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      status: data.status,
      progressPercentage: isNewProject ? 0 : project?.progressPercentage || 0,
      projectCategory: data.projectCategory,
      scopeCategory: data.scopeCategory || [],
      updates: isNewProject ? [] : project!.updates || [],
      files: managedFiles,
      currentSummary: isNewProject ? '' : project!.currentSummary,
    };
    onSave(submittedProject);
  };

  const currentProjectId = project?.id || 'new-project-files';


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isNewProject && !project?.propertyId && properties && (
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
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
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ? formatDateForInput(field.value) : ''} />
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
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ? formatDateForInput(field.value) : ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {Object.values(ProjectStatusEnum.Values).map((statusValue) => (
                        <SelectItem key={statusValue} value={statusValue}>
                        {statusValue}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

        <FormField
          control={form.control}
          name="projectCategory"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Project Category</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  {allProjectCategories.map((category) => (
                    <FormItem key={category} className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={category} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {category}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormItem>
          <FormLabel>Scope Categories</FormLabel>
           <FormDescription>Select one or more relevant scope categories.</FormDescription>
          <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 pt-1">
            {allScopeCategories.map((scopeItem) => (
              <FormField
                key={scopeItem}
                control={form.control}
                name="scopeCategory"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(scopeItem as ProjectScopeCategory)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            return checked
                              ? field.onChange([...currentValue, scopeItem])
                              : field.onChange(
                                  currentValue.filter(
                                    (value) => value !== scopeItem
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {scopeItem}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>

        <Separator className="my-6" />

        <div>
            <FormLabel className="text-base font-medium">Project Files</FormLabel>
            <FormDescription className="mb-2">Upload and manage files related to this project (e.g., PDFs, images).</FormDescription>
            <FileUpload
                projectId={currentProjectId}
                uploadedFiles={managedFiles}
                onFileUpload={handleFileUploadInternal}
                onFileDelete={handleFileDeleteInternal}
            />
        </div>


        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="destructive" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="success">{isNewProject ? 'Add Project' : 'Save Changes'}</Button>
        </div>
      </form>
    </Form>
  );
}