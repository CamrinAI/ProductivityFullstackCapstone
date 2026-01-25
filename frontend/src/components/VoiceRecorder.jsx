import React, { useState, useRef } from 'react';
import { Mic, X, Send, Check, AlertCircle } from 'lucide-react';

/**
 * VoiceRecorder Component
 * 
 * Modal interface for recording audio and sending to voice-to-inventory API.
 * Flow: Record audio → Send to backend → Whisper transcription → GPT-4o parsing → Database update
 * 
 * Displays:
 * - Recording button with visual feedback
 * - Parsed result (item name, quantity, action)
 * - Original transcript from Whisper
 * - Error handling with user feedback
 */
export default function VoiceRecorder({ onClose, onUpdate }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Browser MediaRecorder API refs for audio capture
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Initialize microphone and start recording
  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      setResult(null);
      
      // Request microphone access with audio enhancement options
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect audio data chunks as recording progresses
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstart = () => setRecording(true);
      mediaRecorder.onstop = () => setRecording(false);

      mediaRecorder.start();
    } catch (err) {
      setError(`Microphone error: ${err.message}`);
      console.error(err);
    }
  };

  // Stop recording and release microphone
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Send recorded audio to backend for processing
  const submitAudio = async () => {
    if (chunksRef.current.length === 0) {
      setError('No audio recorded');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Create blob and form data for multipart upload
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Send to backend voice endpoint
      const response = await fetch(
        `http://localhost:3000/api/voice/update`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.success) {
        // Display parsed result to user
        setResult({
          status: 'success',
          item: data.item,
          action: data.action,
          quantity: data.quantity,
          type: data.type
        });
        setTranscript(data.transcript);
        onUpdate?.();  // Refresh asset list
        setTimeout(onClose, 3000);  // Auto-close after success
      } else {
        setError(data.error || 'Failed to process audio');
      }
    } catch (err) {
      setError(`Request failed: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearRecording = () => {
    chunksRef.current = [];
    setTranscript('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🎤 Voice Update</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Recording Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={loading}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition transform hover:scale-105 ${
              recording
                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700'
            } disabled:opacity-50 text-white shadow-lg`}
          >
            <Mic className="w-10 h-10" />
          </button>
        </div>

        {/* Recording Indicator */}
        {recording && (
          <div className="text-center mb-6">
            <p className="text-red-400 font-semibold animate-pulse">● Recording...</p>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-300">Success!</span>
            </div>
            <p className="text-sm text-green-300 mb-2">{result.item}</p>
            <p className="text-xs text-gray-400">
              {result.action === 'add' ? '➕' : '➖'} {result.quantity} {result.type}
            </p>
          </div>
        )}

        {transcript && (
          <div className="mb-6 p-3 bg-gray-700/50 rounded border border-gray-600">
            <p className="text-xs text-gray-400 mb-1">Transcript:</p>
            <p className="text-sm text-gray-300">"{transcript}"</p>
          </div>
        )}

        {/* Controls */}
        {chunksRef.current.length > 0 && !loading && !result && (
          <div className="space-y-3">
            <button
              onClick={submitAudio}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded font-semibold transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Process Audio
            </button>
            <button
              onClick={clearRecording}
              className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-semibold transition"
            >
              Clear
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center flex flex-col items-center gap-3">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/40 animate-[spin_1.2s_linear_infinite]"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse" />
              <Mic className="absolute inset-0 m-auto w-6 h-6 text-white" />
            </div>
            <p className="text-gray-300 text-sm">Whisper transcribing...</p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-6">
          💡 Try: "Add 5 spools of wire" or "Check out drill kit"
        </p>
      </div>
    </div>
  );
}
