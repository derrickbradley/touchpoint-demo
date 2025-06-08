// src/components/CameraAccess/useCameraStream.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { CameraAccessData } from './types'; // Assuming types.ts is in the same folder

interface UseCameraStreamProps {
  data: CameraAccessData; // For facingMode, etc.
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onAccessError?: (error: Error) => void;
}

export interface CameraStreamControls {
  videoRef: React.RefObject<HTMLVideoElement>;
  streamActive: boolean;
  requestAccess: () => Promise<MediaStream | null>;
  stopStream: () => void;
  captureFrame: (options: {
    outputWidth: number;
    outputHeight: number;
    format?: string; // e.g., 'image/jpeg'
    quality?: number; // e.g., 0.7 for submission, 0.92 for preview
  }) => Promise<{ base64DataUrl: string; base64String: string; blob: Blob } | null>;
}

export const useCameraStream = ({ data, onStreamStart, onStreamStop, onAccessError }: UseCameraStreamProps): CameraStreamControls => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streamActive, setStreamActive] = useState(false);

  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStreamActive(false);
      if (onStreamStop) onStreamStop();
      console.log("Camera stream stopped by hook.");
    }
  }, [onStreamStop]);

  const requestAccess = useCallback(async (): Promise<MediaStream | null> => {
    stopCurrentStream(); // Stop any existing stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: data.facingMode || "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setStreamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(err => {
          console.error("Error playing video in hook:", err);
          throw err; // Re-throw to be caught by caller
        });
      }
      if (onStreamStart) onStreamStart();
      return stream;
    } catch (error: any) {
      console.error("Error accessing camera in hook:", error);
      if (onAccessError) onAccessError(error);
      setStreamActive(false);
      return null;
    }
  }, [data.facingMode, stopCurrentStream, onStreamStart, onAccessError]);

  const captureFrame = useCallback(async (options: {
    outputWidth: number;
    outputHeight: number;
    format?: string;
    quality?: number;
  }): Promise<{ base64DataUrl: string; base64String: string; blob: Blob } | null> => {
    if (!videoRef.current || !streamRef.current || !streamActive) {
      console.warn("Capture frame called but stream is not active or video not ready.");
      return null;
    }
    const videoNode = videoRef.current;
    if (videoNode.readyState < videoNode.HAVE_METADATA || videoNode.videoWidth === 0) {
      console.warn("Video not ready for capture.");
      return null;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Determine actual draw dimensions based on video aspect ratio and target output
    const aspectRatio = videoNode.videoWidth / videoNode.videoHeight;
    let drawWidth = options.outputWidth;
    let drawHeight = options.outputHeight;

    if (options.outputWidth / options.outputHeight > aspectRatio) { // Output is wider than video
         drawWidth = options.outputHeight * aspectRatio;
    } else { // Output is taller or same aspect ratio
         drawHeight = options.outputWidth / aspectRatio;
    }
    // Center the crop if needed, or just use fit. For now, simple fit.
    // This logic might need adjustment based on how you want to handle aspect ratio differences.
    // The following ensures it fits within outputWidth/Height while maintaining aspect.
    canvas.width = Math.min(options.outputWidth, videoNode.videoWidth);
    canvas.height = Math.min(options.outputHeight, videoNode.videoHeight);

     // More robust aspect ratio handling for canvas drawing
     let sourceX = 0, sourceY = 0, sourceWidth = videoNode.videoWidth, sourceHeight = videoNode.videoHeight;
     const canvasAspectRatio = canvas.width / canvas.height;

     if (aspectRatio > canvasAspectRatio) { // Video is wider than canvas: crop video's width
         sourceWidth = videoNode.videoHeight * canvasAspectRatio;
         sourceX = (videoNode.videoWidth - sourceWidth) / 2;
     } else if (aspectRatio < canvasAspectRatio) { // Video is taller than canvas: crop video's height
         sourceHeight = videoNode.videoWidth / canvasAspectRatio;
         sourceY = (videoNode.videoHeight - sourceHeight) / 2;
     }

    ctx.drawImage(videoNode, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);


    const format = options.format || 'image/jpeg';
    const quality = format === 'image/jpeg' ? (options.quality || 0.85) : undefined;
    const base64DataUrl = canvas.toDataURL(format, quality);
    const base64String = base64DataUrl.split(',')[1];
    
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality));
    if (!blob) return null;

    return { base64DataUrl, base64String, blob };
  }, [streamActive]);
  
  useEffect(() => {
     // Cleanup stream when component using the hook unmounts
     return () => {
         stopCurrentStream();
     };
  }, [stopCurrentStream]);

  return { videoRef, streamActive, requestAccess, stopStream: stopCurrentStream, captureFrame };
};