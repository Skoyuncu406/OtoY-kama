"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import gsap from "gsap";

/* =========================================================
   CONFIG
========================================================= */

const DESKTOP_PARTICLE_COUNT = 48;
const MOBILE_PARTICLE_COUNT = 24;

/* =========================================================
   FOAM EFFECT
========================================================= */

export default function FoamEffect() {
  const rootRef = useRef(null);

  const mistRef = useRef(null);
  const trailRef = useRef(null);

  const particlesRef = useRef([]);

  /* =======================================================
     PARTICLE DATA
  ======================================================== */

  const particles = useMemo(() => {
    return Array.from(
      {
        length: DESKTOP_PARTICLE_COUNT,
      },
      (_, index) => ({
        id: index,
      })
    );
  }, []);

  /* =======================================================
     GSAP ANIMATION
  ======================================================== */

  useLayoutEffect(() => {
    const root = rootRef.current;
    const mist = mistRef.current;
    const trail = trailRef.current;

    if (!root || !mist || !trail) {
      return;
    }

    /* -----------------------------------------------------
       ACCESSIBILITY
    ------------------------------------------------------ */

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      return;
    }

    /* -----------------------------------------------------
       RESPONSIVE SETTINGS
    ------------------------------------------------------ */

    const isMobile = window.innerWidth < 768;

    const activeParticleCount = isMobile
      ? MOBILE_PARTICLE_COUNT
      : DESKTOP_PARTICLE_COUNT;

    const allParticles =
      particlesRef.current.filter(Boolean);

    const activeParticles =
      allParticles.slice(
        0,
        activeParticleCount
      );

    const inactiveParticles =
      allParticles.slice(
        activeParticleCount
      );

    /* -----------------------------------------------------
       GSAP CONTEXT
    ------------------------------------------------------ */

    const ctx = gsap.context(() => {
      /* ===================================================
         IMPORTANT:
         Everything remains invisible before animation.
      ==================================================== */

      gsap.set(root, {
        visibility: "visible",
      });

      /* ===================================================
         MIST INITIAL STATE
      ==================================================== */

      gsap.set(mist, {
        visibility: "visible",

        x: -120,
        y: -80,

        scaleX: 0.2,
        scaleY: 0.5,

        rotation: 30,

        opacity: 0,

        transformOrigin: "left center",
      });

      /* ===================================================
         TRAIL INITIAL STATE
      ==================================================== */

      gsap.set(trail, {
        visibility: "visible",

        x: -160,
        y: -130,

        scaleX: 0.3,
        scaleY: 0.5,

        rotation: 28,

        opacity: 0,

        transformOrigin: "left top",
      });

      /* ===================================================
         ACTIVE PARTICLES
      ==================================================== */

      activeParticles.forEach(
        (particle) => {
          gsap.set(particle, {
            visibility: "visible",

            x: gsap.utils.random(
              -50,
              70
            ),

            y: gsap.utils.random(
              -40,
              60
            ),

            scale: gsap.utils.random(
              0.45,
              1
            ),

            opacity: 0,

            rotation:
              gsap.utils.random(
                -40,
                40
              ),
          });
        }
      );

      /* ===================================================
         UNUSED MOBILE PARTICLES
      ==================================================== */

      if (inactiveParticles.length) {
        gsap.set(
          inactiveParticles,
          {
            visibility: "hidden",
            opacity: 0,
          }
        );
      }

      /* ===================================================
         TIMELINE
      ==================================================== */

      const timeline =
        gsap.timeline({
          delay: 0.65,
        });

      /* ===================================================
         01 — MIST ENTER
      ==================================================== */

      timeline.to(
        mist,
        {
          x: isMobile
            ? 20
            : 60,

          y: isMobile
            ? 10
            : 30,

          scaleX: 1,
          scaleY: 1,

          opacity: 0.78,

          duration: 0.5,

          ease: "power3.out",
        },
        0
      );

      /* ===================================================
         02 — SPRAY TRAIL ENTER
      ==================================================== */

      timeline.to(
        trail,
        {
          x: isMobile
            ? -40
            : -20,

          y: isMobile
            ? -20
            : -10,

          scaleX: 1,
          scaleY: 1,

          opacity: 0.28,

          duration: 0.8,

          ease: "power2.out",
        },
        0.12
      );

      /* ===================================================
         03 — PARTICLE SPRAY
      ==================================================== */

      activeParticles.forEach(
        (
          particle,
          index
        ) => {
          const progress =
            index /
            Math.max(
              activeParticles.length -
                1,
              1
            );

          const targetX =
            isMobile
              ? 100 +
                progress * 290 +
                gsap.utils.random(
                  -40,
                  80
                )
              : 160 +
                progress * 720 +
                gsap.utils.random(
                  -70,
                  130
                );

          const targetY =
            isMobile
              ? 80 +
                progress * 300 +
                gsap.utils.random(
                  -60,
                  70
                )
              : 100 +
                progress * 460 +
                gsap.utils.random(
                  -80,
                  100
                );

          timeline.to(
            particle,
            {
              x: targetX,
              y: targetY,

              scale:
                gsap.utils.random(
                  0.7,
                  1.65
                ),

              opacity:
                gsap.utils.random(
                  0.55,
                  1
                ),

              rotation:
                gsap.utils.random(
                  -180,
                  180
                ),

              duration:
                gsap.utils.random(
                  1.3,
                  2
                ),

              ease: "power2.out",
            },

            0.18 +
              index * 0.022
          );
        }
      );

      /* ===================================================
         04 — LONG SPRAY MOVEMENT
      ==================================================== */

      timeline.to(
        mist,
        {
          x: isMobile
            ? 190
            : 520,

          y: isMobile
            ? 150
            : 300,

          rotation: 38,

          scaleX: 1.25,
          scaleY: 1.05,

          opacity: 0.5,

          duration: 2.6,

          ease: "power1.inOut",
        },
        0.45
      );

      /* ===================================================
         05 — TRAIL CONTINUES
      ==================================================== */

      timeline.to(
        trail,
        {
          x: isMobile
            ? 90
            : 260,

          y: isMobile
            ? 70
            : 150,

          scaleX: 1.15,
          scaleY: 1,

          rotation: 32,

          opacity: 0.2,

          duration: 2.5,

          ease: "power1.inOut",
        },
        0.7
      );

      /* ===================================================
         06 — MIST FADE
      ==================================================== */

      timeline.to(
        mist,
        {
          x: isMobile
            ? 230
            : 610,

          y: isMobile
            ? 175
            : 330,

          scaleX: 1.4,

          opacity: 0,

          duration: 1,

          ease: "power2.out",
        },
        3.05
      );

      /* ===================================================
         07 — PARTICLES SETTLE
      ==================================================== */

      timeline.to(
        activeParticles,
        {
          y: "+=25",

          opacity: 0.35,

          duration: 1.5,

          stagger: {
            amount: 0.35,
            from: "random",
          },

          ease: "sine.out",
        },
        3.1
      );

      /* ===================================================
         08 — TRAIL FADE
      ==================================================== */

      timeline.to(
        trail,
        {
          x: isMobile
            ? 140
            : 360,

          opacity: 0,

          duration: 1.4,

          ease: "power2.out",
        },
        3.8
      );

      /* ===================================================
         09 — PARTICLES FADE
      ==================================================== */

      timeline.to(
        activeParticles,
        {
          y: "+=20",

          scale: 0.7,

          opacity: 0,

          duration: 1.8,

          stagger: {
            amount: 0.45,
            from: "random",
          },

          ease: "power2.out",
        },
        4.2
      );

      /* ===================================================
         10 — COMPLETELY HIDE EFFECT
      ==================================================== */

      timeline.set(
        [
          mist,
          trail,
          ...activeParticles,
        ],
        {
          visibility:
            "hidden",
          opacity: 0,
        }
      );
    }, root);

    /* =====================================================
       CLEANUP

       Important for React Strict Mode.
       The first development-mode execution is cleaned up
       before GSAP initializes the second one.
    ====================================================== */

    return () => {
      ctx.revert();
    };
  }, []);

  /* =======================================================
     RENDER
  ======================================================== */

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
      {/* ===================================================
          SPRAY TRAIL

          Initial inline styles prevent the browser from
          displaying this even for a single frame before
          GSAP initializes.
      ==================================================== */}

      <div
        ref={trailRef}
        style={{
          opacity: 0,
          visibility: "hidden",
        }}
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

      {/* ===================================================
          FOAM MIST
      ==================================================== */}

      <div
        ref={mistRef}
        style={{
          opacity: 0,
          visibility: "hidden",
        }}
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

      {/* ===================================================
          FOAM PARTICLES
      ==================================================== */}

      {particles.map(
        (
          particle,
          index
        ) => (
          <span
            key={
              particle.id
            }
            ref={(
              element
            ) => {
              particlesRef.current[
                index
              ] =
                element;
            }}
            style={{
              opacity: 0,
              visibility:
                "hidden",
            }}
            className="
              revora-foam-particle

              absolute
              left-0
              top-0

              h-[18px]
              w-[18px]
            "
          />
        )
      )}
    </div>
  );
}