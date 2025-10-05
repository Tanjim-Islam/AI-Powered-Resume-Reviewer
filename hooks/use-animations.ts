"use client";

import { useEffect, useRef } from "react";
import { initPageAnimations, cleanupAnimations } from "@/lib/animations";

export function useAnimations() {
  useEffect(() => {
    // Initialize animations after component mounts
    const timer = setTimeout(() => {
      initPageAnimations();
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanupAnimations();
    };
  }, []);
}

export function useAnimationRef<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    return () => {
      cleanupAnimations();
    };
  }, []);

  return ref;
}
