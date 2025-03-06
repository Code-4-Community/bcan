import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import html2canvas from 'html2canvas';

import { observer } from "mobx-react-lite";
import Account from "../Account";
import { useAuthContext } from "../context/auth/authContext";
import GrantPage from "../grant-info/components/GrantPage";
import Login from "../Login";
import Register from "../Register";

const AnimatedRoutes = observer(() => {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      html2canvas(containerRef.current).then((capturedCanvas: HTMLCanvasElement) => {
        setAnimating(true);
        runPixelationAnimation(capturedCanvas);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const runPixelationAnimation = (capturedCanvas: HTMLCanvasElement) => {
    const canvasOverlay = canvasRef.current;
    if (!canvasOverlay) return;
    const ctx = canvasOverlay.getContext('2d');
    if (!ctx) return;
    const width = capturedCanvas.width;
    const height = capturedCanvas.height;
    canvasOverlay.width = width;
    canvasOverlay.height = height;

    // Animation settings
    const startPixelSize = 32; // Starting with large pixel clusters
    const endPixelSize = 1;    // Ending at full resolution
    const duration = 2000;     // Total duration in ms
    const steps = 20;          // Number of discrete steps
    const stepTime = duration / steps;
    let currentStep = 0;

    const animateStep = () => {
      const progress = currentStep / steps;
      // Linear interpolation of pixel size
      const pixelSize = Math.floor(startPixelSize * (1 - progress) + endPixelSize * progress);

      // Clear the overlay
      ctx.clearRect(0, 0, width, height);

      // Create an offscreen canvas to draw a low-res version
      const tempCanvas = document.createElement('canvas');
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return;
      const scaledWidth = Math.max(1, Math.floor(width / pixelSize));
      const scaledHeight = Math.max(1, Math.floor(height / pixelSize));
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;

      // Draw the captured image scaled down
      tCtx.drawImage(capturedCanvas, 0, 0, scaledWidth, scaledHeight);

      // Disable smoothing to get a true pixelated look
      ctx.imageSmoothingEnabled = false;
      // Draw the low-res image scaled up to fill the overlay
      ctx.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height);

      currentStep++;
      if (currentStep <= steps) {
        setTimeout(animateStep, stepTime);
      } else {
        setAnimating(false);
      }
    };

    animateStep();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <Routes location={location}>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/account" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/account" /> : <Register />}
        />
        <Route
          path="/account"
          element={isAuthenticated ? <Account /> : <Navigate to="/login" />}
        />
        <Route path="/grant-info" element={<GrantPage />} />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/account" : "/login"} />}
        />
      </Routes>
      {animating && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      )}
    </div>
  );
});

export default AnimatedRoutes;
