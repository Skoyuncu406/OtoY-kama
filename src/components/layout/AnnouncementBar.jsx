"use client";

import { useEffect, useState } from "react";

const messages = [
  "1.500 TL ve üzeri siparişlerde ücretsiz kargo",
  "Profesyonel detailing ürünleri",
  "Güvenli ödeme • Hızlı gönderim",
];

export default function AnnouncementBar() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        return (currentIndex + 1) % messages.length;
      });
    }, 4000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="
        relative
        z-[60]

        h-[var(--announcement-height)]
        w-full
        shrink-0

        overflow-hidden

        bg-[#B42318]

        text-white
      "
    >
      <div className="revora-container h-full">
        <div
          className="
            relative

            flex
            h-full
            w-full

            items-center
            justify-center

            overflow-hidden
          "
        >
          {messages.map((message, index) => {
            const isActive = activeIndex === index;

            return (
              <p
                key={message}
                aria-hidden={!isActive}
                className={`
                  absolute
                  left-1/2
                  top-1/2

                  w-full
                  max-w-[90vw]

                  -translate-x-1/2

                  px-2

                  text-center

                  font-[family-name:var(--font-manrope)]

                  text-[9px]
                  font-semibold
                  uppercase

                  leading-none
                  tracking-[0.13em]

                  whitespace-nowrap

                  transition-all
                  duration-700
                  ease-[var(--ease-premium)]

                  sm:text-[10px]
                  sm:tracking-[0.16em]

                  ${
                    isActive
                      ? "-translate-y-1/2 opacity-100"
                      : "translate-y-[10px] opacity-0"
                  }
                `}
              >
                {message}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}