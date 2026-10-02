"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";

const DESKTOP_PARTICLE_COUNT = 48;
const MOBILE_PARTICLE_COUNT = 24;

export default function FoamEffect() {
  const rootRef = useRef(null);
  const mistRef = useRef(null);
  const trailRef = useRef(null);
  const particlesRef = useRef([]);

  /*
   * Rastgele değerleri render sırasında üretmiyoruz.
   * Böylece React hydration problemi yaşamıyoruz.
   */
  const particles = useMemo(() => {
    return Array.from(
      { length: DESKTOP_PARTICLE_COUNT },
      (_, index) => ({
        id: index,
      })
    );
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const isMobile = window.innerWidth < 768;

    const activeParticleCount = isMobile
      ? MOBILE_PARTICLE_COUNT
      : DESKTOP_PARTICLE_COUNT;

    const activeParticles = particlesRef.current
      .filter(Boolean)
      .slice(0, activeParticleCount);

    const ctx = gsap.context(() => {
      /* =====================================================
         INITIAL STATES
      ====================================================== */

      gsap.set(mistRef.current, {
        x: -120,
        y: -80,
        scaleX: 0.2,
        scaleY: 0.5,
        rotation: 30,
        opacity: 0,
        transformOrigin: "left center",
      });

      gsap.set(trailRef.current, {
        x: -160,
        y: -130,
        scaleX: 0.3,
        scaleY: 0.5,
        rotation: 28,
        opacity: 0,
        transformOrigin: "left top",
      });

      activeParticles.forEach((particle) => {
        gsap.set(particle, {
          x: gsap.utils.random(-50, 70),
          y: gsap.utils.random(-40, 60),

          scale: gsap.utils.random(0.45, 1),

          opacity: 0,

          rotation: gsap.utils.random(-40, 40),
        });
      });

      /* =====================================================
         MASTER TIMELINE
      ====================================================== */

      const timeline = gsap.timeline({
        delay: 0.65,
      });

      /* =====================================================
         MIST ENTERS
      ====================================================== */

      timeline.to(
        mistRef.current,
        {
          x: isMobile ? 20 : 60,
          y: isMobile ? 10 : 30,

          scaleX: 1,
          scaleY: 1,

          opacity: 0.75,

          duration: 0.45,

          ease: "power3.out",
        },
        0
      );

      /* =====================================================
         FOAM TRAIL
      ====================================================== */

      timeline.to(
        trailRef.current,
        {
          x: isMobile ? -40 : -20,
          y: isMobile ? -20 : -10,

          scaleX: 1,
          scaleY: 1,

          opacity: 0.26,

          duration: 0.75,

          ease: "power2.out",
        },
        0.15
      );

      /* =====================================================
         PARTICLES
      ====================================================== */

      activeParticles.forEach((particle, index) => {
        const progress =
          index / Math.max(activeParticles.length - 1, 1);

        const targetX = isMobile
          ? 100 + progress * 260 + gsap.utils.random(-40, 80)
          : 160 + progress * 680 + gsap.utils.random(-70, 130);

        const targetY = isMobile
          ? 80 + progress * 280 + gsap.utils.random(-60, 70)
          : 100 + progress * 430 + gsap.utils.random(-80, 100);

        timeline.to(
          particle,
          {
            x: targetX,
            y: targetY,

            scale: gsap.utils.random(0.7, 1.65),

            opacity: gsap.utils.random(0.55, 1),

            rotation: gsap.utils.random(-180, 180),

            duration: gsap.utils.random(0.8, 1.4),

            ease: "power2.out",
          },
          0.18 + index * 0.012
        );
      });

      /* =====================================================
         MOVE SPRAY ACROSS HERO
      ====================================================== */

      timeline.to(
        mistRef.current,
        {
          x: isMobile ? 160 : 420,
          y: isMobile ? 130 : 260,

          rotation: 38,

          scaleX: 1.2,

          opacity: 0.45,

          duration: 1.15,

          ease: "power1.inOut",
        },
        0.45
      );

      /* =====================================================
         MIST DISAPPEARS
      ====================================================== */

      timeline.to(
        mistRef.current,
        {
          opacity: 0,

          scaleX: 1.4,

          duration: 0.6,

          ease: "power2.out",
        },
        1.45
      );

      /* =====================================================
         PARTICLES SETTLE
      ====================================================== */

      timeline.to(
        activeParticles,
        {
          y: "+=25",

          opacity: 0.3,

          duration: 1.2,

          stagger: {
            amount: 0.25,
            from: "random",
          },

          ease: "sine.out",
        },
        1.65
      );

      /* =====================================================
         FINAL PARTICLE FADE
      ====================================================== */

      timeline.to(
        activeParticles,
        {
          y: "+=20",

          scale: 0.7,

          opacity: 0,

          duration: 1.4,

          stagger: {
            amount: 0.35,
            from: "random",
          },

          ease: "power2.out",
        },
        2.65
      );

      /* =====================================================
         TRAIL FADE
      ====================================================== */

      timeline.to(
        trailRef.current,
        {
          opacity: 0,

          duration: 1.4,

          ease: "power2.out",
        },
        2.25
      );
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-0
        z-10
        overflow-hidden
      "
    >
      {/* =====================================================
          FOAM TRAIL
      ====================================================== */}

      <div
        ref={trailRef}
        className="
          revora-foam-trail

          absolute
          left-0
          top-0

          h-[420px]
          w-[850px]

          max-md:h-[280px]
          max-md:w-[520px]
        "
      />

      {/* =====================================================
          SPRAY MIST
      ====================================================== */}

      <div
        ref={mistRef}
        className="
          revora-foam-mist

          absolute
          left-0
          top-0

          h-[220px]
          w-[520px]

          max-md:h-[150px]
          max-md:w-[320px]
        "
      />

      {/* =====================================================
          PARTICLES
      ====================================================== */}

      {particles.map((particle, index) => (
        <span
          key={particle.id}
          ref={(element) => {
            particlesRef.current[index] = element;
          }}
          className="
            revora-foam-particle

            absolute
            left-0
            top-0

            h-[18px]
            w-[18px]

            opacity-0
          "
        />
      ))}
    </div>
  );
}