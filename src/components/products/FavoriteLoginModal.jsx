
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart, X, ArrowRight } from "lucide-react";

export default function FavoriteLoginModal({
  open,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6 sm:px-6">
      <button
        type="button"
        aria-label="Pencereyi kapat"
        onClick={onClose}
        className="absolute inset-0 bg-[#111312]/70 backdrop-blur-[5px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorite-login-title"
        aria-describedby="favorite-login-description"
        className="relative z-10 w-full max-w-[440px] overflow-y-auto bg-[#F4F3EF] px-6 py-9 text-[#111312] shadow-2xl sm:px-10 sm:py-11"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center text-[#858B85] transition-colors hover:text-[#A61922]"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center border border-[#D8DBD7] text-[#A61922]">
          <Heart size={23} strokeWidth={1.5} />
        </div>

        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A61922]">
          VICIX / MEMBER FAVORITES
        </p>

        <h2
          id="favorite-login-title"
          className="mt-4 font-[family-name:var(--font-manrope)] text-[clamp(1.7rem,5vw,2.4rem)] font-semibold leading-tight tracking-[-0.05em]"
        >
          Favorilerine
          <span className="block text-[#858B85]">
            kaydet.
          </span>
        </h2>

        <p
          id="favorite-login-description"
          className="mt-5 text-[13px] leading-7 text-[#626A64]"
        >
          Bu işlem için üye girişi yapılması gerekmektedir.
          Favori ürünlerini kaydetmek için hesabına giriş
          yapabilir veya yeni bir üyelik oluşturabilirsin.
        </p>

        <div className="mt-9 flex flex-col gap-3">
          <Link
            href="/giris-yap"
            onClick={onClose}
            style={{
              backgroundColor: "#111312",
              color: "#FFFFFF",
            }}
            className="group flex min-h-[52px] w-full items-center justify-between px-5 py-4 font-[family-name:var(--font-manrope)] text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-85"
          >
            <span style={{ color: "#FFFFFF" }}>
              Giriş Yap
            </span>

            <ArrowRight
              size={18}
              color="#FFFFFF"
              strokeWidth={1.7}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/uye-ol"
            onClick={onClose}
            className="flex min-h-[52px] w-full items-center justify-center border border-[#C8CDC7] bg-transparent px-5 py-4 font-[family-name:var(--font-manrope)] text-[11px] font-bold uppercase tracking-[0.12em] text-[#111312] transition-colors duration-300 hover:border-[#111312] hover:bg-[#EAECE7]"
          >
            Üye Ol
          </Link>
        </div>
      </div>
    </div>
  );
}
