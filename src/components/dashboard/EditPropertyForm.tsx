
'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { Property, PropertyFormData, PropertyFeature } from '@/types';
import { PropertyFormSchema, PropertyFeatureEnum } from '@/types';
import { Building2, Lightbulb, LogIn, LogOut, Recycle, Ruler, Shield, Signpost, Sigma, ToyBrick, TreePine, Bike, CreditCard, Gauge, AlertTriangle, UploadCloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

import { uploadFile } from '@/lib/storageService';
interface EditPropertyFormProps {
  property: Property | Partial<Property>; // Allow partial for new property defaults
  onSave: (data: PropertyFormData) => void;
  onCancel: () => void;
}

const allFeatures = PropertyFeatureEnum.options;
const iconPropsForm = { className: "h-5 w-5 mr-2 inline-block text-accent" };
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];


export default function EditPropertyForm({ property, onSave, onCancel }: EditPropertyFormProps) {
  const { toast } = useToast();
  // Initialize imagePreviewUrl with property's imageUrl or a default placeholder
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(property?.imageUrl || 'https://placehold.co/600x400.png');

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      name: property?.name || '',
      address: property?.address || '',
      features: property?.features || [],
      description: property?.description || '',
      imageUrl: property?.imageUrl || '', // Default to empty if not provided for new
      // Parking Capacity
      generalParking: property?.generalParking || 0,
      adaParking: property?.adaParking || 0,
      evParking: property?.evParking || 0,
      cityStaffParking: property?.cityStaffParking || 0,
      lifeguardParking: property?.lifeguardParking || 0,
      otherSpaces: property?.otherSpaces || 0,
      // Lighting Details
      smallLights: property?.smallLights || 0,
      largeLights: property?.largeLights || 0,
      // Signage Details
      trafficRegulatorySigns: property?.trafficRegulatorySigns || 0,
      parkingInfoSigns: property?.parkingInfoSigns || 0,
      paymentSigns: property?.paymentSigns || 0,
      wayfindingSigns: property?.wayfindingSigns || 0,
      trafficDirectionSigns: property?.trafficDirectionSigns || 0,
      otherSignage: property?.otherSignage || 0,
      // Infrastructure & Amenities
      securityFeaturesInput: (property?.securityFeatures || []).join(', '),
      treesCount: property?.treesCount || 0,
      trashCansCount: property?.trashCansCount || 0,
      elevatorsCount: property?.elevatorsCount || 0,
      stairsCount: property?.stairsCount || 0,
      carStopsCount: property?.carStopsCount || 0,
      // evChargersCount removed
      bikeFacilitiesInput: (property?.bikeFacilities || []).join(', '),
      // Operational Details
      surfaceCondition: property?.surfaceCondition || '',
      surfaceType: property?.surfaceType || '',
      clearanceRequirements: property?.clearanceRequirements || '',
      entryPoints: property?.entryPoints || 0,
      exitPoints: property?.exitPoints || 0,
      paymentSystemsInput: (property?.paymentSystems || []).join(', '),
      totalMeters: property?.totalMeters || 0,
    },
  });

   // Effect to update imagePreviewUrl when form.watch('imageUrl') changes OR when the initial property.imageUrl changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'imageUrl') {
        setImagePreviewUrl(value.imageUrl || 'https://placehold.co/600x400.png');
      }
    });
    // Set initial preview based on property prop, in case it's loaded after form init (though unlikely with modal)
    // Or if the property prop itself is what changes (e.g. modal re-used for different items)
    if (property?.imageUrl && property.imageUrl !== imagePreviewUrl) {
        setImagePreviewUrl(property.imageUrl);
    } else if (!property?.imageUrl && imagePreviewUrl !== 'https://placehold.co/600x400.png') {
        setImagePreviewUrl('https://placehold.co/600x400.png');
    }
    return () => subscription.unsubscribe();
  }, [form, property?.imageUrl]); // watch is stable, property.imageUrl is the key dependency

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const currentInput = event.target; 

    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: `Please select a JPG, JPEG, or PNG image. You selected: ${file.type}`,
      });
      currentInput.value = ''; 
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: `Maximum file size is ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / (1024*1024)).toFixed(2)}MB.`,
      });
      currentInput.value = ''; 
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setImagePreviewUrl(dataUri); 
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Could not read the selected image file for preview.",
      });
    };
    reader.readAsDataURL(file); 

    uploadFile(file, `img/${Date.now()}-${file.name}`) // Add timestamp for uniqueness
      .then(downloadUrl => {
        form.setValue('imageUrl', downloadUrl, { shouldValidate: true, shouldDirty: true });
        toast({
          variant: "success",
          title: "Image Uploaded",
          description: "Property image uploaded successfully.",
        });
      })
      .catch(error => {
        console.error("Error uploading image:", error);
        toast({
          variant: "destructive",
          title: "Image Upload Failed",
          description: "Could not upload the selected image. Please try again.",
        });
        currentInput.value = ''; 
      });
  };

  const onSubmit = (data: PropertyFormData) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Basic Information</h3>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter property name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter property address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Image Upload and Preview */}
        <FormItem>
          <FormLabel>Property Image</FormLabel>
          <div className="mt-2 space-y-4"> 
            <div> 
              <FormControl>
                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={handleImageChange}
                  className="text-sm h-14 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </FormControl>
              <FormDescription className="mt-1">
                Upload a JPG, JPEG, or PNG image (max {MAX_FILE_SIZE_MB}MB).
                <br/> If no file is uploaded, the existing image or a placeholder will be used.
              </FormDescription>
               <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => ( 
                    <FormMessage className="mt-1" />
                )}
                />
            </div>
            {imagePreviewUrl && (
              <div className="relative w-full h-48 md:h-64 rounded-md border overflow-hidden bg-muted">
                <Image
                  src={imagePreviewUrl}
                  alt="Property image preview"
                  layout="fill"
                  objectFit="contain"
                  data-ai-hint="property image preview"
                />
              </div>
            )}
          </div>
        </FormItem>


        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter property description" {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Property Features</FormLabel>
          <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
            {allFeatures.map((featureItem) => (
              <FormField
                key={featureItem}
                control={form.control}
                name="features"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(featureItem)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), featureItem])
                              : field.onChange(
                                  (field.value || []).filter(
                                    (value) => value !== featureItem
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {featureItem}
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
        <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Parking Capacity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField control={form.control} name="generalParking" render={({ field }) => (<FormItem><FormLabel>General Spaces</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="adaParking" render={({ field }) => (<FormItem><FormLabel>ADA Spaces</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="evParking" render={({ field }) => (<FormItem><FormLabel>EV Spaces</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="cityStaffParking" render={({ field }) => (<FormItem><FormLabel>City Staff Spaces</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="lifeguardParking" render={({ field }) => (<FormItem><FormLabel>Lifeguard Spaces</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="otherSpaces" render={({ field }) => (<FormItem><FormLabel>Other Spaces</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        
        <Separator className="my-6" />
        <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center"><Lightbulb {...iconPropsForm} />Lighting Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="smallLights" render={({ field }) => (<FormItem><FormLabel>Small Lights</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="largeLights" render={({ field }) => (<FormItem><FormLabel>Large Lights</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        <Separator className="my-6" />
        <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center"><Signpost {...iconPropsForm} />Signage Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="trafficRegulatorySigns" render={({ field }) => (<FormItem><FormLabel>Traffic Regulatory Signs</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="parkingInfoSigns" render={({ field }) => (<FormItem><FormLabel>Parking Info Signs</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="paymentSigns" render={({ field }) => (<FormItem><FormLabel>Payment System Signs</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="wayfindingSigns" render={({ field }) => (<FormItem><FormLabel>Wayfinding Signs</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="trafficDirectionSigns" render={({ field }) => (<FormItem><FormLabel>Traffic Direction Signs</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="otherSignage" render={({ field }) => (<FormItem><FormLabel>Other Signage Units</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        <Separator className="my-6" />
        <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center"><Building2 {...iconPropsForm} />Infrastructure & Amenities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="securityFeaturesInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><Shield {...iconPropsForm} />Security Features</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Cameras, Security Patrol, Well Lit (comma-separated)" {...field} />
                </FormControl>
                <FormDescription>Enter features separated by commas.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="treesCount" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><TreePine {...iconPropsForm} />Trees Count</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="trashCansCount" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><Recycle {...iconPropsForm} />Trash Cans Count</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="elevatorsCount" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><Sigma {...iconPropsForm} style={{transform: 'rotate(90deg)'}} />Elevators Count</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="stairsCount" render={({ field }) => (<FormItem><FormLabel>Stairs Count</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="carStopsCount" render={({ field }) => (<FormItem><FormLabel>Car Stops Count</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          {/* evChargersCount FormField removed */}
          <FormField
            control={form.control}
            name="bikeFacilitiesInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><Bike {...iconPropsForm} />Bike Facilities</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Racks, Lockers (comma-separated)" {...field} />
                </FormControl>
                <FormDescription>Enter facilities separated by commas.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-6" />
        <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center"><Gauge {...iconPropsForm} />Operational Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="surfaceCondition" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><AlertTriangle {...iconPropsForm} />Surface Condition</FormLabel><FormControl><Input placeholder="e.g., Good, Fair, Needs Repair" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="surfaceType" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><ToyBrick {...iconPropsForm} />Surface Type</FormLabel><FormControl><Input placeholder="e.g., Asphalt, Concrete" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="clearanceRequirements" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><Ruler {...iconPropsForm} />Clearance Requirements</FormLabel><FormControl><Input placeholder="e.g., 7ft, No restrictions" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="entryPoints" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><LogIn {...iconPropsForm} />Entry Points Count</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="exitPoints" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><LogOut {...iconPropsForm} />Exit Points Count</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField
            control={form.control}
            name="paymentSystemsInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><CreditCard {...iconPropsForm} />Payment Systems</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Pay Station, Mobile App (comma-separated)" {...field} />
                </FormControl>
                <FormDescription>Enter systems separated by commas.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="totalMeters" render={({ field }) => (<FormItem><FormLabel>Total Meters</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        <Separator className="my-6" />
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="destructive" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="success">{!property || !property.id ? 'Add Property' : 'Save Changes'}</Button>
        </div>
      </form>
    </Form>
  );
}
