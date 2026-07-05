"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          if (!cancelled) video.play().then(() => setReady(true)).catch(() => {});
        };
      })
      .catch(() => setError("Camera access denied. Please allow camera permission and try again."));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      onCapture(blob);
    }, "image/jpeg", 0.92);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="modal-head">
          <h3 className="modal-title">Analyse Your Look</h3>
          <button onClick={onClose} className="modal-close">x</button>
        </div>
        {error ? (
          <p className="modal-error">{error}</p>
        ) : (
          <>
            <video ref={videoRef} className="camera-video" muted playsInline />
            <canvas ref={canvasRef} className="hidden-canvas" />
            <p className="camera-help">
              Position yourself clearly in frame
            </p>
            <button
              onClick={capture}
              disabled={!ready}
              className="capture-button"
            >
              Capture & Analyse
            </button>
          </>
        )}
      </div>
    </div>
  );
}
