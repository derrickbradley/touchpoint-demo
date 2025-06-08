import { React, BaseText } from '@nlxai/touchpoint-ui';
import { CameraAccessData } from './types'; // Not strictly needed for this simple screen if no data props used

interface RequestingScreenProps {
  data: CameraAccessData; // Kept for consistency, might use data.requestingTitle later
}

export const RequestingScreen: React.FC<RequestingScreenProps> = ({ data }) => {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--outer-border-radius)' }}>
      <BaseText style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px' }}>
        Requesting camera access...
      </BaseText>
      <BaseText style={{ color: 'var(--primary-60)' }}>
        Please allow camera access when prompted.
      </BaseText>
    </div>
  );
};