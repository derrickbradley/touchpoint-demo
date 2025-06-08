// src/components/CameraAccess/usePlantIdentifier.ts
import { useState, useCallback } from 'react';
import { IdentifiedPlant } from './types';

interface UsePlantIdentifierProps {
  identificationApiUrl?: string;
}

export interface PlantIdentifierControls {
  identifiedPlant: IdentifiedPlant | null;
  isIdentifying: boolean;
  identifyPlant: (imageBase64: string, mimeType: string) => Promise<IdentifiedPlant | null>;
  clearIdentification: () => void;
}

export const usePlantIdentifier = ({ identificationApiUrl }: UsePlantIdentifierProps): PlantIdentifierControls => {
  const [identifiedPlant, setIdentifiedPlant] = useState<IdentifiedPlant | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);

  const identifyPlant = useCallback(async (imageBase64: string, mimeType: string): Promise<IdentifiedPlant | null> => {
    if (!identificationApiUrl) {
      console.error("Identification API URL not configured.");
      return null;
    }
    setIsIdentifying(true);
    setIdentifiedPlant(null);
    try {
      const response = await fetch(identificationApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      const result = await response.json();
      if (result.identifiedPlant && result.identifiedPlant.name) {
        const plantResult = result.identifiedPlant as IdentifiedPlant;
        setIdentifiedPlant(plantResult);
        return plantResult;
      } else {
        throw new Error("Invalid response from identification API.");
      }
    } catch (error) {
      console.error("Error identifying plant:", error);
      setIdentifiedPlant(null); // Ensure it's cleared on error
      throw error; // Re-throw for the component to handle
    } finally {
      setIsIdentifying(false);
    }
  }, [identificationApiUrl]);

  const clearIdentification = useCallback(() => {
     setIdentifiedPlant(null);
     setIsIdentifying(false);
  },[]);

  return { identifiedPlant, isIdentifying, identifyPlant, clearIdentification };
};