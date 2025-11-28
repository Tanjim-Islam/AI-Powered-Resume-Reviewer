"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const fadeInUp = (element: HTMLElement, delay: number = 0) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      ease: "power2.out",
    }
  );
};

export const staggerChildren = (
  container: HTMLElement,
  delay: number = 0.1
) => {
  const children = Array.from(container.children);

  gsap.set(children, { opacity: 0, y: 30 });

  return gsap.to(children, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: delay,
    ease: "power2.out",
  });
};

export const scaleIn = (element: HTMLElement, delay: number = 0) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 0.8,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      delay,
      ease: "back.out(1.7)",
    }
  );
};

export const slideInLeft = (element: HTMLElement, delay: number = 0) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      x: -50,
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.6,
      delay,
      ease: "power2.out",
    }
  );
};

export const slideInRight = (element: HTMLElement, delay: number = 0) => {
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      x: 50,
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.6,
      delay,
      ease: "power2.out",
    }
  );
};

export const counterAnimation = (
  element: HTMLElement,
  endValue: number,
  duration: number = 2
) => {
  const startValue = 0;

  return gsap.fromTo(
    element,
    { textContent: startValue },
    {
      textContent: endValue,
      duration,
      ease: "power2.out",
      snap: { textContent: 1 },
      onUpdate: function () {
        element.textContent = String(Math.round(this.targets()[0].textContent));
      },
    }
  );
};

export const progressBarAnimation = (
  element: HTMLElement,
  percentage: number,
  duration: number = 1.5
) => {
  return gsap.fromTo(
    element,
    { width: "0%" },
    {
      width: `${percentage}%`,
      duration,
      ease: "power2.out",
    }
  );
};

export const textReveal = (element: HTMLElement, delay: number = 0) => {
  const text = element.textContent || "";
  element.innerHTML = text
    .split("")
    .map(
      (char) =>
        `<span class="inline-block">${char === " " ? "&nbsp;" : char}</span>`
    )
    .join("");

  const spans = element.querySelectorAll("span");

  gsap.set(spans, { opacity: 0, y: 20 });

  return gsap.to(spans, {
    opacity: 1,
    y: 0,
    duration: 0.05,
    stagger: 0.02,
    delay,
    ease: "power2.out",
  });
};

export const parallaxScroll = (element: HTMLElement, speed: number = 0.5) => {
  return gsap.to(element, {
    yPercent: -50 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
};

export const createScrollTrigger = (
  element: HTMLElement,
  animation: gsap.core.Timeline | gsap.core.Tween,
  options: ScrollTrigger.StaticVars = {}
) => {
  return ScrollTrigger.create({
    trigger: element,
    start: "top 80%",
    end: "bottom 20%",
    animation,
    toggleActions: "play none none reverse",
    ...options,
  });
};

export const respectReducedMotion = () => {
  if (typeof window !== "undefined") {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.globalTimeline.timeScale(0.1);
    }
  }
};

// Initialize animations on page load
export const initPageAnimations = () => {
  if (typeof window === "undefined") return;

  respectReducedMotion();

  // Animate elements with data-animate attribute
  const animatedElements = document.querySelectorAll("[data-animate]");

  animatedElements.forEach((element, index) => {
    const animationType = element.getAttribute("data-animate");
    const delay = parseFloat(element.getAttribute("data-delay") || "0");

    switch (animationType) {
      case "fadeInUp":
        fadeInUp(element as HTMLElement, delay);
        break;
      case "scaleIn":
        scaleIn(element as HTMLElement, delay);
        break;
      case "slideInLeft":
        slideInLeft(element as HTMLElement, delay);
        break;
      case "slideInRight":
        slideInRight(element as HTMLElement, delay);
        break;
      case "textReveal":
        textReveal(element as HTMLElement, delay);
        break;
      default:
        fadeInUp(element as HTMLElement, delay);
    }
  });

  // Animate elements with data-stagger attribute
  const staggerContainers = document.querySelectorAll("[data-stagger]");

  staggerContainers.forEach((container) => {
    const delay = parseFloat(
      container.getAttribute("data-stagger-delay") || "0.1"
    );
    staggerChildren(container as HTMLElement, delay);
  });
};

// Cleanup function
export const cleanupAnimations = () => {
  if (typeof window !== "undefined") {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
};
