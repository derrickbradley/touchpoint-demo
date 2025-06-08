// src/components/CameraAccess/errorScreen.tsx
import { React, BaseText, Icons, TextButton } from '@nlxai/touchpoint-ui';

interface ErrorScreenProps {
  errorMessage: string;
  onTryAgain: () => void; // This might lead to requestCameraAccess or a more specific retry
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ errorMessage, onTryAgain }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--outer-border-radius)' }}>
      <Icons.Error size={48} style={{ color: 'var(--error-primary)', marginBottom: '16px' }} />
      <BaseText style={{ fontSize: '24px', fontWeight: '500', color: 'var(--error-primary)', marginBottom: '12px' }}>
        An Error Occurred
      </BaseText>
      <BaseText style={{ color: 'var(--error-primary)', marginBottom: '24px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {errorMessage || "An unknown error occurred."}
      </BaseText>
      <TextButton
        label="Try Again"
        Icon={Icons.Refresh}
        onClick={onTryAgain}
        type="ghost"
      />
    </div>
  );
};