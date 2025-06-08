export interface IdentifiedPlant {
  name: string;
  confidence?: number;
  imageUrl?: string; // Optional reference image for the identified plant
  // Add other details your API might return
}

export interface CameraAccessData {
  title?: string;
  message?: string;
  disclaimer?: string;
  // ... all other props from your current interface ...
  identificationApiUrl?: string;
  identificationChoiceId?: string;
  identifyButtonLabel?: string;
  identifiedPlantMessage?: string; // e.g. "Identified Plant: {plantName}"
}

// You might also define types for the states
export type CameraState = 
  | "initial" 
  | "requesting" 
  | "streaming" 
  | "preview" // This state will show identification results
  | "error" 
  | "submitted" // After confirming an identification
  | "identifying"; // New state while API call is in progress

// Metadata for images stored in window.capturedImages
export interface CapturedImageMetadata {
  timestamp: string;
  width: number;
  height: number;
  sizeKB: number;
  fileName: string;
  mimeType: string;
}

export interface CapturedImageData {
  base64: string;
  metadata: CapturedImageMetadata;
}

// Augment global Window interface
declare global {
  interface Window {
    capturedImages: { [key: string]: CapturedImageData };
    getLastCapturedImage: () => CapturedImageData | null;
    getCapturedImage: (imageId: string) => CapturedImageData | null;
  }
}