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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UploadCloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';

// Simplified form schema matching sampleData structure
const PropertyFormSchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
  
  // Property Features (multi-select checkboxes)
  adaParkingAvailable: z.boolean().default(false),
  electricChargingAvailable: z.boolean().default(false),
  roofCovering: z.boolean().default(false),
  sevenFtTallClearance: z.boolean().default(false),
  twentyFourSevenParking: z.boolean().default(false),
  
  // Parking Capacity
  generalParking: z.number().min(0).default(0),
  adaParking: z.number().min(0).default(0),
  evParking: z.number().min(0).default(0),
  cityStaffParking: z.number().min(0).default(0),
  lifeguardParking: z.number().min(0).default(0),
  otherParking: z.number().min(0).default(0),
  
  // Lighting
  smallLights: z.number().min(0).default(0),
  largeLights: z.number().min(0).default(0),
  
  // Infrastructure
  hasElevators: z.boolean().default(false),
  elevatorCount: z.number().min(0).default(0),
  stairs: z.number().min(0).default(0),
  carStops: z.number().min(0).default(0),
  
  // Multi-select arrays
  securityFeatures: z.array(z.string()).default([]),
  bikeFacilities: z.array(z.string()).default([]),
  paymentSystems: z.array(z.string()).default([]),
  
  // Single selects (required)
  surfaceCondition: z.string().min(1, "Surface condition is required"),
  
  // Surface type (multi-select)
  surfaceType: z.array(z.string()).default([]),
  
  // Operational details
  clearanceRequirements: z.string().default(""),
  entrances: z.number().min(0).default(1),
  exits: z.number().min(0).default(1),
  totalMeters: z.number().min(0).default(0),
});

type PropertyFormData = z.infer<typeof PropertyFormSchema>;

interface EditPropertyFormProps {
  property: any; // From sampleData or new
  onSave: (data: PropertyFormData) => void;
  onCancel: () => void;
}

// Options based on your sampleData
const SECURITY_FEATURES_OPTIONS = [
  'Cameras',
  'Well-Lit',
  'Security Patrol',
  'Access Control',
  'Emergency Call Boxes'
];

const BIKE_FACILITIES_OPTIONS = [
  'Bike Rack',
  'Bike Lockers',
  'Covered Bike Storage',
  'Bike Repair Station'
];

const PAYMENT_SYSTEMS_OPTIONS = [
  'Pay Station',
  'Mobile App',
  'Credit Card',
  'Cash',
  'Permit Only'
];

const SURFACE_CONDITION_OPTIONS = [
  'Excellent',
  'Good', 
  'Fair',
  'Needs Repair',
  'Not too bad'
];

const SURFACE_TYPE_OPTIONS = [
  'Asphalt',
  'Concrete',
  'Gravel',
  'Paved Brick',
  'Mixed'
];

export default function EditPropertyForm({ property, onSave, onCancel }: EditPropertyFormProps) {
  const { toast } = useToast();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    property?.details?.imgURL || property?.imageUrl || 'https://placehold.co/600x400.png'
  );

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues: {
      // Basic info
      name: property?.details?.name || property?.name || '',
      address: property?.details?.address || property?.address || '',
      description: property?.details?.description || property?.description || '',
      imageUrl: property?.details?.imgURL || property?.imageUrl || '',
      
      // Property features from sampleData structure
      adaParkingAvailable: property?.propertyFeatures?.adaParkingAvailable || false,
      electricChargingAvailable: property?.propertyFeatures?.electricChargingAvailable || false,
      roofCovering: property?.propertyFeatures?.roofCovering || false,
      sevenFtTallClearance: property?.propertyFeatures?.sevenFtTallClearance || false,
      twentyFourSevenParking: property?.propertyFeatures?.twentyFourSevenParking || false,
      
      // Parking capacity
      generalParking: property?.parkingCapacity?.totalParking?.generalParking || 0,
      adaParking: property?.parkingCapacity?.totalParking?.adaParking || 0,
      evParking: property?.parkingCapacity?.totalParking?.evParking || 0,
      cityStaffParking: property?.parkingCapacity?.totalParking?.cityStaffParking || 0,
      lifeguardParking: property?.parkingCapacity?.totalParking?.lifeguardParking || 0,
      otherParking: property?.parkingCapacity?.totalParking?.otherParking || 0,
      
      // Lighting
      smallLights: property?.lighting?.totalLighting?.smallLights || 0,
      largeLights: property?.lighting?.totalLighting?.largeLights || 0,
      
      // Infrastructure
      hasElevators: property?.infrastructureAmenities?.hasElevators || false,
      elevatorCount: property?.infrastructureAmenities?.elevatorCount || 0,
      stairs: property?.infrastructureAmenities?.stairs || 0,
      carStops: property?.infrastructureAmenities?.carStops || 0,
      
      // Arrays
      securityFeatures: property?.infrastructureAmenities?.securityFeatures || [],
      bikeFacilities: property?.infrastructureAmenities?.bikeFacilities || [],
      paymentSystems: property?.operationalDetails?.paymentSystems || [],
      surfaceType: property?.operationalDetails?.surfaceType || [],
      
      // Single selects
      surfaceCondition: property?.operationalDetails?.surfaceCondition || '',
      
      // Operational
      clearanceRequirements: property?.operationalDetails?.clearanceRequirements || '',
      entrances: property?.operationalDetails?.accessPoints?.entrances || 1,
      exits: property?.operationalDetails?.accessPoints?.exits || 1,
      totalMeters: property?.operationalDetails?.totalMeters || 0,
    },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setImagePreviewUrl(dataUri);
      form.setValue('imageUrl', dataUri);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: PropertyFormData) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name *</FormLabel>
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
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter property address" {...field} />
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter property description" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <FormItem>
              <FormLabel>Property Image</FormLabel>
              <div className="space-y-4">
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </FormControl>
                {imagePreviewUrl && (
                  <div className="relative w-full h-48 rounded-md border overflow-hidden bg-muted">
                    <Image
                      src={imagePreviewUrl}
                      alt="Property preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </FormItem>
          </CardContent>
        </Card>

        {/* Property Features */}
        <Card>
          <CardHeader>
            <CardTitle>Property Features</CardTitle>
            <FormDescription>Select all features that apply to this property</FormDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adaParkingAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">ADA Parking Available</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="electricChargingAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Electric Charging Available</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="roofCovering"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Roof Covering</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sevenFtTallClearance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">7ft+ Tall Clearance</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="twentyFourSevenParking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">24/7 Parking</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Parking Capacity */}
        <Card>
          <CardHeader>
            <CardTitle>Parking Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="generalParking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Parking</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="adaParking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ADA Parking</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="evParking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EV Parking</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cityStaffParking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City Staff Parking</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lifeguardParking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lifeguard Parking</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="otherParking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Parking</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure & Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure & Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Security Features - Multi-select checkboxes */}
            <FormItem>
              <FormLabel>Security Features</FormLabel>
              <FormDescription>Select all security features available</FormDescription>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SECURITY_FEATURES_OPTIONS.map((feature) => (
                  <FormField
                    key={feature}
                    control={form.control}
                    name="securityFeatures"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(feature)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, feature]);
                              } else {
                                field.onChange(currentValue.filter(v => v !== feature));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{feature}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormItem>

            {/* Surface Condition - Single select dropdown (required) */}
            <FormField
              control={form.control}
              name="surfaceCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surface Condition *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select surface condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SURFACE_CONDITION_OPTIONS.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Surface Type - Multi-select checkboxes */}
            <FormItem>
              <FormLabel>Surface Type</FormLabel>
              <FormDescription>Select all surface types that apply</FormDescription>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {SURFACE_TYPE_OPTIONS.map((type) => (
                  <FormField
                    key={type}
                    control={form.control}
                    name="surfaceType"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(type)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, type]);
                              } else {
                                field.onChange(currentValue.filter(v => v !== type));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{type}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormItem>

            {/* Elevators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hasElevators"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Has Elevators</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="elevatorCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Elevators</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Systems - Multi-select checkboxes */}
            <FormItem>
              <FormLabel>Payment Systems</FormLabel>
              <FormDescription>Select all payment systems available</FormDescription>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {PAYMENT_SYSTEMS_OPTIONS.map((system) => (
                  <FormField
                    key={system}
                    control={form.control}
                    name="paymentSystems"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(system)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, system]);
                              } else {
                                field.onChange(currentValue.filter(v => v !== system));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{system}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormItem>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            {property?.id ? 'Save Changes' : 'Add Property'}
          </Button>
        </div>
      </form>
    </Form>
  );
}