import { React, Icons, TextButton, BaseText } from '@nlxai/touchpoint-ui';
import { CameraAccessData } from './types';

interface InitialScreenProps {
  data: CameraAccessData;
  onAllowAccess: () => void;
  hasSubmitted: boolean; // To disable button if already submitted in session
}

export const InitialScreen: React.FC<InitialScreenProps> = ({ data, onAllowAccess, hasSubmitted }) => {
  const buttonLabel = data.confirmLabel || (hasSubmitted ? "Photo Submitted" : "Allow Camera Access");
  const message = data.message || (hasSubmitted ? "A photo has already been submitted in this session." : "This application needs access to your camera.");

  return (
    <div
      style={{
        paddingTop: '10px',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '20px',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--outer-border-radius)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', marginBottom: '16px' }}>
        <Icons.Camera size={48} style={{ color: 'var(--primary-60)' }} />
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--primary-80)', marginBottom: '12px' }}>
        {data.title || "Camera Access Required"}
      </h2>
      <p style={{ fontSize: '16px', color: 'var(--primary-60)', marginBottom: '8px' }}>
        {message}
      </p>
      <p style={{ fontSize: '14px', color: 'var(--primary-40)', marginBottom: '24px' }}>
        {data.disclaimer || "Camera will only be used for this session."}
      </p>
      <TextButton
        label={buttonLabel}
        Icon={Icons.Camera}
        onClick={onAllowAccess}
        type="main"
        disabled={hasSubmitted}
      />
    </div>
  );
};