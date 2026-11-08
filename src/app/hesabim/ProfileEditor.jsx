
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Pencil, X } from "lucide-react";

import { updateCustomerProfileAction } from "./actions";

const initialState = {
  success: false,
  error: null,
};

export default function ProfileEditor({ username, email }) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, pending] = useActionState(
    updateCustomerProfileAction,
    initialState
  );

  useEffect(() => {
    if (!state.success) return;

    setEditing(false);
    setShowPassword(false);
    router.refresh();
  }, [state.success, router]);

  return (
    <div className="mt-8">
      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="group inline-flex items-center gap-3 border-b border-[#111312] pb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111312] transition-colors hover:border-[#A61922] hover:text-[#A61922]"
        >
          <Pencil size={16} strokeWidth={1.5} />
          Bilgilerimi Düzenle
        </button>
      ) : (
        <form
          action={formAction}
          className="border-t border-[#D8DBD7] pt-8"
        >
          <div className="mb-8 flex items-center justify-between gap-4">
            <h3 className="text-[15px] font-semibold tracking-[-0.02em]">
              Bilgilerimi Düzenle
            </h3>

            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setEditing(false);
                setShowPassword(false);
              }}
              aria-label="Düzenlemeyi kapat"
              className="p-2 text-[#858B85] transition-colors hover:text-[#A61922] disabled:opacity-50"
            >
              <X size={19} strokeWidth={1.5} />
            </button>
          </div>

          <div className="space-y-7">
            <div>
              <label
                htmlFor="profile-username"
                className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em]"
              >
                Kullanıcı Adı
              </label>

              <input
                id="profile-username"
                name="username"
                type="text"
                key={`username-${username}`}
                defaultValue={username}
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                autoComplete="username"
                className="h-12 w-full min-w-0 border-0 border-b border-[#C7CCC5] bg-transparent px-0 text-[14px] text-[#111312] outline-none ring-0 transition-colors focus:border-[#111312] focus:bg-transparent focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em]"
              >
                E-posta Adresi
              </label>

              <input
                id="profile-email"
                name="email"
                type="email"
                key={`email-${email}`}
                defaultValue={email}
                required
                maxLength={254}
                autoComplete="email"
                className="h-12 w-full min-w-0 border-0 border-b border-[#C7CCC5] bg-transparent px-0 text-[14px] text-[#111312] outline-none ring-0 transition-colors focus:border-[#111312] focus:bg-transparent focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <label
                htmlFor="profile-current-password"
                className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em]"
              >
                Mevcut Şifreniz
              </label>

              <div className="flex items-center border-b border-[#C7CCC5] focus-within:border-[#111312]">
                <input
                  id="profile-current-password"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Değişiklikleri onaylamak için şifreniz"
                  className="h-12 w-full min-w-0 border-0 bg-transparent px-0 text-[13px] text-[#111312] outline-none ring-0 placeholder:text-[#9AA19A] focus:bg-transparent focus:outline-none focus:ring-0"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Şifreyi gizle" : "Şifreyi göster"
                  }
                  className="shrink-0 p-2 text-[#858B85] transition-colors hover:text-[#111312]"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {state.error && (
            <p
              role="alert"
              className="mt-6 border-l-2 border-[#A61922] bg-[#A61922]/5 px-4 py-3 text-[12px] text-[#A61922]"
            >
              {state.error}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#111312] px-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#A61922] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={17} strokeWidth={1.6} />
              {pending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() => setEditing(false)}
              className="min-h-12 px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#626A64] transition-colors hover:text-[#A61922] disabled:opacity-50"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {state.success && !editing && (
        <p
          role="status"
          className="mt-5 border-l-2 border-[#A61922] bg-[#EAECE7] px-4 py-3 text-[12px] text-[#303530]"
        >
          Hesap bilgileriniz başarıyla güncellendi.
        </p>
      )}
    </div>
  );
}
