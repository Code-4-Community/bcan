// PixelationTransition.jsx
import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

const PixelationTransition = ({ children, trigger }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (trigger && containerRef.current) {
      // Capture the current view as an image
      html2canvas(containerRef.current).then((capturedCanvas) => {
        setAnimating(true);
        runPixelationAnimation(capturedCanvas);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const runPixelationAnimation = (capturedCanvas) => {
    const canvasOverlay = canvasRef.current;
    const ctx = canvasOverlay.getContext('2d');
    const { width, height } = capturedCanvas;
    canvasOverlay.width = width;
    canvasOverlay.height = height;

    // Animation parameters
    const startPixelSize = 32; // start with very large blocks
    const endPixelSize = 1; // full resolution (1:1 pixels)
    const duration = 2000; // total duration in ms
    const steps = 20; // number of discrete steps
    const stepTime = duration / steps;
    let currentStep = 0;

    const animateStep = () => {
      // Interpolate the pixel size for the current step
      const progress = currentStep / steps;
      // Linear interpolation: large pixel size at start, then down to 1
      const pixelSize = Math.floor(startPixelSize * (1 - progress) + endPixelSize * progress);
      
      // Clear the overlay canvas
      ctx.clearRect(0, 0, width, height);
      
      // Create an offscreen temporary canvas to draw a low-res version
      const tempCanvas = document.createElement('canvas');
      const tCtx = tempCanvas.getContext('2d');
      const scaledWidth = Math.max(1, Math.floor(width / pixelSize));
      const scaledHeight = Math.max(1, Math.floor(height / pixelSize));
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      
      // Draw the captured image scaled down
      tCtx.drawImage(capturedCanvas, 0, 0, scaledWidth, scaledHeight);
      
      // Draw the low-res image scaled up to fill the overlay canvas
      ctx.imageSmoothingEnabled = false; // force nearest-neighbor scaling for a blocky look
      ctx.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height);
      
      currentStep++;
      if (currentStep <= steps) {
        setTimeout(animateStep, stepTime);
      } else {
        // Animation complete – remove the overlay
        setAnimating(false);
      }
    };

    animateStep();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef}>{children}</div>
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
          }}
        />
      )}
    </div>
  );
};

export default PixelationTransition;
