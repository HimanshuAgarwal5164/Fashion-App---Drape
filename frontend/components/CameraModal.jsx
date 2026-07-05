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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, width: 360, maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Analyse Your Look</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>x</button>
        </div>
        {error ? (
          <p style={{ color: "#dc2626", fontSize: 13, textAlign: "center", padding: "20px 0" }}>{error}</p>
        ) : (
          <>
            <video ref={videoRef} style={{ width: "100%", borderRadius: 12, background: "#000", display: "block" }} muted playsInline />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: "10px 0" }}>
              Position yourself clearly in frame
            </p>
            <button
              onClick={capture}
              disabled={!ready}
              style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: ready ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#c7d2fe", color: "#fff", fontSize: 14, fontWeight: 700, cursor: ready ? "pointer" : "not-allowed" }}
            >
              Capture & Analyse
            </button>
          </>
        )}
      </div>
    </div>
  );
}
