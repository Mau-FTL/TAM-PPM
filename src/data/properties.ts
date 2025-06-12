
import type { Property, PropertyFeature } from '@/types';
import { databaseService } from '@/lib/databaseService'; // Import databaseService

// This is the primary source of raw data for properties.
const fullRawPropertyData = [
  {
    "Title": "County Lot 1",
    "General Parking": 40,
    "ADA Parking": 4,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 1,
    "Total Parking": 45,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_05e9dbf4b4da41ae996824a56a160ace"
  },
  {
    "Title": "City Hall Garage",
    "General Parking": 108,
    "ADA Parking": 11,
    "EV Parking": 5,
    "City Staff Parking": 192,
    "Lifeguard Parking": 0,
    "Other Spaces": 58,
    "Total Parking": 374,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_10d35dfa90864f268c62d1832ea14b72"
  },
  {
    "Title": "Fort Lauderdale Beach Parking Lot",
    "General Parking": 432,
    "ADA Parking": 10,
    "EV Parking": 3,
    "City Staff Parking": 1,
    "Lifeguard Parking": 4,
    "Other Spaces": 0,
    "Total Parking": 450,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_2a1e3c690a6e4aeb8fa6ba5e26a5083e"
  },
  {
    "Title": "Miles Corner",
    "General Parking": 41,
    "ADA Parking": 2,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 43,
    "Photo": null,
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_2b6198988c0f44a690798abc9ec9e747"
  },
  {
    "Title": "NE 27th Street Lot",
    "General Parking": 19,
    "ADA Parking": 1,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 20,
    "Photo": null,
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_40a5d2d11bc948c985b5b03665453c5a"
  },
  {
    "Title": "Cross Roads",
    "General Parking": 61,
    "ADA Parking": 3,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 64,
    "Photo": null,
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_57bc86c532c243d8866fbaa917eb03e0"
  },
  {
    "Title": "Bridgeside Place Garage",
    "General Parking": 508,
    "ADA Parking": 16,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 67,
    "Total Parking": 591,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_59a169f9e7864fca80d3b4234ef7a69b"
  },
  {
    "Title": "Riverwalk Center Garage",
    "General Parking": 522,
    "ADA Parking": 25,
    "EV Parking": 5,
    "City Staff Parking": 22,
    "Lifeguard Parking": 0,
    "Other Spaces": 1544,
    "Total Parking": 2118,
    "Photo": null,
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_6a0ee2debdd3498faa3cd6ea70142a41"
  },
  {
    "Title": "Heron Lot",
    "General Parking": 99,
    "ADA Parking": 5,
    "EV Parking": 0,
    "City Staff Parking": 2,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 106,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_7196d1f13c6f40b5b89a1e33fa7da125"
  },
  {
    "Title": "Nautical Lot",
    "General Parking": 55,
    "ADA Parking": 3,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 58,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_737f473cad394f4ebd6c3a91da6e82da"
  },
  {
    "Title": "Aquatic Center Parking Lot",
    "General Parking": 107,
    "ADA Parking": 5,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 112,
    "Photo": null,
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_827fb98f52804d27997d3ac745f1fac5"
  },
  {
    "Title": "County Lot 2",
    "General Parking": 80,
    "ADA Parking": 4,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 3,
    "Total Parking": 87,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_8b49831b68a3485b81cc009c66870ef2"
  },
  {
    "Title": "North Beach Lot",
    "General Parking": 75,
    "ADA Parking": 2,
    "EV Parking": 2,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 79,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_a390d27de8a24461a1ca1a36be0e4fb7"
  },
  {
    "Title": "Vista Parking Lot",
    "General Parking": 14,
    "ADA Parking": 1,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 15,
    "Photo": null,
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_bbe794ee810744129240d1d8b2274c1e"
  },
  {
    "Title": "River House Lot",
    "General Parking": 14,
    "ADA Parking": 2,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 16,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_d74f2a96831844eaad4b8ae96f64104e"
  },
  {
    "Title": "Coral Lot",
    "General Parking": 50,
    "ADA Parking": 3,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 53,
    "Photo": null,
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_dce872a2df96412f99e3e25145d282b0"
  },
  {
    "Title": "Galt South Lot",
    "General Parking": 64,
    "ADA Parking": 5,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 69,
    "Photo": null,
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_e2251ba056e34330bc79c78163c6bd33"
  },
  {
    "Title": "Galt North Lot",
    "General Parking": 55,
    "ADA Parking": 3,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 58,
    "Photo": null,
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_e3443139d7434d11a63fdc218eaf5a2e"
  },
  {
    "Title": "Venice Lot",
    "General Parking": 28,
    "ADA Parking": 2,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 30,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_e8c0cd9432034ccf834125a99ad4ab96"
  },
  {
    "Title": "Cooley's Landing",
    "General Parking": 56,
    "ADA Parking": 2,
    "EV Parking": 0,
    "City Staff Parking": 3,
    "Lifeguard Parking": 0,
    "Other Spaces": 2,
    "Total Parking": 63,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_efbe584443f44aa4a0c8eca30ac6c6df"
  },
  {
    "Title": "Las Olas Garage",
    "General Parking": 643,
    "ADA Parking": 14,
    "EV Parking": 6,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 663,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_f3d6d94435a74dfc9a88533f28abb256"
  },
  {
    "Title": "George English Lot",
    "General Parking": 90,
    "ADA Parking": 5,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 95,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_f6d36ca5a7b04e489f8921e999db8465"
  },
  {
    "Title": "Pelican Lot",
    "General Parking": 20,
    "ADA Parking": 3,
    "EV Parking": 0,
    "City Staff Parking": 0,
    "Lifeguard Parking": 0,
    "Other Spaces": 0,
    "Total Parking": 23,
    "Photo": { "url": "https://placehold.co/600x400.png" },
    "_id": "ro_ta_8f5d0e4b2bd44d6690c463778fe641b6_fe36ad8a02a84db99786c4dd77f88e0b"
  }
];

const getAiHint = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('garage')) return 'parking garage';
  if (lowerTitle.includes('beach')) return 'beach parking';
  if (lowerTitle.includes('lot')) return 'parking lot';
  if (lowerTitle.includes('landing') || lowerTitle.includes('center')) return 'building exterior';
  return 'city parking';
};

const getDefaultFeatures = (propertyData: typeof fullRawPropertyData[0]): PropertyFeature[] => {
  const features: PropertyFeature[] = [];
  if (propertyData["ADA Parking"] > 0) {
    features.push("ADA Parking");
  }
  if (propertyData["EV Parking"] > 0) {
    features.push("Electric Charging");
  }
  if (propertyData.Title.includes("Garage") || propertyData.Title.includes("Center") || propertyData.Title.includes("Las Olas Garage")) {
     features.push("Roof Covering");
     features.push("7FT Tall Clearance");
  }
  if (Math.random() > 0.3) {
    features.push("24/7 Parking");
  }
  return features;
};

const getExtendedDetails = (title: string, totalParking: number, evParking: number) => {
  const isGarage = title.toLowerCase().includes('garage');
  const isLot = title.toLowerCase().includes('lot');

  const smallLights = isGarage ? Math.floor(Math.random() * 50) + 20 : Math.floor(Math.random() * 20) + 5;
  const largeLights = isGarage ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 10) + 2;
  
  const trafficSigns = Math.floor(Math.random() * 10) + 2;
  const parkingInfo = Math.floor(Math.random() * 8) + 3;
  const payment = Math.floor(Math.random() * 5) + 1;
  const wayfinding = isGarage ? Math.floor(Math.random() * 10) + 2 : Math.floor(Math.random() * 5);
  const trafficDirection = Math.floor(Math.random() * 6) + 1;
  const otherSign = Math.floor(Math.random() * 3);

  return {
    smallLights,
    largeLights,
    totalLighting: smallLights + largeLights,
    trafficRegulatorySigns: trafficSigns,
    parkingInfoSigns: parkingInfo,
    paymentSigns: payment,
    wayfindingSigns: wayfinding,
    trafficDirectionSigns: trafficDirection,
    otherSignage: otherSign,
    totalSignage: trafficSigns + parkingInfo + payment + wayfinding + trafficDirection + otherSign,
    securityFeatures: Math.random() > 0.5 ? ["Cameras", (Math.random() > 0.5 ? "Security Patrol" : "Well Lit")] : ["Cameras"],
    treesCount: isLot ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 5),
    trashCansCount: Math.floor(Math.random() * 10) + 2,
    elevatorsCount: isGarage ? Math.floor(Math.random() * 3) + 1 : 0,
    stairsCount: isGarage ? Math.floor(Math.random() * 4) + 1 : (isLot ? (Math.random() > 0.7 ? 1:0) : 0),
    carStopsCount: Math.floor(totalParking * (Math.random() * 0.3 + 0.6)), 
    evChargersCount: evParking || 0, // This field is in Property type, use EV Parking for it
    bikeFacilities: Math.random() > 0.6 ? ["Racks"] : [],
    surfaceCondition: ["Good", "Fair", "Needs Minor Repair"][Math.floor(Math.random() * 3)],
    surfaceType: isGarage ? "Concrete" : (isLot ? "Asphalt" : "Mixed"),
    clearanceRequirements: isGarage ? "7ft" : "No restrictions",
    entryPoints: isGarage ? Math.floor(Math.random() * 2) + 1 : 1,
    exitPoints: isGarage ? Math.floor(Math.random() * 2) + 1 : 1,
    paymentSystems: Math.random() > 0.4 ? ["Pay Station", "Mobile App"] : ["Pay Station"],
    totalMeters: Math.floor(totalParking * (Math.random() * 0.2)),
  };
};

// Exported 'properties' array for synchronous mock data access
export const properties: Property[] = fullRawPropertyData.map((raw): Property => {
  const extended = getExtendedDetails(raw.Title, raw["Total Parking"] || 0, raw["EV Parking"] || 0);
  return {
    id: raw._id,
    name: raw.Title,
    // Provide default placeholders or derive if possible; these were missing in raw data
    address: `${raw.Title} Address, Fort Lauderdale, FL`, // Example placeholder
    description: `This is a description for the ${raw.Title} parking facility. It offers various amenities and parking options.`, // Example placeholder
    features: getDefaultFeatures(raw),
    imageUrl: raw.Photo?.url || 'https://placehold.co/600x400.png',
    aiHint: getAiHint(raw.Title),
    totalParking: raw["Total Parking"] || 0,
    generalParking: raw["General Parking"] || 0,
    adaParking: raw["ADA Parking"] || 0,
    evParking: raw["EV Parking"] || 0,
    cityStaffParking: raw["City Staff Parking"] || 0,
    lifeguardParking: raw["Lifeguard Parking"] || 0,
    otherSpaces: raw["Other Spaces"] || 0,
    // from getExtendedDetails
    smallLights: extended.smallLights,
    largeLights: extended.largeLights,
    totalLighting: extended.totalLighting,
    trafficRegulatorySigns: extended.trafficRegulatorySigns,
    parkingInfoSigns: extended.parkingInfoSigns,
    paymentSigns: extended.paymentSigns,
    wayfindingSigns: extended.wayfindingSigns,
    trafficDirectionSigns: extended.trafficDirectionSigns,
    otherSignage: extended.otherSignage,
    totalSignage: extended.totalSignage,
    securityFeatures: extended.securityFeatures,
    treesCount: extended.treesCount,
    trashCansCount: extended.trashCansCount,
    elevatorsCount: extended.elevatorsCount,
    stairsCount: extended.stairsCount,
    carStopsCount: extended.carStopsCount,
    evChargersCount: extended.evChargersCount,
    bikeFacilities: extended.bikeFacilities,
    surfaceCondition: extended.surfaceCondition,
    surfaceType: extended.surfaceType,
    clearanceRequirements: extended.clearanceRequirements,
    entryPoints: extended.entryPoints,
    exitPoints: extended.exitPoints,
    paymentSystems: extended.paymentSystems,
    totalMeters: extended.totalMeters,
  };
});

// Async function to fetch properties, currently uses databaseService (RTDB)
// This can be kept if there's a scenario to fetch from RTDB,
// or modified if it should also return mock data asynchronously.
export async function fetchProperties(): Promise<Property[]> {
  const propertiesData = await databaseService.getProperties();
  return propertiesData.map(property => {
    // This mapping assumes RTDB data might need some enrichment similar to mock data
    // or already conforms to the Property type.
    // If RTDB data is as minimal as fullRawPropertyData, more extensive mapping is needed here.
    return {
      ...property, // Spread RTDB data
      id: property.id, // Ensure ID is string
      // Default or derive missing fields if necessary
      name: property.name || 'Unknown Property',
      address: property.address || 'Unknown Address',
      description: property.description || 'No description available.',
      imageUrl: property.imageUrl || 'https://placehold.co/600x400.png',
      features: property.features || getDefaultFeatures({ "Title": property.name, "ADA Parking": property.adaParking || 0, "EV Parking": property.evParking || 0 } as any), // Basic derivation
      aiHint: property.aiHint || getAiHint(property.name),
      // Ensure all numeric fields have defaults if they might be missing from RTDB
      totalParking: property.totalParking || 0,
      generalParking: property.generalParking || 0,
      adaParking: property.adaParking || 0,
      evParking: property.evParking || 0,
      // ... (ensure all other fields from Property type are present with defaults if not in property from RTDB)
      // For brevity, not listing all, but a full mapping like the one for `properties` export might be needed
      // if RTDB data doesn't fully match `Property` type.
    };
  });
}
