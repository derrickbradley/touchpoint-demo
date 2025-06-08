// src/components/CameraAccess/CameraAccessComponent.tsx
import { React, type CustomModalityComponent, BaseText } from '@nlxai/touchpoint-ui'; // Added BaseText for identifying state
import { CameraAccessData, CameraState, IdentifiedPlant, CapturedImageData } from './types';
import { useCameraStream, CameraStreamControls } from './useCameraStream';
import { usePlantIdentifier, PlantIdentifierControls } from './usePlantIdentifier';

// Import screen components
import { InitialScreen } from './initialScreen';
import { RequestingScreen } from './requestingScreen';
import { StreamingScreen } from './streamingScreen';
import { PreviewScreen } from './previewScreen';
import { SubmittedScreen } from './submittedScreen';
import { ErrorScreen } from './errorScreen';

const { useState, useEffect, useCallback } = React;

const SUBMISSION_FLAG_KEY = 'cameraAccessComponent_hasSubmittedInSession';

const ProductFinderComponent: CustomModalityComponent<CameraAccessData> = ({
  data,
  conversationHandler,
}) => {
  const [cameraState, setCameraState] = useState<CameraState>("initial");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string>("");
  const [lastCapturedImageForApi, setLastCapturedImageForApi] = useState<CapturedImageData | null>(null); // Image sent to/used by API

  const [hasSubmittedPhotoInSession, setHasSubmittedPhotoInSession] = useState<boolean>(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem(SUBMISSION_FLAG_KEY) === 'true';
    return false;
  });

  // Effect to handle reset flag from NLX data prop (optional)
  // useEffect(() => {
  //   if (data.resetSubmissionFlag && typeof window !== 'undefined') {
  //     if (sessionStorage.getItem(SUBMISSION_FLAG_KEY)) {
  //       console.log("[FLAG] Resetting submission flag.");
  //       sessionStorage.removeItem(SUBMISSION_FLAG_KEY);
  //       setHasSubmittedPhotoInSession(false);
  //       setErrorMessage(""); 
  //       if (cameraState === "initial" || cameraState === "error" || cameraState === "submitted") {
  //         setCameraState("initial"); // Ensure it goes to initial if reset
  //       }
  //     }
  //   }
  // }, [data.resetSubmissionFlag, cameraState]);


  const cameraStreamHook: CameraStreamControls = useCameraStream({
    data,
    onStreamStart: () => {
        console.log("[Orchestrator] Stream started, setting state to streaming.");
        setCameraState("streaming");
    },
    onAccessError: (error) => {
      console.error("[Orchestrator] Camera access error from hook:", error);
      setErrorMessage(error.message || "Unable to access camera.");
      setCameraState("error");
      if (data.accessDeniedChoiceId) {
        conversationHandler.sendChoice(data.accessDeniedChoiceId, {
            cameraAccessDenied: true,
            errorMessage: error.message,
            timestamp: new Date().toISOString(),
        });
      }
    },
  });

  const plantIdentifierHook: PlantIdentifierControls = usePlantIdentifier({
    identificationApiUrl: data.identificationApiUrl,
  });

  const revokePreview = useCallback(() => {
    if (previewBlobUrl && previewBlobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl("");
      console.log("[Orchestrator] Preview Blob URL revoked.");
    }
  }, [previewBlobUrl]);

  useEffect(() => { // Main cleanup for stream and preview URL
    return () => {
      console.log("[Orchestrator] Component unmounting or stream hook re-running: stopping stream and revoking preview.");
      cameraStreamHook.stopStream();
      revokePreview();
    };
  }, [cameraStreamHook.stopStream, revokePreview]); // Ensure these are stable references from hooks

  // Initialize global capturedImages if not present (though this is better in a top-level app init)
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.capturedImages) {
      window.capturedImages = {};
      // Define global getters if needed elsewhere, or manage capturedImages entirely within this component/hooks
      window.getCapturedImage = (imageId: string) => window.capturedImages[imageId] || null;
      window.getLastCapturedImage = () => {
        const ids = Object.keys(window.capturedImages);
        return ids.length > 0 ? window.capturedImages[ids[ids.length - 1]] : null;
      };
    }
  }, []);


  const handleRequestAccess = async () => {
    if (hasSubmittedPhotoInSession && cameraState === "initial") {
        console.log("[Orchestrator] Access attempt while submitted flag is true. No action.");
        // Message is handled by InitialScreen based on hasSubmitted
        return;
    }
    setErrorMessage("");
    setCameraState("requesting");
    revokePreview();
    setLastCapturedImageForApi(null);
    plantIdentifierHook.clearIdentification();

    console.log("[Orchestrator] Calling requestAccess from hook.");
    const stream = await cameraStreamHook.requestAccess(); // Hook now sets state via onStreamStart/onAccessError
    if (stream && data.accessGrantedChoiceId) {
      conversationHandler.sendChoice(data.accessGrantedChoiceId, {
        cameraAccessGranted: true,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleIdentify = async () => {
    if (!cameraStreamHook.streamActive || !data.identificationApiUrl) {
        setErrorMessage("Camera not active or identification not configured.");
        setCameraState("error"); // or back to streaming with a message
        return;
    }
    revokePreview();
    setLastCapturedImageForApi(null);
    plantIdentifierHook.clearIdentification();
    setCameraState("identifying");

    const frameData = await cameraStreamHook.captureFrame({
      outputWidth: 640, // Optimized for API
      outputHeight: 480,
      format: 'image/jpeg',
      quality: 0.7, // Quality for the image sent to API
    });

    if (frameData && frameData.blob) {
      const currentPreviewUrl = URL.createObjectURL(frameData.blob);
      setPreviewBlobUrl(currentPreviewUrl); // Show what's being identified

      const imageForApi: CapturedImageData = {
          base64: frameData.base64String,
          metadata: {
              timestamp: new Date().toISOString(),
              width: 640, // Assuming these were the canvas dimensions for captureFrame
              height: 480,
              sizeKB: Math.round((frameData.base64String.length * 0.75) / 1024),
              fileName: `identification-${Date.now()}.jpg`,
              mimeType: 'image/jpeg',
          }
      };
      setLastCapturedImageForApi(imageForApi); // Store image that was sent

      try {
        console.log("[Orchestrator] Calling identifyPlant from hook.");
        const plant = await plantIdentifierHook.identifyPlant(imageForApi.base64, imageForApi.metadata.mimeType);
        if (plant) {
          setCameraState("preview");
        } else {
          // identifyPlant hook sets its own identifiedPlant to null on failure
          setErrorMessage("Could not identify a plant from the image. Please try a different angle or photo.");
          setCameraState("preview"); // Go to preview to show the image and error/retry options
        }
      } catch (error: any) {
        console.error("[Orchestrator] Identification process error:", error);
        setErrorMessage(`Identification error: ${error.message}`);
        setCameraState("preview"); // Go to preview to show image and allow retake
      }
    } else {
      setErrorMessage("Failed to capture image for identification.");
      setCameraState(cameraStreamHook.streamActive ? "streaming" : "error");
    }
  };

  const handleConfirmIdentification = () => {
    if (!plantIdentifierHook.identifiedPlant || !lastCapturedImageForApi) {
      setErrorMessage("No valid identification to submit.");
      setCameraState("error");
      return;
    }
    const choiceId = data.identificationChoiceId || "plant_identified_confirmed";
    const contextData = {
      identifiedPlantInfo: {
        name: plantIdentifierHook.identifiedPlant.name,
        confidence: plantIdentifierHook.identifiedPlant.confidence,
      },
      capturedPhoto: lastCapturedImageForApi // Send the image that was identified
    };
    try {
      console.log("[Orchestrator] Sending confirmed identification to NLX:", choiceId);
      conversationHandler.sendChoice(choiceId, contextData);
      if (typeof window !== 'undefined') sessionStorage.setItem(SUBMISSION_FLAG_KEY, 'true');
      setHasSubmittedPhotoInSession(true);
      setCameraState("submitted");
      revokePreview();
      setLastCapturedImageForApi(null);
      plantIdentifierHook.clearIdentification();
      cameraStreamHook.stopStream(); // Stop stream after successful submission
    } catch (error: any) {
      console.error("[Orchestrator] Error submitting identification:", error);
      setErrorMessage(`Submission failed: ${error.message}`);
      setCameraState("error");
    }
  };

  const handleActualRetakePhoto = () => { // Renamed to avoid conflict if passed down
    revokePreview();
    setLastCapturedImageForApi(null);
    plantIdentifierHook.clearIdentification();
    setErrorMessage("");
    if (!cameraStreamHook.streamActive) {
        console.log("[Orchestrator] Retake: Stream not active, requesting access.");
        handleRequestAccess(); // This will eventually set state to "streaming"
    } else {
        console.log("[Orchestrator] Retake: Stream active, setting state to streaming.");
        setCameraState("streaming"); // Go back to live camera view
    }
  };
  
  const handleStop = () => {
    cameraStreamHook.stopStream();
    revokePreview();
    setLastCapturedImageForApi(null);
    plantIdentifierHook.clearIdentification();
    setErrorMessage("");
    setCameraState("initial"); // Always go back to initial on a full stop/cancel
    if (data.stopChoiceId) {
      conversationHandler.sendChoice(data.stopChoiceId, {
        cameraStopped: true,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // --- Render correct screen based on cameraState ---
  switch (cameraState) {
    case "initial":
      return <InitialScreen
                data={data}
                onAllowAccess={handleRequestAccess}
                hasSubmitted={hasSubmittedPhotoInSession}
              />;
    case "requesting":
      return <RequestingScreen data={data} />;
    case "streaming":
      return <StreamingScreen
                videoRef={cameraStreamHook.videoRef}
                data={data}
                onStop={handleStop}
                onIdentify={handleIdentify}
                isIdentifying={plantIdentifierHook.isIdentifying}
              />;
    case "identifying":
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--outer-border-radius)' }}>
          {previewBlobUrl && 
            <img 
                src={previewBlobUrl} 
                alt="Identifying..." 
                style={{maxWidth: '80%', maxHeight: '250px', marginBottom: '20px', borderRadius: '8px', objectFit: 'contain'}}
            />}
          <BaseText style={{ fontSize: '18px', color: 'var(--primary-70)' }}>Identifying plant, please wait...</BaseText>
          {/* Optional: Add a spinner/loader icon here */}
        </div>
      );
    case "preview":
      return <PreviewScreen
                previewImageUrl={previewBlobUrl}
                identifiedPlant={plantIdentifierHook.identifiedPlant}
                isIdentifying={plantIdentifierHook.isIdentifying} // For re-identify button state
                data={data}
                onConfirm={handleConfirmIdentification}
                onRetake={handleActualRetakePhoto}
                onStop={handleStop}
                onReIdentifyThisImage={ async () => {
                    if (lastCapturedImageForApi && data.identificationApiUrl) {
                        setCameraState("identifying"); // Show loading state for re-identification
                        try {
                            // identifyPlant hook sets its own identifiedPlant state
                            await plantIdentifierHook.identifyPlant(lastCapturedImageForApi.base64, lastCapturedImageForApi.metadata.mimeType);
                            setCameraState("preview"); // Back to preview with new/same results
                        } catch (error: any) {
                            setErrorMessage(`Re-identification failed: ${error.message}`);
                            setCameraState("preview"); // Stay in preview but show error, or go to error state
                        }
    } else {
        setErrorMessage("No image data to re-identify.");
    }
                }}
              />;
    case "submitted":
      return <SubmittedScreen data={data} />;
    case "error":
      return <ErrorScreen
                errorMessage={errorMessage}
                onTryAgain={() => { // "Try Again" from error state
                    setErrorMessage("");
                    if (hasSubmittedPhotoInSession) {
                        // If already submitted, "Try Again" might not mean re-enable camera
                        // It depends on the error context. For now, go to initial.
                        setCameraState("initial");
                    } else {
                        // Try to go back to a sensible previous state or restart
                        // If error happened during identification, retake might be appropriate
                        handleActualRetakePhoto();
                    }
                }}
              />;
    default:
      console.error("Unknown camera state:", cameraState);
      return null;
  }
};

export default ProductFinderComponent;