import { React, BaseText, IconButton, TextButton, Icons } from '@nlxai/touchpoint-ui';
import { CameraAccessData } from './types';

interface StreamingScreenProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  data: CameraAccessData;
  onStop: () => void;
  onIdentify: () => void; // Changed from onCapture
  isIdentifying: boolean;
  // Add overlayCanvasRef if you implement the ring feature
  // overlayCanvasRef?: React.RefObject<HTMLCanvasElement>;
}

export const StreamingScreen: React.FC<StreamingScreenProps> = ({
  videoRef,
  data,
  onStop,
  onIdentify,
  isIdentifying,
  // overlayCanvasRef
}) => {
  return (
    <div style={{ backgroundColor: 'var(--primary-5)', borderRadius: 'var(--outer-border-radius)', overflow: 'hidden', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ padding: '12px', backgroundColor: 'var(--primary-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BaseText>{data.streamingTitle || "Camera Active"}</BaseText>
        <IconButton Icon={Icons.Close} label="Stop" onClick={onStop} type="ghost" />
      </div>
      <div style={{ position: 'relative', paddingBottom: '56.25%' /* 16:9 for video */ }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'black' }}
        />
        {/* 
        {overlayCanvasRef && (
          <canvas 
            ref={overlayCanvasRef} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              pointerEvents: 'none'
            }} 
          />
        )}
        */}
      </div>
      {data.enableCapture !== false && data.identificationApiUrl && (
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
          <TextButton
            label={isIdentifying ? "Identifying..." : (data.identifyButtonLabel || "Identify Plant")}
            Icon={isIdentifying ? Icons.Loader : Icons.Search} // Example: show loader when identifying
            onClick={onIdentify}
            type="main"
            disabled={isIdentifying}
            style={{ width: 'calc(100% - 32px)', maxWidth: '300px' }}
          />
        </div>
      )}
       {data.enableCapture !== false && !data.identificationApiUrl && ( // Fallback if no identification API
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
          <BaseText style={{color: 'var(--warning-primary, orange)'}}>Plant identification feature not configured.</BaseText>
        </div>
      )}
    </div>
  );
};