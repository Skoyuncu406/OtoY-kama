
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Copy,
  Info,
  Loader2,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useCart } from "@/context/CartContext";

const formatPrice = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  address: "",
  postalCode: "",
  orderNote: "",
};

const inputClass = `
  w-full min-w-0 rounded-none
  border-0 border-b border-[#D8DBD7]
  bg-transparent px-0 py-3
  text-[13px] text-[#111312]
  outline-none ring-0
  placeholder:text-[#9CA19B]
  transition-colors duration-200
  focus:border-[#111312]
  focus:outline-none focus:ring-0
  focus-visible:outline-none
`;

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  autoComplete,
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#626A64]">
        {label}
        {required && (
          <span className="ml-1 text-[#A61922]">*</span>
        )}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        maxLength={name === "address" ? 1000 : 254}
        className={inputClass}
      />
    </label>
  );
}

function SectionHeading({ number, title, description }) {
  return (
    <div className="mb-8 border-b border-[#D8DBD7] pb-6">
      <div className="flex items-start gap-4">
        <span className="pt-1 text-[11px] font-bold text-[#A61922]">
          {number}
        </span>

        <div>
          <h2 className="font-[family-name:var(--font-manrope)] text-[21px] font-semibold tracking-[-0.045em] sm:text-[25px]">
            {title}
          </h2>

          {description && (
            <p className="mt-2 text-[12px] leading-6 text-[#626A64]">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const {
    items,
    hydrated,
    cartCount,
    cartTotal,
    clearCart,
  } = useCart();

  const [form, setForm] = useState(initialForm);
  const [paymentMethod, setPaymentMethod] = useState(
    "CASH_ON_DELIVERY",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const submittingRef = useRef(false);
  // Aynı sipariş yeniden denenirse aynı anahtar kullanılmalı.
  const checkoutAttemptRef = useRef(null);

  function createOrderPayload() {
    const normalizedForm = Object.fromEntries(
      Object.entries(form).map(([field, value]) => [
        field,
        typeof value === "string"
          ? value.trim().slice(0, field === "email" ? 254 : field === "address" || field === "orderNote" ? 1000 : field === "fullName" ? 120 : field === "phone" ? 30 : field === "postalCode" ? 20 : 100)
          : "",
      ]),
    );

    const orderItems = items
      .map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId));

    const payload = {
      ...normalizedForm,
      paymentMethod,
      items: orderItems,
    };

    // İstek içeriği aynıysa önceki anahtar korunur.
    const signature = JSON.stringify(payload);
    if (checkoutAttemptRef.current?.signature !== signature) {
      checkoutAttemptRef.current = {
        signature,
        key: crypto.randomUUID(),
      };
    }

    return {
      ...payload,
      idempotencyKey: checkoutAttemptRef.current.key,
    };
  }

  const copyTrackingCode = async () => {
    if (!completedOrder?.trackingCode) return;

    try {
      await navigator.clipboard.writeText(completedOrder.trackingCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      submittingRef.current ||
      completedOrder ||
      !hydrated ||
      items.length === 0
    ) {
      return;
    }

    if (paymentMethod !== "CASH_ON_DELIVERY") {
      setError("Online ödeme henüz kullanıma açılmadı.");
      return;
    }

    // Payload gönderim anında sabitlenir; ağ hatasında aynı içerik
    // yeniden gönderilirse aynı idempotencyKey kullanılır.
    const payload = createOrderPayload();

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        if (data?.code === "DUPLICATE_ORDER_REQUEST") {
          throw new Error(
            "Sipariş işleminiz devam ediyor olabilir. Birkaç saniye bekleyip aynı bilgilerle tekrar deneyin; yeni sipariş oluşturulmaz.",
          );
        }

        if (data?.code === "TRANSACTION_CONFLICT") {
          throw new Error(
            "İşlem sırasında yoğunluk oluştu. Aynı bilgilerle tekrar deneyebilirsiniz.",
          );
        }

        throw new Error(
          data?.error ||
            "Sipariş sonucu doğrulanamadı. Aynı bilgilerle tekrar deneyin veya sipariş durumunuzu kontrol edin.",
        );
      }

      if (!data.order?.orderNumber || !data.order?.trackingCode) {
        throw new Error(
          "Sipariş yanıtı doğrulanamadı. Aynı bilgilerle tekrar deneyin veya sipariş durumunuzu kontrol edin.",
        );
      }

      setCopied(false);
      setCompletedOrder(data.order);
      clearCart();
      checkoutAttemptRef.current = null;

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bağlantı hatası oluştu. Aynı bilgilerle tekrar deneyin veya sipariş durumunuzu kontrol edin.",
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#F4F3EF] px-5 text-[#626A64]">
        <Loader2
          size={22}
          className="mr-3 animate-spin"
        />
        Ödeme sayfası hazırlanıyor...
      </main>
    );
  }

  if (completedOrder) {
    return (
      <main className="min-h-[75vh] bg-[#F4F3EF] px-5 py-20 text-[#111312]">
        <div className="mx-auto flex max-w-[620px] flex-col items-center py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#8DCC27] text-[#527C16]">
            <Check size={34} strokeWidth={1.5} />
          </div>

          <p className="mt-9 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A61922]">
            VICIX / SİPARİŞ ONAYI
          </p>

          <h1 className="mt-4 font-[family-name:var(--font-manrope)] text-[clamp(2rem,5vw,3.8rem)] font-semibold leading-tight tracking-[-0.06em]">
            Siparişiniz alındı.
          </h1>

          <p className="mt-5 max-w-[440px] text-[13px] leading-7 text-[#626A64]">
            Siparişiniz başarıyla oluşturuldu.
            Ödemenizi ürünleriniz teslim edilirken
            gerçekleştirebilirsiniz.
          </p>

          <div className="mt-10 w-full border-y border-[#D8DBD7] py-6">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#858B85]">
              Sipariş Numaranız
            </p>

            <p className="mt-3 break-all text-[18px] font-bold tracking-[-0.03em]">
              {completedOrder.orderNumber}
            </p>

            <div className="mt-7 border-t border-[#D8DBD7] pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A61922]">
                Sipariş Takip Kodunuz
              </p>
              <p className="mt-3 break-all font-[family-name:var(--font-manrope)] text-[clamp(0.95rem,3vw,1.2rem)] font-bold tracking-[0.015em]">
                {completedOrder.trackingCode}
              </p>
              <button
                type="button"
                onClick={copyTrackingCode}
                className="mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 border border-[#111312] px-5 text-[11px] font-bold transition-colors hover:border-[#A61922] hover:text-[#A61922]"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Kod Kopyalandı" : "Takip Kodunu Kopyala"}
              </button>
              <div className="mt-5 flex items-start gap-3 border-l-2 border-[#A61922] bg-[#EEEAE4] px-4 py-4 text-left">
                <Info size={18} className="mt-0.5 shrink-0 text-[#A61922]" />
                <p className="text-[12px] leading-6 text-[#343A35]">
                  <strong>Önemli:</strong> Siparişinizi takip edebilmek için bu kodu mutlaka kaydedin.
                  Sipariş durumunu öğrenirken yalnızca bu kodu kullanacaksınız.
                </p>
              </div>
              <Link
                href="/siparis-takip"
                className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#A61922] transition-colors hover:text-[#111312]"
              >
                Sipariş Takip Sayfası <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#D8DBD7] pt-5">
              <span className="text-[12px] text-[#626A64]">
                Sipariş Tutarı
              </span>

              <span className="text-[20px] font-bold">
                {formatPrice.format(completedOrder.total)}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-[12px] text-[#626A64]">
                Ödeme Yöntemi
              </span>

              <span className="text-[12px] font-semibold">
                Kapıda Ödeme
              </span>
            </div>
          </div>


<button
  type="button"
  onClick={() => router.push("/urunler")}
  className="
    group mt-9 inline-flex min-h-[54px]
    items-center justify-center gap-5
    border border-[#111312]
    !bg-[#111312] px-8
    font-[family-name:var(--font-manrope)]
    text-[11px] font-bold uppercase
    tracking-[0.1em] !text-white
    transition-all duration-300
    hover:!border-[#A61922]
    hover:!bg-[#A61922]
  "
>
  <span className="!text-white">
    Alışverişe Devam Et
  </span>

  <ArrowRight
    size={18}
    strokeWidth={1.6}
    className="
      !text-white
      transition-transform duration-300
      group-hover:translate-x-1
    "
  />
</button>

        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[75vh] flex-col items-center justify-center bg-[#F4F3EF] px-5 py-20 text-center text-[#111312]">
        <ShoppingBag
          size={44}
          strokeWidth={1.2}
          className="text-[#858B85]"
        />

        <h1 className="mt-7 font-[family-name:var(--font-manrope)] text-[30px] font-semibold tracking-[-0.05em]">
          Sepetiniz boş.
        </h1>

        <p className="mt-3 text-[13px] text-[#626A64]">
          Ödeme işlemine devam etmek için sepetinize ürün ekleyin.
        </p>

        <Link
          href="/urunler"
          className="mt-8 inline-flex min-h-[50px] items-center gap-4 bg-[#111312] px-7 text-[11px] font-bold uppercase tracking-[0.1em] !text-white transition-colors hover:bg-[#A61922]"
        >
          Ürünleri Keşfet
          <ArrowRight size={17} />
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] w-full overflow-x-clip bg-[#F4F3EF] text-[#111312]">
      <div className="revora-container py-10 sm:py-16 lg:py-20">
        <div className="border-b border-[#D8DBD7] pb-8 sm:pb-12">
          <Link
            href="/sepet"
            className="mb-7 inline-flex items-center gap-2 text-[11px] font-semibold text-[#626A64] transition-colors hover:text-[#A61922]"
          >
            <ArrowLeft size={15} />
            Sepete Dön
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A61922]">
                VICIX / GÜVENLİ ALIŞVERİŞ
              </p>

              <h1 className="font-[family-name:var(--font-manrope)] text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-none tracking-[-0.06em]">
                Ödeme <span className="text-[#858B85]">ve teslimat.</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#626A64]">
              <LockKeyhole size={15} strokeWidth={1.5} />
              Sipariş Bilgileri
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid min-w-0 gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-16 lg:pt-14"
        >
          <div className="min-w-0 space-y-14">
            <section>
              <SectionHeading
                number="01"
                title="Teslimat Bilgileri"
                description="Üye olmadan da sipariş verebilirsiniz. Teslimat bilgilerinizi eksiksiz doldurun."
              />

              <div className="grid min-w-0 gap-x-7 gap-y-7 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    label="Ad Soyad"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Adınız ve soyadınız"
                    autoComplete="name"
                    required
                  />
                </div>

                <Field
                  label="E-posta Adresi"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  autoComplete="email"
                  required
                />

                <Field
                  label="Telefon Numarası"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                  autoComplete="tel"
                  required
                />

                <Field
                  label="İl"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="İl"
                  autoComplete="address-level1"
                  required
                />

                <Field
                  label="İlçe"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="İlçe"
                  autoComplete="address-level2"
                  required
                />

                <div className="sm:col-span-2">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#626A64]">
                      Açık Adres
                      <span className="ml-1 text-[#A61922]">*</span>
                    </span>

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      maxLength={1000}
                      placeholder="Mahalle, cadde, sokak, bina ve daire numarası"
                      autoComplete="street-address"
                      required
                      className={`${inputClass} resize-y`}
                    />
                  </label>
                </div>

                <Field
                  label="Posta Kodu (İsteğe Bağlı)"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="Posta kodu"
                  autoComplete="postal-code"
                />

                <div className="sm:col-span-2">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#626A64]">
                      Sipariş Notu (İsteğe Bağlı)
                    </span>

                    <textarea
                      name="orderNote"
                      value={form.orderNote}
                      onChange={handleChange}
                      rows={2}
                      maxLength={1000}
                      placeholder="Teslimatla ilgili eklemek istediğiniz notlar..."
                      className={`${inputClass} resize-y`}
                    />
                  </label>
                </div>
              </div>
            </section>

            <section>
              <SectionHeading
                number="02"
                title="Ödeme Yöntemi"
                description="Siparişiniz için kullanmak istediğiniz ödeme yöntemini seçin."
              />

              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-4 border p-5 transition-colors sm:p-6 ${
                    paymentMethod === "CASH_ON_DELIVERY"
                      ? "border-[#111312] bg-[#EBEDE8]"
                      : "border-[#D8DBD7] hover:border-[#858B85]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === "CASH_ON_DELIVERY"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                    className="h-4 w-4 accent-[#A61922]"
                  />

                  <Truck
                    size={24}
                    strokeWidth={1.4}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold">
                      Kapıda Ödeme
                    </span>

                    <span className="mt-1 block text-[11px] leading-5 text-[#626A64]">
                      Siparişinizi teslim alırken ödeme yapın.
                    </span>
                  </span>

                  <span className="hidden text-[10px] font-bold uppercase tracking-[0.08em] text-[#527C16] sm:block">
                    Aktif
                  </span>
                </label>

                <div className="flex items-center gap-4 border border-[#D8DBD7] p-5 opacity-55 sm:p-6">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE_PAYMENT"
                    disabled
                    className="h-4 w-4"
                  />

                  <CreditCard
                    size={24}
                    strokeWidth={1.4}
                    className="shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold">
                      Online Ödeme
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-[#626A64]">
                      Banka veya kredi kartıyla ödeme.
                    </p>
                  </div>

                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.06em] text-[#626A64]">
                    Yakında
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[#626A64]"
                />

                <p className="text-[11px] leading-6 text-[#626A64]">
                  Kapıda ödeme siparişlerinde ödeme, teslimat
                  sırasında tahsil edilir. Online kart ödemesi
                  entegrasyon tamamlandıktan sonra açılacaktır.
                </p>
              </div>
            </section>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start">
            <div className="border-t-2 border-[#111312] pt-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-[family-name:var(--font-manrope)] text-[22px] font-semibold tracking-[-0.04em]">
                  Sipariş Özeti
                </h2>

                <span className="text-[11px] text-[#626A64]">
                  {cartCount} ürün
                </span>
              </div>

              <div className="mt-7 border-t border-[#D8DBD7]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 gap-4 border-b border-[#D8DBD7] py-5"
                  >
                    <div className="relative h-[85px] w-[70px] shrink-0 overflow-hidden bg-[#E6E8E3]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="70px"
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag
                            size={21}
                            className="text-[#858B85]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <p className="line-clamp-2 text-[12px] font-semibold leading-5">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[10px] text-[#858B85]">
                          Adet: {item.quantity}
                        </p>
                      </div>

                      <p className="mt-2 text-[12px] font-bold tabular-nums">
                        {formatPrice.format(
                          item.price * item.quantity,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-5">
                <div className="flex items-center justify-between gap-4 text-[12px]">
                  <span className="text-[#626A64]">
                    Ara Toplam
                  </span>

                  <span className="font-semibold tabular-nums">
                    {formatPrice.format(cartTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-[12px]">
                  <span className="text-[#626A64]">
                    Kargo
                  </span>

                  <span className="text-[#626A64]">
                    {formatPrice.format(0)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-[12px]">
                  <span className="text-[#626A64]">
                    Kapıda Ödeme Hizmet Bedeli
                  </span>

                  <span className="text-[#626A64]">
                    {formatPrice.format(0)}
                  </span>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-[#111312] pt-6">
                <span className="text-[13px] font-semibold">
                  Toplam
                </span>

                <span className="font-[family-name:var(--font-manrope)] text-[24px] font-bold tracking-[-0.05em] tabular-nums">
                  {formatPrice.format(cartTotal)}
                </span>
              </div>

              <p className="mt-3 text-[10px] leading-5 text-[#858B85]">
                Tutarlar sipariş sırasında sunucuda yeniden
                doğrulanır. Kargo ve hizmet bedelleri bu
                sürümde 0 TL olarak tanımlanmıştır.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-6 border-l-2 border-[#A61922] bg-[#F1E7E5] px-4 py-4 text-[12px] leading-6 text-[#A61922]"
                >
                  {error}
                </div>
              )}

  
<button
  type="submit"
  disabled={submitting}
  className="
    group mt-8 flex min-h-[56px] w-full
    items-center justify-between gap-4
    border border-[#A61922]
    !bg-[#A61922] px-6
    font-[family-name:var(--font-manrope)]
    text-[12px] font-bold uppercase
    tracking-[0.1em] !text-white
    transition-all duration-300
    hover:!border-[#84131B]
    hover:!bg-[#84131B]
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
  <span className="!text-white">
    {submitting
      ? "Sipariş Oluşturuluyor..."
      : "Siparişi Tamamla"}
  </span>

  {submitting ? (
    <Loader2
      size={19}
      strokeWidth={1.8}
      className="shrink-0 animate-spin !text-white"
    />
  ) : (
    <ArrowRight
      size={19}
      strokeWidth={1.8}
      className="
        shrink-0 !text-white
        transition-transform duration-300
        group-hover:translate-x-1
      "
    />
  )}
</button>


              <p className="mt-4 text-center text-[11px] leading-6 text-[#858B85]">
                Üye olmadan sipariş verebilirsiniz. Sipariş tamamlandığında
                takip kodunuzu kaydetmeyi unutmayın.
              </p>

              <div className="mt-8 space-y-4 border-t border-[#D8DBD7] pt-6">
                <div className="flex items-center gap-3 text-[11px] text-[#626A64]">
                  <PackageCheck
                    size={18}
                    strokeWidth={1.5}
                  />
                  Sipariş ve teslimat takibi
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#626A64]">
                  <MapPin
                    size={18}
                    strokeWidth={1.5}
                  />
                  Adresinize teslimat
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#626A64]">
                  <ShieldCheck
                    size={18}
                    strokeWidth={1.5}
                  />
                  Güvenli sipariş kaydı
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
