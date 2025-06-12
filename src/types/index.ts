
import { z } from 'zod';

// --- Existing Enums and Schemas (preserved for now) ---
export const PropertyFeatureEnum = z.enum(['ADA Parking', '24/7 Parking', '7FT Tall Clearance', 'Electric Charging', 'Roof Covering']);
export type PropertyFeature = z.infer<typeof PropertyFeatureEnum>;

const imageUrlSchema = z.string().refine((val) => {
  if (val === '') return true; // Allow empty string
  if (val.startsWith('https://placehold.co')) return true; // Allow placeholder
  if (val.startsWith('data:image/')) return true; // Allow data URI
  return z.string().url().safeParse(val).success; // Allow valid URL
}, { message: "Image must be a valid URL, data URI, placeholder, or empty string" }).optional();

export const PropertySchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Property name must be at least 3 characters long"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
  features: z.array(PropertyFeatureEnum).optional().default([]),
  imageUrl: imageUrlSchema,
  description: z.string().min(10, "Description must be at least 10 characters long"),
  aiHint: z.string().optional(),
  totalParking: z.number().int().min(0).optional().default(0),
  generalParking: z.number().int().min(0).optional().default(0),
  adaParking: z.number().int().min(0).optional().default(0),
  evParking: z.number().int().min(0).optional().default(0),
  cityStaffParking: z.number().int().min(0).optional().default(0),
  lifeguardParking: z.number().int().min(0).optional().default(0),
  otherSpaces: z.number().int().min(0).optional().default(0), // Note: 'otherSpaces' in old, 'otherParking' in SqlProperty
  smallLights: z.number().int().min(0).optional().default(0),
  largeLights: z.number().int().min(0).optional().default(0),
  totalLighting: z.number().int().min(0).optional().default(0),
  trafficRegulatorySigns: z.number().int().min(0).optional().default(0),
  parkingInfoSigns: z.number().int().min(0).optional().default(0),
  paymentSigns: z.number().int().min(0).optional().default(0), // Note: 'paymentSigns' in old, 'paymentSystemSignage' in SqlProperty
  wayfindingSigns: z.number().int().min(0).optional().default(0),
  trafficDirectionSigns: z.number().int().min(0).optional().default(0),
  otherSignage: z.number().int().min(0).optional().default(0),
  totalSignage: z.number().int().min(0).optional().default(0),
  securityFeatures: z.array(z.string()).optional().default([]),
  treesCount: z.number().int().min(0).optional().default(0), // Note: 'treesCount' in old, 'trees' in SqlProperty
  trashCansCount: z.number().int().min(0).optional().default(0), // Note: 'trashCansCount' in old, 'trashCans' in SqlProperty
  elevatorsCount: z.number().int().min(0).optional().default(0), // Note: 'elevatorsCount' in old, 'elevators' in SqlProperty
  stairsCount: z.number().int().min(0).optional().default(0),   // Note: 'stairsCount' in old, 'stairs' in SqlProperty
  carStopsCount: z.number().int().min(0).optional().default(0), // Note: 'carStopsCount' in old, 'carStops' in SqlProperty
  evChargersCount: z.number().int().min(0).optional().default(0), // This was in old schema, not directly in SqlProperty but related to evParking
  bikeFacilities: z.array(z.string()).optional().default([]),
  surfaceCondition: z.string().optional().default('N/A'),
  surfaceType: z.string().optional().default('N/A'),
  clearanceRequirements: z.string().optional().default('N/A'),
  entryPoints: z.number().int().min(0).optional().default(0), // Note: number in old, string in SqlProperty
  exitPoints: z.number().int().min(0).optional().default(0),   // Note: number in old, string in SqlProperty
  paymentSystems: z.array(z.string()).optional().default([]),
  totalMeters: z.number().int().min(0).optional().default(0), // Not in SqlProperty
});
export type Property = z.infer<typeof PropertySchema>;

export const PropertyFormSchema = PropertySchema.pick({
  name: true, address: true, description: true, features: true, imageUrl: true,
  generalParking: true, adaParking: true, evParking: true, cityStaffParking: true,
  lifeguardParking: true, otherSpaces: true, smallLights: true, largeLights: true,
  trafficRegulatorySigns: true, parkingInfoSigns: true, paymentSigns: true,
  wayfindingSigns: true, trafficDirectionSigns: true, otherSignage: true,
  treesCount: true, trashCansCount: true, elevatorsCount: true, stairsCount: true,
  carStopsCount: true, surfaceCondition: true, surfaceType: true,
  clearanceRequirements: true, entryPoints: true, exitPoints: true, totalMeters: true,
}).extend({
  securityFeaturesInput: z.string().optional(),
  bikeFacilitiesInput: z.string().optional(),
  paymentSystemsInput: z.string().optional(),
});
export type PropertyFormData = z.infer<typeof PropertyFormSchema>;

export interface ProjectFile {
  id: string; name: string; type: 'document' | 'image' | 'other';
  uploadedAt: string; size?: string; url?: string; storagePath?: string;
}
export interface ProjectUpdate { id: string; timestamp: string; text: string; }

export const ProjectStatusEnum = z.enum(['Pending', 'On Hold', 'Completed', 'Cancelled', 'In Progress']);
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;

export const ProjectScopeCategoryEnum = z.enum([
  'Cleanup', 'Inspection', 'Installation', 'Renovation', 'Repair',
  'Replacement', 'Routine', 'Survey', 'Upgrade'
]);
export type ProjectScopeCategory = z.infer<typeof ProjectScopeCategoryEnum>;

export const ProjectCategoryEnum = z.enum(['Minor Project', 'Major Project']);
export type ProjectCategory = z.infer<typeof ProjectCategoryEnum>;

export const ProjectSchema = z.object({
  id: z.string(),
  propertyId: z.string().min(1, "Property selection is required"),
  name: z.string().min(3, "Project name must be at least 3 characters long"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  status: ProjectStatusEnum,
  updates: z.array(z.object({ id: z.string(), timestamp: z.string(), text: z.string() })).default([]),
  files: z.array(z.object({
    id: z.string(), name: z.string(), type: z.enum(['document', 'image', 'other']),
    uploadedAt: z.string(), size: z.string().optional(), url: z.string().optional(),
  })).default([]),
  progressPercentage: z.number().min(0).max(100).default(0),
  currentSummary: z.string().optional(),
  projectCategory: ProjectCategoryEnum.default(ProjectCategoryEnum.Values['Minor Project']),
  scopeCategory: z.array(ProjectScopeCategoryEnum).optional().default([]),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectFormSchema = ProjectSchema.pick({
  name: true, startDate: true, endDate: true, status: true,
  projectCategory: true, propertyId: true, scopeCategory: true,
});
export type ProjectFormData = z.infer<typeof ProjectFormSchema>;

export const NewProjectDefaultValues: Partial<Project> = {
  name: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  status: ProjectStatusEnum.Values['Pending'],
  projectCategory: ProjectCategoryEnum.Values['Minor Project'],
  scopeCategory: [], updates: [], files: [], currentSummary: '', progressPercentage: 0,
};

export type UserRole = 'admin' | 'editor' | 'viewer';
export interface AppUser { id: string; email: string; name: string; role: UserRole; }

// --- New Schemas based on Cloud SQL (GraphQL-like definition) ---

export const SqlPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  totalParking: z.number().int().optional().nullable(),
  generalParking: z.number().int().optional().nullable(),
  adaParking: z.number().int().optional().nullable(),
  evParking: z.number().int().optional().nullable(),
  cityStaffParking: z.number().int().optional().nullable(),
  lifeguardParking: z.number().int().optional().nullable(),
  otherParking: z.number().int().optional().nullable(),
  trafficRegulatorySignage: z.string().optional().nullable(),
  parkingInfoSignage: z.string().optional().nullable(),
  paymentSystemSignage: z.string().optional().nullable(),
  wayfindingSignage: z.string().optional().nullable(),
  trafficDirectionSignage: z.string().optional().nullable(),
  otherSignage: z.string().optional().nullable(),
  totalSignage: z.number().int().optional().nullable(),
  smallLights: z.number().int().optional().nullable(),
  largeLights: z.number().int().optional().nullable(),
  totalLighting: z.number().int().optional().nullable(),
  securityFeatures: z.string().optional().nullable(),
  trees: z.number().int().optional().nullable(),
  trashCans: z.number().int().optional().nullable(),
  elevators: z.number().int().optional().nullable(),
  stairs: z.number().int().optional().nullable(),
  carStops: z.number().int().optional().nullable(),
  bikeFacilities: z.string().optional().nullable(),
  surfaceCondition: z.string().optional().nullable(),
  surfaceType: z.string().optional().nullable(),
  clearanceRequirements: z.string().optional().nullable(),
  entryPoints: z.string().optional().nullable(),
  exitPoints: z.string().optional().nullable(),
  paymentSystems: z.string().optional().nullable(),
  adaParkingAvailable: z.boolean().optional().nullable(),
  twentyFourSevenParking: z.boolean().optional().nullable(),
  sevenFtTallClearance: z.boolean().optional().nullable(),
  electricChargingAvailable: z.boolean().optional().nullable(),
  roofCovering: z.boolean().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  aiHint: z.string().optional().nullable(),
});
export type SqlProperty = z.infer<typeof SqlPropertySchema>;

export const SqlProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  propertyId: z.string(), 
  // property: SqlPropertySchema, // Could be included if GraphQL always nests it
  startDate: z.string(), // ISO Date string
  status: z.string(),
  description: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(), // ISO Date string
  scopeCategory: z.string().optional().nullable(),
  projectCategory: z.string().optional().nullable(),
});
export type SqlProject = z.infer<typeof SqlProjectSchema>;

export const SqlDocumentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  fileUrl: z.string().url(),
  uploadDate: z.string(), // ISO Timestamp string
  description: z.string().optional().nullable(),
  documentType: z.string().optional().nullable(),
});
export type SqlDocument = z.infer<typeof SqlDocumentSchema>;

export const SqlNoteSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  content: z.string(),
  createdAt: z.string(), // ISO Timestamp string
});
export type SqlNote = z.infer<typeof SqlNoteSchema>;

// Form data schemas will also need updating if you fully switch to Sql types.
// e.g., SqlPropertyFormData, SqlProjectFormData
// For now, existing form schemas are kept and mapping occurs in PropertiesContent.
// A more robust solution would be to update components to use SqlProperty directly.

