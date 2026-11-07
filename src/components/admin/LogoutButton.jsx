
"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";

import { adminLogoutAction } from "@/app/admin/actions";

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 border border-[#D9DCD6] px-5 py-3 text-xs font-semibold text-[#191C19] transition-all duration-300 hover:border-[#A61922] hover:text-[#A61922] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut size={16} strokeWidth={1.7} />
      {pending ? "Çıkış yapılıyor..." : "Çıkış Yap"}
    </button>
  );
}

export default function LogoutButton() {
  return (
    <form action={adminLogoutAction}>
      <LogoutSubmitButton />
    </form>
  );
}
