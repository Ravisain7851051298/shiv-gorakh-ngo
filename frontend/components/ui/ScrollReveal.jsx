"use client";

/**
 * ScrollReveal.jsx — Reusable scroll-triggered animation wrapper
 * Used across home page sections for consistent, premium reveal effects
 */

import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";

// Variant presets
const VARIANTS = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
};

export default function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.7,
  once = true,
  margin = "-60px",
  className = "",
  as: Tag = "div",
}) {
  const reduceMotion = useReducedMotion();

  const selected = VARIANTS[variant] || VARIANTS.fadeUp;

  const MotionTag = motion[Tag] || motion.div;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionTag
      variants={selected}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

// Stagger container — wraps children with cascade effect
export function StaggerReveal({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  once = true,
  margin = "-50px",
  className = "",
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay, delayChildren: initialDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger child item
export function StaggerItem({
  children,
  variant = "fadeUp",
  className = "",
}) {
  const selected = VARIANTS[variant] || VARIANTS.fadeUp;
  return (
    <motion.div
      variants={selected}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
