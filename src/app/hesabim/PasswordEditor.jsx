
"use client";

import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Check, X } from "lucide-react";
import { changeCustomerPasswordAction } from "./actions";

const initialState = {
  success: false,
  error: null,
};

export default function PasswordEditor() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState({});
  const [state, formAction, pending] = useActionState(
    changeCustomerPasswordAction,
    initialState
  );

  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setVisible({});
      setFormKey((value) => value + 1);
    }
  }, [state.success]);

  const fields = [
    {
      name: "currentPassword",
      label: "Mevcut Şifre",
      autoComplete: "current-password",
    },
    {
      name: "newPassword",
      label: "Yeni Şifre",
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: "Yeni Şifre Tekrarı",
      autoComplete: "new-password",
    },
  ];

  return (
    <section className="mt-12 border-t border-[#D8DBD7] pt-10">
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-semibold text-[#A61922]">
          02
        </span>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
          Hesap Güvenliği
        </h2>
      </div>

      <p className="mt-5 max-w-[460px] text-[13px] leading-7 text-[#626A64]">
        Hesabınızın güvenliğini korumak için şifrenizi
        dilediğiniz zaman değiştirebilirsiniz.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-7 inline-flex items-center gap-3 border-b border-[#111312] pb-3 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:border-[#A61922] hover:text-[#A61922]"
        >
          <KeyRound size={17} strokeWidth={1.5} />
          Şifremi Değiştir
        </button>
      ) : (
        <form
          key={formKey}
          action={formAction}
          className="mt-8 space-y-7 border-t border-[#D8DBD7] pt-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">
              Şifre Değiştir
            </h3>
            <button
              type="button"
              disabled={pending}
              onClick={() => setOpen(false)}
              aria-label="Kapat"
              className="p-2 text-[#858B85] hover:text-[#A61922]"
            >
              <X size={19} />
            </button>
          </div>

          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.1em]"
              >
                {field.label}
              </label>

              <div className="flex items-center border-b border-[#C7CCC5] focus-within:border-[#111312]">
                <input
                  id={field.name}
                  name={field.name}
                  type={visible[field.name] ? "text" : "password"}
                  autoComplete={field.autoComplete}
                  required
                  minLength={
                    field.name === "newPassword" ? 12 : undefined
                  }
                  maxLength={
                    field.name === "newPassword" ? 72 : undefined
                  }
                  className="h-12 w-full min-w-0 border-0 bg-transparent px-0 text-[14px] outline-none ring-0 focus:bg-transparent focus:outline-none focus:ring-0"
                />

                <button
                  type="button"
                  onClick={() =>
                    setVisible((previous) => ({
                      ...previous,
                      [field.name]: !previous[field.name],
                    }))
                  }
                  aria-label={
                    visible[field.name]
                      ? "Şifreyi gizle"
                      : "Şifreyi göster"
                  }
                  className="p-2 text-[#858B85] hover:text-[#111312]"
                >
                  {visible[field.name] ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}

          {state.error && (
            <p
              role="alert"
              className="border-l-2 border-[#A61922] bg-[#A61922]/5 px-4 py-3 text-[12px] text-[#A61922]"
            >
              {state.error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-12 items-center gap-3 bg-[#111312] px-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#A61922] disabled:opacity-50"
            >
              <Check size={17} />
              {pending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() => setOpen(false)}
              className="min-h-12 px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#626A64] hover:text-[#A61922]"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {state.success && !open && (
        <p
          role="status"
          className="mt-5 border-l-2 border-[#A61922] bg-[#EAECE7] px-4 py-3 text-[12px] text-[#303530]"
        >
          Şifreniz başarıyla değiştirildi. Bir sonraki girişinizde
          yeni şifrenizi kullanabilirsiniz.
        </p>
      )}
    </section>
  );
}
