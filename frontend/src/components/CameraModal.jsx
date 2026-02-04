import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';

/**
 * CameraModal - Capture photos using device camera
 * Requests camera permission and allows taking photos of tools/equipment
 */
export default function CameraModal({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      requestCameraPermission();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer back camera
        audio: false
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera permission error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Unable to access camera: ' + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  const retake = () => {
    setCapturedImage(null);
    requestCameraPermission();
  };

  const confirm = () => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage);
    }
    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError('');
    setHasPermission(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Take Photo</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-700 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error ? (
            <div className="text-center py-12">
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm">
                {error}
              </div>
              <button
                onClick={requestCameraPermission}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : capturedImage ? (
            <div className="space-y-4">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded-lg"
              />
              <div className="flex gap-3">
                <button
                  onClick={retake}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake
                </button>
                <button
                  onClick={confirm}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  <Check className="w-4 h-4" />
                  Use Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!hasPermission && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Requesting camera access...</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={capturePhoto}
                disabled={!hasPermission}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
              >
                <Camera className="w-4 h-4" />
                Capture Photo
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
