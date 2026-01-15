"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  href,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg";

  const variants = {
    primary:
      "bg-white text-black hover:bg-gray-200 active:bg-gray-300",
    secondary:
      "bg-bg-secondary text-white border border-border-color hover:bg-bg-card",
    outline:
      "bg-transparent text-white border border-border-color hover:bg-white/5",
    ghost: "bg-transparent text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </Component>
  );
}

export function IconButton({
  children,
  className,
  onClick,
  href,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center w-10 h-10 rounded-lg",
        "bg-transparent text-text-secondary hover:text-white hover:bg-white/5",
        "transition-colors duration-200",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </Component>
  );
}

