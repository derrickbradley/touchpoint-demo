// src/components/CameraAccess/previewScreen.tsx
import { React, BaseText, IconButton, TextButton, Icons } from '@nlxai/touchpoint-ui';
import { CameraAccessData, IdentifiedPlant } from './types';

interface PreviewScreenProps {
  previewImageUrl: string | null;
  identifiedPlant: IdentifiedPlant | null;
  isIdentifying: boolean; // In case re-identification is an option or for loading states
  data: CameraAccessData;
  onConfirm: () => void; // Confirms the identified plant
  onRetake: () => void;  // Retake a new photo from camera
  onStop: () => void;
  onReIdentifyThisImage?: () => void; // Optional: To re-run identification on the current image
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({
  previewImageUrl,
  identifiedPlant,
  isIdentifying,
  data,
  onConfirm,
  onRetake,
  onStop,
  onReIdentifyThisImage,
}) => {
  const canConfirm = !!identifiedPlant && !isIdentifying;

  return (
    <div style={{ backgroundColor: 'var(--primary-5)', borderRadius: 'var(--outer-border-radius)', overflow: 'hidden', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ padding: '12px', backgroundColor: 'var(--primary-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BaseText>{identifiedPlant ? (data.previewTitle || "Identification Result") : "Review Photo"}</BaseText>
        <IconButton Icon={Icons.Close} label="Cancel" onClick={onStop} type="ghost" />
      </div>

      {previewImageUrl && (
        <div style={{ position: 'relative', paddingBottom: '75%' /* 4:3 Aspect Ratio */ }}>
          <img
            src={previewImageUrl}
            alt="Photo for identification"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {isIdentifying && !identifiedPlant && ( // Show global identifying message if no plant identified yet
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Icons.Loader size={32} style={{ color: 'var(--primary-60)', marginBottom: '10px' }}/>
          <BaseText style={{ color: 'var(--primary-60)' }}>Identifying plant, please wait...</BaseText>
        </div>
      )}

      {identifiedPlant && ( // Only show this section if a plant is identified
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <BaseText style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-80)', marginBottom: '4px' }}>
            {data.identifiedPlantMessage?.replace("{plantName}", identifiedPlant.name) || `${identifiedPlant.name}`}
          </BaseText>
          {identifiedPlant.confidence !== undefined && ( // Check for undefined explicitly
            <BaseText style={{ fontSize: '14px', color: 'var(--primary-60)' }}>
              (Confidence: {Math.round(identifiedPlant.confidence * 100)}%)
            </BaseText>
          )}
        </div>
      )}
      
      {/* Buttons Section */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {canConfirm && (
          <TextButton
            label={data.submitLabel || "Use This Identification"}
            Icon={Icons.Check}
            onClick={onConfirm}
            type="main"
            style={{ width: 'calc(100% - 32px)', maxWidth: '300px' }}
            disabled={isIdentifying} // Disable if any identification process is ongoing
          />
        )}

        {/* Button to re-identify the current image, if the feature is provided */}
        {!identifiedPlant && onReIdentifyThisImage && !isIdentifying && previewImageUrl && (
           <TextButton
            label={isIdentifying ? "Identifying..." : "Identify This Image"}
            Icon={isIdentifying ? Icons.Loader : Icons.Search}
            onClick={onReIdentifyThisImage}
            type="ghost"
            style={{ width: 'calc(100% - 32px)', maxWidth: '300px' }}
            disabled={isIdentifying}
          />
        )}

        <TextButton
          label={data.retakeLabel || "Retake New Photo"}
          Icon={Icons.Camera}
          onClick={onRetake}
          type="ghost"
          style={{ width: 'calc(100% - 32px)', maxWidth: '300px' }}
          disabled={isIdentifying} // Disable if any identification process is ongoing
        />
      </div>
    </div>
  );
};