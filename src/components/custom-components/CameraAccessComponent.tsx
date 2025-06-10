import {
  React,
  Icons,
  TextButton,
  IconButton,
  // type CustomModalityComponent,
} from "@nlxai/touchpoint-ui";

import type { CustomComponent } from '../custom-component-types';

interface CameraAccessData {
  title?: string;
  message?: string;
  disclaimer?: string;
  confirmLabel?: string;
  streamingTitle?: string;
  captureLabel?: string;
  previewTitle?: string;
  submitLabel?: string;
  retakeLabel?: string;
  facingMode?: "user" | "environment";
  enableCapture?: boolean;
  captureChoiceId?: string;
  accessGrantedChoiceId?: string;
  accessDeniedChoiceId?: string;
  stopChoiceId?: string;
}

declare global {
  interface Window {
    capturedImages: {
      [key: string]: {
        base64: string;
        metadata: {
          timestamp: string;
          width: number;
          height: number;
          sizeKB: number;
          fileName: string;
          mimeType: string;
        };
      };
    };
    getLastCapturedImage: () => any;
    getCapturedImage: (imageId: string) => any;
  }
}

const CameraAccessComponent: CustomComponent<CameraAccessData> = ({
  data,
  conversationHandler,
}) => {
  // FINAL FIX: The entire logic block is restored.
  const [cameraState, setCameraState] = React.useState<
    "initial" | "requesting" | "streaming" | "preview" | "error" | "submitted"
  >("initial");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [capturedImageUrl, setCapturedImageUrl] = React.useState<string>("");
  const [capturedImageId, setCapturedImageId] = React.useState<string>("");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (!window.capturedImages) {
      window.capturedImages = {};
    }
    window.getCapturedImage = (imageId: string) => {
      const image = window.capturedImages[imageId];
      if (!image) {
        console.warn(`Image with ID ${imageId} not found`);
        return null;
      }
      return image;
    };
    window.getLastCapturedImage = () => {
      const ids = Object.keys(window.capturedImages);
      if (ids.length === 0) return null;
      const lastId = ids[ids.length - 1];
      return window.capturedImages[lastId];
    };
  }, []);

  const stopStream = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      console.log("Camera stream stopped.");
    }
  }, []);

  const revokePreviewUrl = React.useCallback(() => {
    if (capturedImageUrl && capturedImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(capturedImageUrl);
      setCapturedImageUrl("");
      console.log("Preview Blob URL revoked:", capturedImageUrl);
    }
  }, [capturedImageUrl]);

  React.useEffect(() => {
    return () => {
      stopStream();
      revokePreviewUrl();
    };
  }, [stopStream, revokePreviewUrl]);

  React.useEffect(() => {
    if (cameraState === "streaming" && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      if (!video.srcObject) {
        video.srcObject = streamRef.current;
        video.play().catch((err) => {
          console.error("Error playing video stream:", err);
          setErrorMessage(`Error playing video: ${err.message}`);
          setCameraState("error");
        });
      }
    }
  }, [cameraState]);

  const requestCameraAccess = async () => {
    console.log("Requesting camera access...");
    setCameraState("requesting");
    revokePreviewUrl();
    if (capturedImageId && window.capturedImages[capturedImageId]) {
      delete window.capturedImages[capturedImageId];
      setCapturedImageId("");
    }

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
      setCameraState("streaming");
      console.log("Camera access granted, stream started.");
      if (data.accessGrantedChoiceId) {
        conversationHandler.sendChoice(data.accessGrantedChoiceId, {
          cameraAccessGranted: true,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setErrorMessage(error.message || "Unable to access camera.");
      setCameraState("error");
      if (data.accessDeniedChoiceId) {
        conversationHandler.sendChoice(data.accessDeniedChoiceId, {
          cameraAccessDenied: true,
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const generateAndSetSubmissionImage = async (
    videoNode: HTMLVideoElement,
    providedPreviewUrl: string | null,
  ) => {
    try {
      const submissionCanvas = document.createElement("canvas");
      const submissionCtx = submissionCanvas.getContext("2d");
      if (!submissionCtx) throw new Error("Submission canvas context failed");

      const submissionTargetMaxWidth = 640;
      const submissionTargetMaxHeight = 480;
      let subCanvasFinalWidth = videoNode.videoWidth;
      let subCanvasFinalHeight = videoNode.videoHeight;
      const subAspectRatio = videoNode.videoWidth / videoNode.videoHeight;

      if (subCanvasFinalWidth > submissionTargetMaxWidth) {
        subCanvasFinalWidth = submissionTargetMaxWidth;
        subCanvasFinalHeight = subCanvasFinalWidth / subAspectRatio;
      }
      if (subCanvasFinalHeight > submissionTargetMaxHeight) {
        subCanvasFinalHeight = submissionTargetMaxHeight;
        subCanvasFinalWidth = subCanvasFinalHeight * subAspectRatio;
      }
      submissionCanvas.width = Math.round(subCanvasFinalWidth);
      submissionCanvas.height = Math.round(subCanvasFinalHeight);

      submissionCtx.drawImage(videoNode, 0, 0, submissionCanvas.width, submissionCanvas.height);

      const submissionImageFormat = "image/jpeg";
      const submissionImageQuality = 0.7;
      const base64DataUrlForSubmission = submissionCanvas.toDataURL(submissionImageFormat, submissionImageQuality);
      const base64StringForSubmission = base64DataUrlForSubmission.split(",")[1];

      let finalPreviewUrlToDisplay = providedPreviewUrl;

      if (!finalPreviewUrlToDisplay) {
        console.warn("High-quality preview generation failed, using submission-quality for display.");
        await new Promise<void>((resolve, reject) => {
          submissionCanvas.toBlob((blob) => {
            if (blob) {
              finalPreviewUrlToDisplay = URL.createObjectURL(blob);
              resolve();
            } else {
              reject(new Error("Failed to create fallback preview blob."));
            }
          }, submissionImageFormat, submissionImageQuality);
        });
      }

      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = `capture-${imageId}.jpg`;
      const sizeKB = Math.round((base64StringForSubmission.length * 0.75) / 1024);

      window.capturedImages[imageId] = {
        base64: base64StringForSubmission,
        metadata: {
          timestamp: new Date().toISOString(),
          width: submissionCanvas.width,
          height: submissionCanvas.height,
          sizeKB: sizeKB,
          fileName: fileName,
          mimeType: submissionImageFormat,
        },
      };

      console.log(`[CAPTURE] SUBMISSION Image Prepared: ID=${imageId}, Size=${sizeKB}KB, Dim=${submissionCanvas.width}x${submissionCanvas.height}`);
      if (providedPreviewUrl) console.log("[CAPTURE] High-quality PREVIEW will be displayed.");

      setCapturedImageUrl(finalPreviewUrlToDisplay!);
      setCapturedImageId(imageId);
      setCameraState("preview");
      stopStream();

    } catch (error: any)
    {
      console.error("Error generating submission image:", error);
      setErrorMessage(`Failed to process photo: ${error.message}`);
      setCameraState("error");
      if (providedPreviewUrl) URL.revokeObjectURL(providedPreviewUrl);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !streamRef.current) {
      console.warn("Capture called but videoRef or streamRef is not available.");
      return;
    }
    const videoNode = videoRef.current;
    if (videoNode.readyState < videoNode.HAVE_METADATA || videoNode.videoWidth === 0 || videoNode.videoHeight === 0) {
      console.warn("Video not ready for capture or has no dimensions.");
      setErrorMessage("Camera not ready or no video data. Please wait or try again.");
      return;
    }
    console.log("[CAPTURE] Initiating photo capture...");
    try {
      const previewCanvas = document.createElement("canvas");
      const previewCtx = previewCanvas.getContext("2d");
      if (!previewCtx) throw new Error("Preview canvas context failed");
      const videoWidth = videoNode.videoWidth;
      const videoHeight = videoNode.videoHeight;
      const aspectRatio = videoWidth / videoHeight;
      const previewTargetMaxWidth = 1280;
      let previewCanvasWidth = videoWidth;
      let previewCanvasHeight = videoHeight;
      if (previewCanvasWidth > previewTargetMaxWidth) {
        previewCanvasWidth = previewTargetMaxWidth;
        previewCanvasHeight = previewCanvasWidth / aspectRatio;
      }
      previewCanvas.width = Math.round(previewCanvasWidth);
      previewCanvas.height = Math.round(previewCanvasHeight);
      previewCtx.drawImage(videoNode, 0, 0, previewCanvas.width, previewCanvas.height);
      console.log(`[CAPTURE] Drawn to preview canvas: ${previewCanvas.width}x${previewCanvas.height}`);
      previewCanvas.toBlob(
        (previewBlob) => {
          if (!previewBlob) {
            console.error("[CAPTURE] Preview canvas toBlob failed. Proceeding with submission-quality preview.");
            generateAndSetSubmissionImage(videoNode, null);
            return;
          }
          const highQualityPreviewUrl = URL.createObjectURL(previewBlob);
          console.log("[CAPTURE] High-quality preview blob created:", highQualityPreviewUrl);
          generateAndSetSubmissionImage(videoNode, highQualityPreviewUrl);
        },
        "image/jpeg", 0.92);
    } catch (error: any) {
      console.error("[CAPTURE] Main capture process failed:", error);
      setErrorMessage(`Capture failed: ${error.message}`);
      setCameraState("error");
    }
  };

  const handleSubmitPhoto = () => {
    if (!capturedImageId || !window.capturedImages[capturedImageId]) {
      console.error("Submit called but no captured image data found for ID:", capturedImageId);
      setErrorMessage("No photo data to submit.");
      setCameraState("error");
      return;
    }
    const imageData = window.capturedImages[capturedImageId];
    console.log("[SUBMIT] Submitting photo to NLX. ID:", capturedImageId, "Metadata:", imageData.metadata);
    const choiceId = data.captureChoiceId || "photo_captured";
    const photoData = {
      base64: imageData.base64,
      fileName: imageData.metadata.fileName,
      width: imageData.metadata.width,
      height: imageData.metadata.height,
      sizeKB: imageData.metadata.sizeKB,
      captureTime: imageData.metadata.timestamp,
      submitted: true,
      mimeType: imageData.metadata.mimeType,
    };
    const contextData = { capturedPhoto: photoData };
    conversationHandler.sendChoice(choiceId, contextData);
    console.log("[SUBMIT] photo_captured choice sent to NLX.");
    delete window.capturedImages[capturedImageId];
    setCapturedImageId("");
    revokePreviewUrl();
    setCameraState("submitted");
  };

  const handleRetake = () => {
    console.log("Retake requested.");
    if (capturedImageId && window.capturedImages[capturedImageId]) {
      delete window.capturedImages[capturedImageId];
      setCapturedImageId("");
    }
    revokePreviewUrl();
    requestCameraAccess();
  };

  const handleStop = () => {
    console.log("Stop camera requested by user.");
    stopStream();
    revokePreviewUrl();
    if (capturedImageId && window.capturedImages[capturedImageId]) {
      delete window.capturedImages[capturedImageId];
      setCapturedImageId("");
    }
    setCameraState("initial");
    if (data.stopChoiceId) {
      conversationHandler.sendChoice(data.stopChoiceId, {
        cameraStopped: true,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // --- RENDER STATES ---

  if (cameraState === "initial") {
    return (
      <div style={{ paddingTop: '10px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '20px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--outer-border-radius)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', paddingTop: '20px' }}>
          <Icons.Camera size={48} className="text-primary-60" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--primary-80)', marginBottom: '12px' }}>
          {data.title || "Camera Access Required"}
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--primary-60)', marginBottom: '8px' }}>
          {data.message || "This application needs access to your camera."}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--primary-40)', marginBottom: '24px' }}>
          {data.disclaimer || "Camera will only be used for this session."}
        </p>
        <TextButton
          label={data.confirmLabel || "Allow Camera Access"}
          Icon={Icons.Camera}
          onClick={requestCameraAccess}
          type="main"
        />
      </div>
    );
  }

  if (cameraState === "requesting") {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--outer-border-radius)' }}>
        <p style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px' }}>
          Requesting camera access...
        </p>
        <p style={{ color: 'var(--primary-60)' }}>
          Please allow camera access when prompted.
        </p>
      </div>
    );
  }

  if (cameraState === "error") {
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--outer-border-radius)' }}>
        <Icons.Error size={48} className="text-error-primary mb-4" />
        <h2 style={{ fontSize: '24px', fontWeight: '500', color: 'var(--error-primary)', marginBottom: '12px' }}>
          Camera Error
        </h2>
        <p style={{ color: 'var(--error-primary)', marginBottom: '24px' }}>
          {errorMessage}
        </p>
        <TextButton
          label="Try Again"
          Icon={Icons.Refresh}
          onClick={() => {
            setErrorMessage("");
            requestCameraAccess();
          }}
          type="ghost"
        />
      </div>
    );
  }

  if (cameraState === "preview" && capturedImageUrl) {
    return (
      <div style={{ backgroundColor: 'var(--primary-5)', borderRadius: 'var(--outer-border-radius)', overflow: 'hidden', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--primary-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>{data.previewTitle || "Review Photo"}</p>
          <IconButton Icon={Icons.Close} label="Cancel" onClick={handleStop} type="ghost" />
        </div>
        <div style={{ position: 'relative', paddingBottom: '57%' }}>
          <img
            src={capturedImageUrl}
            alt="Captured photo preview"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ padding: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <TextButton label={data.submitLabel || "Use This Photo"} Icon={Icons.Check} onClick={handleSubmitPhoto} type="main" />
          <TextButton label={data.retakeLabel || "Retake"} Icon={Icons.Camera} onClick={handleRetake} type="ghost" />
        </div>
      </div>
    );
  }

  if (cameraState === "streaming") {
    return (
      <div style={{ backgroundColor: 'var(--primary-5)', borderRadius: 'var(--outer-border-radius)', overflow: 'hidden', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--primary-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>{data.streamingTitle || "Camera Active"}</p>
          <IconButton Icon={Icons.Close} label="Stop" onClick={handleStop} type="ghost" />
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'black' }}
          />
        </div>
        {data.enableCapture !== false && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
            <TextButton label={data.captureLabel || "Capture Photo"} Icon={Icons.Camera} onClick={handleCapture} type="main" />
          </div>
        )}
      </div>
    );
  }

  if (cameraState === "submitted") {
    return (
      <div
        style={{
          padding: '20px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--outer-border-radius)',
          minHeight: '250px'
        }}
      >
        {/*
          FIX: Reverting to Icons.Check, which we know exists.
          The 'CheckCircleIcon' was an incorrect guess and caused the crash.
          The animation is removed for now to solve the crash first.
        */}
        <Icons.Check 
          size={60}
          className="text-success-primary mb-6"
        />
        
        <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--primary-80)', marginBottom: '12px', textAlign: 'center' }}>
          Photo Submitted
        </h2>
        
        <p style={{ fontSize: '16px', color: 'var(--primary-60)', textAlign: 'center' }}>
          Thank you. Your photo has been successfully submitted for verification.
        </p>
      </div>
    );
  }

  return null;
};

export default CameraAccessComponent;