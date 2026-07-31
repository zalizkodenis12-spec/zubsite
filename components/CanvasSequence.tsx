"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";

interface CanvasSequenceProps {
  frameCount: number;
  imagePathPrefix: string;
  imagePathSuffix: string;
}

export default function CanvasSequence({
  frameCount,
  imagePathPrefix,
  imagePathSuffix,
}: CanvasSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Hook into Framer Motion's scroll progression
  const { scrollYProgress } = useScroll();
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, frameCount]);

  // Preload all images on mount
  useEffect(() => {
    let isCancelled = false;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    const onImageLoad = () => {
      if (isCancelled) return;
      loadedCount++;
      setLoadingProgress(Math.round((loadedCount / frameCount) * 100));
      
      if (loadedCount === frameCount) {
        setIsLoaded(true);
      }
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, "0");
      img.src = `${imagePathPrefix}${paddedIndex}${imagePathSuffix}`;
      
      img.onload = onImageLoad;
      img.onerror = onImageLoad; // Continue even if one fails
      
      loadedImages.push(img);
    }
    
    setImages(loadedImages);

    return () => {
      isCancelled = true;
    };
  }, [frameCount, imagePathPrefix, imagePathSuffix]);

  // Core drawing logic supporting high-DPI (Retina) and "object-fit: cover" behavior
  const drawImage = (index: number) => {
    if (!canvasRef.current || images.length === 0 || !images[index - 1]) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    
    const img = images[index - 1];
    if (!img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    // We use the CSS dimensions of the canvas element
    const rect = canvas.getBoundingClientRect();
    
    const targetWidth = rect.width * dpr;
    const targetHeight = rect.height * dpr;

    // Resize canvas internal buffer only if needed to avoid expensive reallocation
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    
    // Mathematical equivalent to "object-fit: cover"
    const hRatio = targetWidth / img.width;
    const vRatio = targetHeight / img.height;
    const ratio = Math.max(hRatio, vRatio);
    
    const renderWidth = img.width * ratio;
    const renderHeight = img.height * ratio;
    
    const centerShiftX = (targetWidth - renderWidth) / 2;
    const centerShiftY = (targetHeight - renderHeight) / 2;

    // Draw the scaled and centered image
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      centerShiftX, centerShiftY, renderWidth, renderHeight
    );
  };

  // Re-draw when index changes via scroll
  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (isLoaded) {
      drawImage(Math.round(latest));
    }
  });

  // Initial draw & handle window resizing
  useEffect(() => {
    if (!isLoaded) return;
    
    const drawCurrentFrame = () => drawImage(Math.round(frameIndex.get()) || 1);
    
    // Draw immediately when loaded
    drawCurrentFrame();
    
    // Redraw on resize to fix pixelation or wrong dimensions
    window.addEventListener("resize", drawCurrentFrame);
    return () => window.removeEventListener("resize", drawCurrentFrame);
  }, [isLoaded, frameIndex]);

  return (
    <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 font-sans tracking-widest text-sm uppercase z-10">
          <div className="mb-2">Loading Sequence</div>
          <div>{loadingProgress}%</div>
        </div>
      )}
      
      {/* 
        The canvas uses width/height 100% to fill the CSS container.
        Its internal resolution is handled in JS via canvas.width/height * dpr 
      */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
