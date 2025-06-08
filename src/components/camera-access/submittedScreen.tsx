// src/components/CameraAccess/submittedScreen.tsx
import { React, BaseText, Icons } from '@nlxai/touchpoint-ui';
import { CameraAccessData } from './types'; // Not strictly needed if no data props used

interface SubmittedScreenProps {
  data: CameraAccessData; // Kept for consistency, might use data.submittedTitle later
}

export const SubmittedScreen: React.FC<SubmittedScreenProps> = ({ data }) => {
  return (
    <div
      style={{
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--outer-border-radius)'
      }}
    >
      <Icons.CheckCircle
        size={60}
        style={{ color: 'var(--success-primary, #4CAF50)', marginBottom: '24px' }}
      />
      <BaseText
        style={{
          fontSize: '24px',
          fontWeight: 500,
          color: 'var(--primary-80)',
          marginBottom: '12px'
        }}
      >
        Information Submitted
      </BaseText>
      <BaseText style={{ fontSize: '16px', color: 'var(--primary-60)' }}>
        Thank you. Your information has been successfully submitted.
      </BaseText>
    </div>
  );
};