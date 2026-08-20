import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  shortcut?: string[];
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export function Tooltip({
  children,
  content,
  shortcut,
  position = "top",
  delay = 200,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Position-wise tailwind dynamic styling classes
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-2.5";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 mt-2.5";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-2.5";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-2.5";
      default:
        return "bottom-full left-1/2 -translate-x-1/2 mb-2.5";
    }
  };

  // Define scale/position offsets for motion entry animations
  const getAnimationProps = () => {
    switch (position) {
      case "top":
        return { initial: { opacity: 0, y: 4, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 4, scale: 0.95 } };
      case "bottom":
        return { initial: { opacity: 0, y: -4, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -4, scale: 0.95 } };
      case "left":
        return { initial: { opacity: 0, x: 4, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: 4, scale: 0.95 } };
      case "right":
        return { initial: { opacity: 0, x: -4, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: -4, scale: 0.95 } };
    }
  };

  return (
    <div
      id="custom-tooltip-wrapper"
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id="custom-tooltip-content"
            {...getAnimationProps()}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className={`absolute z-[110] pointer-events-none w-max max-w-xs ${getPositionClasses()}`}
          >
            {/* Tooltip Card */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-lg shadow-lg px-3 py-2 text-[11px] leading-relaxed flex flex-col gap-1.5 font-sans">
              <div className="font-medium text-slate-100 flex items-center justify-between gap-3 text-left">
                <span>{content}</span>
              </div>
              
              {shortcut && shortcut.length > 0 && (
                <div className="flex items-center gap-1 mt-0.5 border-t border-slate-800 pt-1.5">
                  <span className="text-[9px] text-slate-400 select-none uppercase font-semibold">Atalho:</span>
                  <div className="flex items-center gap-1 font-mono">
                    {shortcut.map((key, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="text-slate-500 font-sans text-[10px]">+</span>}
                        <kbd className="bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md min-w-[14px] text-center select-none shadow-xs uppercase">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Micro Arrow indicator */}
            <div
              className={`absolute w-1.5 h-1.5 bg-slate-900 border-slate-800 rotate-45 pointer-events-none ${
                position === "top"
                  ? "top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b"
                  : position === "bottom"
                  ? "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-l border-t"
                  : position === "left"
                  ? "left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-r border-t"
                  : "right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-l border-b"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
