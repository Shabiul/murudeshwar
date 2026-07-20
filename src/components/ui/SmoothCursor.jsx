import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const defaultSpringConfig = {
  damping: 45,
  stiffness: 400,
  mass: 1,
  restDelta: 0.001,
};

export function SmoothCursor({
  springConfig = defaultSpringConfig,
  cursor = null
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Position of mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics springs
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Rotation and scale based on speed
  const [rotation, setRotation] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const hoverCapable = window.matchMedia('(hover: hover)').matches;
      setIsTouchDevice(coarsePointer || !hoverCapable);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);

    if (isTouchDevice) return;

    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX);
      mouseY.set(clientY);

      if (!isVisible) setIsVisible(true);

      // Physics trailing distortion (stretch cursor slightly based on velocity)
      const dx = clientX - lastX;
      const dy = clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Rotation angle
      if (speed > 1) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        setRotation(angle);
      }

      // Stretch amount (limit to reasonable range)
      const stretch = Math.min(speed * 0.015, 0.4);
      setScaleX(1 + stretch);
      setScaleY(1 - stretch * 0.5);

      lastX = clientX;
      lastY = clientY;
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    // Detect hovers on interactive components
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.closest('.interactive-cursor')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('resize', checkTouch);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible, isTouchDevice]);

  // Hide custom cursor on mobile/touch screens
  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Global CSS to hide default cursor and keep text cursor on inputs */}
      <style dangerouslySetInnerHTML={{ __html: `
        * {
          cursor: none !important;
        }
        input, textarea, select, [contenteditable="true"] {
          cursor: text !important;
        }
      `}} />

      {/* Main physics cursor */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          rotate: rotation,
          scaleX: isClicked ? 0.8 : isHovered ? 1.5 : scaleX,
          scaleY: isClicked ? 0.8 : isHovered ? 1.5 : scaleY,
        }}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] flex items-center justify-center transition-colors duration-200"
      >
        {cursor ? (
          cursor
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Outer ring */}
            <div className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
              isHovered
                ? 'border-brand-gold bg-brand-gold/10 scale-110'
                : 'border-brand-gold/70 dark:border-brand-gold/60'
            }`} />
            
            {/* Inner dot */}
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isHovered ? 'bg-brand-gold scale-0' : 'bg-brand-gold'
            }`} />
          </div>
        )}
      </motion.div>
    </>
  );
}
