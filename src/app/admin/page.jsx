import {
  Package, Grid2X2, ShieldCheck, ArrowUpRight, ShoppingBag,
  Clock3, CheckCircle2, Truck, PackageCheck, XCircle,
  ClipboardList, ChevronRight, ImageIcon, Wallet, CalendarDays,
  AlertCircle, CreditCard, TrendingUp, PackageX, Boxes, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard | VICIX Yönetim",
  robots: { index: false, follow: false },
};

const managementLinks = [
  { title: "Sipariş Yönetimi", description: "Siparişleri, ödemeleri ve iptal taleplerini yönetin.", href: "/admin/siparisler", icon: ShoppingBag },
  { title: "Ürün Yönetimi", description: "Ürünleri, fiyatları ve stokları düzenleyin.", href: "/admin/urunler", icon: Package },
  { title: "Kategori Yönetimi", description: "Mağaza kategorilerini düzenleyin.", href: "/admin/kategoriler", icon: Grid2X2 },
];

const statusConfig = {
  PENDING: { label: "Bekliyor", icon: Clock3, color: "text-[#986A26]", background: "bg-[#F4E9D7]" },
  CONFIRMED: { label: "Onaylandı", icon: CheckCircle2, color: "text-[#416A4D]", background: "bg-[#E5EEE6]" },
  PREPARING: { label: "Hazırlanıyor", icon: Package, color: "text-[#6D5B91]", background: "bg-[#ECE8F3]" },
  SHIPPED: { label: "Kargoda", icon: Truck, color: "text-[#3C6F91]", background: "bg-[#E4EDF4]" },
  DELIVERED: { label: "Teslim Edildi", icon: PackageCheck, color: "text-[#416A4D]", background: "bg-[#E5EEE6]" },
  CANCELLED: { label: "İptal Edildi", icon: XCircle, color: "text-[#A61922]", background: "bg-[#F5E5E6]" },
};

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("tr-TR");

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function SectionHeading({ eyebrow, title, description, href, action = "Tümünü Gör" }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A61922]">{eyebrow}</p>
        <h2 className="mt-3 font-[family-name:var(--font-manrope)] text-xl font-semibold tracking-[-0.035em] sm:text-2xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-xs leading-6 text-[#747974] sm:text-sm">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.07em] text-[#A61922] transition-colors hover:text-[#85141B]">
          {action}<ArrowUpRight size={15} strokeWidth={1.7} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = statusConfig[status] ?? { label: status ?? "Bilinmiyor", icon: Clock3, color: "text-[#747974]", background: "bg-[#E9EAE6]" };
  const Icon = config.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${config.color} ${config.background}`}><Icon size={12} strokeWidth={1.8} />{config.label}</span>;
}

function Stat({ label, value, detail, icon: Icon, moneyValue = false }) {
  return (
    <div className="min-w-0">
      <Icon size={21} strokeWidth={1.5} className="text-[#A61922]" />
      <p className={`mt-5 break-words font-[family-name:var(--font-manrope)] font-semibold tracking-[-0.045em] ${moneyValue ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl"}`}>{moneyValue ? money.format(value) : number.format(value)}</p>
      <p className="mt-3 text-xs font-semibold sm:text-sm">{label}</p>
      <p className="mt-1 text-[11px] leading-5 text-[#858B85]">{detail}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  // Son 30 gün: bugün dahil, İstanbul saat diliminde takvim günleri esas alınır.
  const now = new Date();
  const istanbulParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type) => istanbulParts.find((p) => p.type === type)?.value;
  const year = Number(part("year"));
  const month = Number(part("month"));
  const day = Number(part("day"));
  // Türkiye UTC+3 kullanır; 00:00 İstanbul = önceki gün 21:00 UTC.
  const todayStart = new Date(Date.UTC(year, month - 1, day, -3));
  const thirtyDayStart = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);

  const [
    productCount, categoryCount, imageCount, orderCount,
    pendingOrderCount, statusGroups, recentOrders,
    pendingCancellationCount, paidTotals, todayOrderCount,
    thirtyDayOrderCount, todayPaidTotals, thirtyDayPaidTotals,
    pendingPaymentCount, criticalStockCount, outOfStockCount, lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.productImage.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      take: 5, orderBy: { createdAt: "desc" },
      select: {
        id: true, orderNumber: true, status: true, createdAt: true,
        total: true, paymentStatus: true,
        customer: { select: { username: true } },
      },
    }),
    prisma.cancellationRequest.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", status: { not: "CANCELLED" } },
      _sum: { total: true }, _count: { _all: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDayStart } } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", status: { not: "CANCELLED" }, paidAt: { gte: todayStart } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", status: { not: "CANCELLED" }, paidAt: { gte: thirtyDayStart } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { paymentStatus: "PENDING", status: { not: "CANCELLED" } } }),
    prisma.product.count({ where: { stock: { gte: 1, lte: 5 } } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      take: 8,
      select: {
        id: true,
        name: true,
        stock: true,
        isActive: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  const statusCounts = Object.fromEntries(statusGroups.map((group) => [group.status, group._count._all]));
  const activeOrderCount = (statusCounts.CONFIRMED ?? 0) + (statusCounts.PREPARING ?? 0) + (statusCounts.SHIPPED ?? 0);
  const deliveredOrderCount = statusCounts.DELIVERED ?? 0;
  const paidRevenue = Number(paidTotals._sum.total ?? 0);
  const todayRevenue = Number(todayPaidTotals._sum.total ?? 0);
  const thirtyDayRevenue = Number(thirtyDayPaidTotals._sum.total ?? 0);

  return (
    <main className="min-h-[calc(100svh-112px)] w-full min-w-0 overflow-x-clip bg-[#F4F3EF] px-5 py-8 text-[#191C19] sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[#D9DCD6] pb-8">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A61922] sm:text-[11px]">VICIX CAR CARE / ADMIN</span>
            <h1 className="mt-4 font-[family-name:var(--font-manrope)] text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Yönetim Paneli</h1>
            <p className="mt-3 text-sm text-[#747974]">Hoş geldiniz, {admin.name}. <span className="hidden sm:inline">Mağazanızın güncel durumunu buradan takip edin.</span></p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="hidden items-center gap-2 text-xs text-[#747974] sm:flex"><ShieldCheck size={17} strokeWidth={1.6} className="text-[#A61922]" />Güvenli Oturum</div>
            <LogoutButton />
          </div>
        </header>

        <section className="border-b border-[#D9DCD6] py-9 sm:py-11">
          <SectionHeading eyebrow="GENEL BAKIŞ" title="Sipariş Performansı" description="Mağazanızdaki siparişlerin anlık özeti." />
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4 lg:gap-x-8">
            <Stat icon={ShoppingBag} label="Toplam Sipariş" value={orderCount} detail="Misafir ve kayıtlı üyeler" />
            <Stat icon={Clock3} label="Bekleyen Sipariş" value={pendingOrderCount} detail="Onay bekleyen siparişler" />
            <Stat icon={Truck} label="Devam Eden" value={activeOrderCount} detail="Onaylı, hazırlanan veya kargoda" />
            <Stat icon={PackageCheck} label="Teslim Edilen" value={deliveredOrderCount} detail="Tamamlanan teslimatlar" />
          </div>
        </section>

        <section className="border-b border-[#D9DCD6] py-10 sm:py-12">
          <SectionHeading eyebrow="FİNANSAL GÖRÜNÜM" title="Tahsil Edilen Satışlar" description="Yalnızca ödemesi alınmış, iptal edilmemiş siparişler. İade edilmiş ödemeler dahil değildir." />
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 border-t border-[#D9DCD6] pt-7 lg:grid-cols-4 lg:gap-x-8">
            <Stat icon={Wallet} label="Toplam Tahsilat" value={paidRevenue} moneyValue detail="PAID durumundaki siparişler" />
            <Stat icon={CalendarDays} label="Bugünkü Tahsilat" value={todayRevenue} moneyValue detail="Bugün ödemesi alınanlar" />
            <Stat icon={TrendingUp} label="Son 30 Gün" value={thirtyDayRevenue} moneyValue detail="Son 30 gündeki tahsilatlar" />
            <Stat icon={CreditCard} label="Ödeme Bekleyen" value={pendingPaymentCount} detail="Tahsil edilmemiş aktif siparişler" />
          </div>
          <p className="mt-7 text-[11px] leading-5 text-[#858B85]">Finansal toplamlar siparişlerin güncel ödeme durumuna ve toplam tutarına göre hesaplanır; muhasebe mutabakatı veya iade hareketleri raporu değildir.</p>
        </section>

        <section className="border-b border-[#D9DCD6] py-10 sm:py-12">
          <SectionHeading eyebrow="GÜNLÜK AKIŞ" title="Sipariş Özeti" description="Bugün ve son 30 gün içinde oluşturulan siparişler." />
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 border-t border-[#D9DCD6] pt-7 sm:grid-cols-3 sm:gap-x-8">
            <Stat icon={CalendarDays} label="Bugünkü Siparişler" value={todayOrderCount} detail="İstanbul saatine göre" />
            <Stat icon={ClipboardList} label="Son 30 Günlük Sipariş" value={thirtyDayOrderCount} detail="Bugün dahil son 30 gün" />
            <Stat icon={AlertCircle} label="Bekleyen İptal Talebi" value={pendingCancellationCount} detail="Yönetici değerlendirmesi gerekiyor" />
          </div>
          {pendingCancellationCount > 0 && (
            <Link href="/admin/siparisler" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-[#A61922] hover:text-[#85141B]">İptal taleplerini incele <ArrowUpRight size={15} /></Link>
          )}
        </section>

        <section className="border-b border-[#D9DCD6] py-10 sm:py-12">
          <SectionHeading eyebrow="SİPARİŞ AKIŞI" title="Son Siparişler" description="Mağazanıza gelen en güncel beş sipariş." href="/admin/siparisler" action="Tüm Siparişler" />
          <div className="mt-8 border-t border-[#D9DCD6]">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center"><ShoppingBag size={27} strokeWidth={1.3} className="mx-auto text-[#A61922]" /><p className="mt-4 text-sm font-medium">Henüz sipariş bulunmuyor.</p><p className="mt-2 text-xs text-[#747974]">Yeni siparişler burada listelenecek.</p></div>
            ) : recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/siparisler/${order.id}`} className="group flex min-w-0 items-center justify-between gap-3 border-b border-[#D9DCD6] py-5 transition-colors duration-300 hover:bg-[#EDECE7] sm:gap-6 sm:px-3">
                <div className="min-w-0 flex-1">
                  <p className="break-all font-[family-name:var(--font-manrope)] text-xs font-semibold sm:text-sm">{order.orderNumber}</p>
                  <p className="mt-1.5 text-[11px] leading-5 text-[#747974]">{order.customer?.username ?? "Misafir"}<span className="mx-2 text-[#C1C5BE]">/</span>{formatDate(order.createdAt)}</p>
                  <p className="mt-1 text-[11px] font-medium text-[#454B45]">{money.format(Number(order.total))} <span className="ml-2 font-normal text-[#858B85]">{order.paymentStatus === "PAID" ? "Ödendi" : order.paymentStatus === "REFUNDED" ? "İade" : order.paymentStatus === "FAILED" ? "Ödeme başarısız" : "Ödeme bekliyor"}</span></p>
                </div>
                <div className="shrink-0"><StatusBadge status={order.status} /></div>
                <ChevronRight size={17} strokeWidth={1.6} className="hidden shrink-0 text-[#A61922] transition-transform duration-300 group-hover:translate-x-1 sm:block" />
              </Link>
            ))}
          </div>
        </section>

        <section className="border-b border-[#D9DCD6] py-10 sm:py-12">
          <SectionHeading eyebrow="OPERASYON" title="Sipariş Durumları" description="Siparişlerin işlem aşamalarına göre dağılımı." />
          <div className="mt-8 grid gap-x-10 sm:grid-cols-2">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              const count = statusCounts[status] ?? 0;
              const percentage = orderCount > 0 ? (count / orderCount) * 100 : 0;
              return (
                <div key={status} className="border-t border-[#D9DCD6] py-5">
                  <div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><Icon size={18} strokeWidth={1.5} className="shrink-0 text-[#A61922]" /><span className="text-xs font-medium sm:text-sm">{config.label}</span></div><span className="font-[family-name:var(--font-manrope)] text-lg font-semibold">{count}</span></div>
                  <div className="mt-4 h-[3px] w-full overflow-hidden bg-[#DFE1DB]"><div className="h-full bg-[#A61922]" style={{ width: `${percentage}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-b border-[#D9DCD6] py-10 sm:py-12">
          <SectionHeading eyebrow="MAĞAZA VERİLERİ" title="Katalog Özeti" description="Ürün ve kategori yapınızın güncel durumu." />
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#D9DCD6] pt-7 sm:gap-8">
            {[{ label: "Ürün", value: productCount, icon: Package }, { label: "Kategori", value: categoryCount, icon: Grid2X2 }, { label: "Görsel", value: imageCount, icon: ImageIcon }].map((item) => {
              const Icon = item.icon;
              return <div key={item.label} className="min-w-0"><Icon size={19} strokeWidth={1.5} className="text-[#A61922]" /><p className="mt-4 font-[family-name:var(--font-manrope)] text-3xl font-semibold tracking-tight sm:text-4xl">{number.format(item.value)}</p><p className="mt-2 text-xs text-[#747974]">{item.label}</p></div>;
            })}
          </div>
        </section>

        {/* STOK TAKİBİ */}
        <section className="border-b border-[#D9DCD6] py-10 sm:py-12">
          <SectionHeading
            eyebrow="ENVANTER KONTROLÜ"
            title="Stok Takibi"
            description="Tükenen ve kritik seviyeye inen ürünleri tek noktadan izleyin. Kritik stok aralığı 1–5 adettir."
            href="/admin/urunler"
            action="Stokları Yönet"
          />

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 border-t border-[#D9DCD6] pt-7 sm:grid-cols-3 sm:gap-x-8">
            <Stat icon={Boxes} label="Toplam Ürün" value={productCount} detail="Katalogdaki tüm ürünler" />
            <Stat icon={AlertTriangle} label="Kritik Stok" value={criticalStockCount} detail="1–5 adet kalan ürün" />
            <Stat icon={PackageX} label="Tükenen Ürün" value={outOfStockCount} detail="Stok miktarı sıfır olanlar" />
          </div>

          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-tight">Stok Uyarıları</h3>
              <span className="text-[11px] text-[#858B85]">
                {number.format(criticalStockCount + outOfStockCount)} ürün dikkat gerektiriyor
              </span>
            </div>

            <div className="mt-4 border-t border-[#D9DCD6]">
              {lowStockProducts.length === 0 ? (
                <div className="flex items-center gap-3 py-7 text-sm text-[#46735C]">
                  <CheckCircle2 size={19} strokeWidth={1.6} />
                  Kritik seviyede veya tükenmiş ürün bulunmuyor.
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href="/admin/urunler"
                    className="group flex min-w-0 items-center justify-between gap-4 border-b border-[#D9DCD6] py-4 transition-colors hover:bg-[#EDECE7] sm:px-3"
                  >
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold">{product.name}</p>
                      <p className="mt-1 text-[11px] text-[#858B85]">
                        {product.category.name}{product.isActive ? "" : " · Pasif ürün"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={`text-xs font-semibold ${product.stock === 0 ? "text-[#A61922]" : "text-[#986A26]"}`}>
                        {product.stock === 0 ? "Tükendi" : `${product.stock} adet`}
                      </span>
                      <ChevronRight size={16} className="text-[#A61922] transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))
              )}
            </div>
            {criticalStockCount + outOfStockCount > lowStockProducts.length && (
              <p className="mt-4 text-xs text-[#747974]">
                İlk {lowStockProducts.length} ürün gösteriliyor. Tüm stok uyarıları için ürün yönetimine gidin.
              </p>
            )}
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <SectionHeading eyebrow="HIZLI ERİŞİM" title="Mağaza Yönetimi" description="Yönetim işlemlerine tek noktadan ulaşın." />
          <div className="mt-8 border-t border-[#D9DCD6]">
            {managementLinks.map((item, index) => {
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className="group flex min-w-0 items-center gap-4 border-b border-[#D9DCD6] py-6 transition-colors duration-300 hover:bg-[#EDECE7] sm:gap-6 sm:px-3"><span className="hidden w-8 shrink-0 text-[11px] font-semibold text-[#A61922] sm:block">{String(index + 1).padStart(2, "0")}</span><Icon size={21} strokeWidth={1.5} className="shrink-0 text-[#A61922]" /><div className="min-w-0 flex-1"><h3 className="font-[family-name:var(--font-manrope)] text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs leading-5 text-[#747974]">{item.description}</p></div><ArrowUpRight size={19} strokeWidth={1.5} className="shrink-0 text-[#A61922] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" /></Link>;
            })}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D9DCD6] py-6"><p className="text-[11px] text-[#747974]">VICIX CAR CARE / Yönetim Sistemi</p><p className="text-[11px] text-[#747974]">Yönetici erişimi</p></footer>
      </div>
    </main>
  );
}
