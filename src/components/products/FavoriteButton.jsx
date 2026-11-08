
"use client";

import { Heart, LoaderCircle } from "lucide-react";

export default function FavoriteButton({
  product,
  isFavorite = false,
  loading = false,
  onToggle,
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle(product.id);
      }}
      aria-label={
        isFavorite
          ? `${product.name} ürününü favorilerden çıkar`
          : `${product.name} ürününü favorilere ekle`
      }
      aria-pressed={isFavorite}
      title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center border transition-all duration-300 sm:right-4 sm:top-4 ${
        isFavorite
          ? "border-[#A61922] bg-[#A61922] text-white"
          : "border-white/80 bg-[#F4F3EF]/95 text-[#111312] hover:border-[#A61922] hover:text-[#A61922]"
      } disabled:cursor-wait disabled:opacity-60`}
    >
      {loading ? (
        <LoaderCircle
          size={18}
          strokeWidth={1.7}
          className="animate-spin"
        />
      ) : (
        <Heart
          size={19}
          strokeWidth={1.7}
          fill={isFavorite ? "currentColor" : "none"}
        />
      )}
    </button>
  );
}
