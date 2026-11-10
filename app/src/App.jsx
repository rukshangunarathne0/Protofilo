import * as React from "react";
import * as ReactDOM from "react-dom";
import * as l from "react/jsx-runtime";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { supabase } from "./lib/supabase.js";
import {
  brandLogoUrl,
  watchHeroUrl,
  assetPhoto1,
  assetPhoto2,
  assetPhoto3,
  assetPhoto4,
  assetPhoto5,
  assetPhoto6,
  assetPhoto7,
  assetPhoto8,
  assetPhoto9,
} from "./assets/photos.js";
import { productImageSrc, productImageSrcSet, productPhoto, registerProductPhotos, isUsablePhoto } from "./assets/products.js";
import publicPriceData from "./data/products.json";
import { ACCEPT_ATTRIBUTE, checkPhotoFile, formatBytes, optimisePhoto, publishProductPhoto } from "./lib/photos.js";
import { calculateBillTotals, downloadBillPdf, formatBillDate } from "./lib/bills.js";

const cn = (...inputs) => twMerge(clsx(inputs));

const ADMIN_EMAIL = "admin@rsd.com";
const ADMIN_USER = {
  email: ADMIN_EMAIL,
  name: "R.S.D. Administrator",
  role: "admin",
  initials: "RS"
};
const RSD_WHATSAPP_NUMBER = "0711368623";
const RSD_WHATSAPP_URL = "https://wa.me/94711368623";
const publicPriceByName = new Map(publicPriceData.map(product => [product.name, Number(product.final_price) || 0]));
const publicProductByName = new Map(publicPriceData.map(product => [product.name, product]));
const rsdWhatsAppLink = (productName = "", price = 0, colour = "Not selected") => `${RSD_WHATSAPP_URL}?text=${encodeURIComponent(`Hi R.S.D., I'd like to order: ${productName || "your timepiece"}, colour: ${colour || "Not selected"}, price: LKR ${bt(Number(price) || 0)}.`)}`;

// Warm the image cache the moment a finger/mouse goes down on a product, so the
// photo is already decoded by the time the detail sheet slides in.
const preloadImage = (src) => {
  if (!src || typeof window === "undefined") return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
};

const Ft = [.16, .84, .24, 1];
function L0(a, n = 1100) {
  const [i, c] = React.useState(0),
    o = React.useRef(0);
  return React.useEffect(() => {
    if (typeof window > "u") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      o.current = a, c(a);
      return;
    }
    let p = 0;
    const m = performance.now(),
      j = o.current,
      x = h => {
        const f = Math.min(1, (h - m) / n),
          q = 1 - Math.pow(1 - f, 3),
          y = j + (a - j) * q;
        o.current = y, c(y), f < 1 && (p = requestAnimationFrame(x));
      };
    return p = requestAnimationFrame(x), () => cancelAnimationFrame(p);
  }, [a, n]), i;
}
function FadeIn({
  children: a,
  delay: n = 0,
  className: i,
  y: c = 18
}) {
  const o = useReducedMotion();
  return <motion.div className={i} initial={o ? !1 : {
    opacity: 0,
    y: c
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: .55,
    delay: n,
    ease: Ft
  }}>{a}</motion.div>;
}
function RuleLine({
  className: a,
  delay: n = 0
}) {
  const i = useReducedMotion();
  return <motion.div className={cn("rule", a)} initial={i ? !1 : {
    scaleX: 0
  }} animate={{
    scaleX: 1
  }} transition={{
    duration: .7,
    delay: n,
    ease: Ft
  }} />;
}
function LegendText({
  children: a,
  className: n
}) {
  return <div className={cn("legend text-ink-3", n)}>{a}</div>;
}
function PanelCard({
  title: a,
  sub: n,
  action: i,
  children: c,
  className: o,
  bodyClass: A
}) {
  return <section className={cn("relative flex flex-col rounded-[3px] border border-line bg-panel", o)}>{(a || i) && <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 px-5 pt-5 pb-4 sm:px-6"><div className="min-w-0">{a && <h2 className="legend-lg text-ink">{a}</h2>}{n && <p className="mt-2 text-[13px] leading-snug text-ink-2">{n}</p>}</div>{i}</header>}{a && <RuleLine className="mx-5 sm:mx-6" />}<div className={cn("flex-1", A ?? "px-5 py-5 sm:px-6 sm:py-6")}>{c}</div></section>;
}
const Nh = {
  gold: "border-gold/45 text-gold",
  muted: "border-line text-ink-2",
  alert: "border-alert/45 text-alert",
  ok: "border-ok/45 text-ok",
  solid: "border-transparent bg-gold-fill text-on-gold"
};
function StatusBadge({
  children: a,
  tone: n = "muted",
  className: i
}) {
  return <span className={cn("legend inline-flex items-center rounded-[2px] border px-2 py-[5px]", Nh[n] ?? Nh.muted, i)}>{a}</span>;
}
function PrimaryBtn({
  children: a,
  className: n,
  onClick: i,
  type: c = "button"
}) {
  return <button type={c} onClick={i} className={cn("legend-lg group inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[2px] bg-gold-fill px-4 py-[11px] text-on-gold transition-all duration-200 hover:brightness-110 active:translate-y-px", n)}>{a}</button>;
}
function SecondaryBtn({
  children: a,
  className: n,
  onClick: i,
  active: c
}) {
  return <button type="button" onClick={i} className={cn("legend inline-flex min-h-[38px] shrink-0 items-center justify-center gap-2 rounded-[2px] border px-3 py-[9px] transition-colors duration-200", c ? "border-gold/60 bg-gold/10 text-gold" : "border-line text-ink-2 hover:border-ink-3 hover:text-ink", n)}>{a}</button>;
}
const Sh = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  orders: <><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></>,
  products: <><path d="M20.6 13.4 12 22l-9-9V4h9z" /><circle cx="7.5" cy="8.5" r="1.4" /></>,
  dealers: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6" /><path d="M16 5.4A3.2 3.2 0 0 1 16 11M17.5 14.8c2.3.6 3.8 2.5 4.2 5.2" /></>,
  analytics: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  comments: <><path d="M21 12a8 8 0 0 1-8 8H4l2.2-3.1A8 8 0 1 1 21 12z" /><path d="M8.5 11h7M8.5 14h4" /></>,
  account: <><circle cx="12" cy="8.5" r="3.6" /><path d="M4.5 20.5c.8-4 3.8-6.2 7.5-6.2s6.7 2.2 7.5 6.2" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
  filter: <path d="M4 5h16l-6.5 7v5l-3 2v-7z" />,
  bell: <><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
  menu: <path d="M3 7h18M3 12h18M3 17h18" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: <><path d="M12 3.5 22 20H2z" /><path d="M12 10v4M12 17h.01" /></>,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  download: <><path d="M12 3v12M7 11l5 5 5-5M4 20h16" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  star: <path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 9.6l6.3-.9z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.3 4.2M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  cart: <><path d="M3 4h2.2l2.3 11h10.8l2-8H6.4" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></>,
  logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 16l-4-4 4-4M6 12h10" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  scan: <><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" /><path d="M9 10h.01M15 10h.01M9 14.5c.8.9 1.8 1.3 3 1.3s2.2-.4 3-1.3" /></>,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6z" /><path d="m9 12 2 2 4-4.5" /></>,
  truck: <><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z" />
};
function Icon({
  name: a,
  className: n,
  strokeWidth: i = 1.5
}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={i} strokeLinecap="round" strokeLinejoin="round" className={cn("h-[18px] w-[18px]", n)} aria-hidden="true">{Sh[a] ?? Sh.overview}</svg>;
}
function BrandClockLogo({
  size: a = 34,
  className: n
}) {
  return <img src={brandLogoUrl} alt="" width={a} height={a} onError={i => {
    if (!i.currentTarget.dataset.fallback) {
      i.currentTarget.dataset.fallback = "1";
      i.currentTarget.src = brandLogoUrl;
    }
  }} className={cn("brand-rsd-logo", n)} draggable={!1} aria-hidden="true" />;
}
function v0(a, n = .32) {
  if (a.length < 2) return "";
  let i = `M ${a[0][0].toFixed(2)} ${a[0][1].toFixed(2)}`;
  for (let c = 0; c < a.length - 1; c++) {
    const o = a[c - 1] ?? a[c],
      A = a[c],
      p = a[c + 1],
      m = a[c + 2] ?? p,
      j = A[0] + (p[0] - o[0]) / 6 * n * 2,
      x = A[1] + (p[1] - o[1]) / 6 * n * 2,
      h = p[0] - (m[0] - A[0]) / 6 * n * 2,
      f = p[1] - (m[1] - A[1]) / 6 * n * 2;
    i += ` C ${j.toFixed(2)} ${x.toFixed(2)}, ${h.toFixed(2)} ${f.toFixed(2)}, ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  }
  return i;
}
function Sparkline({
  values: a,
  className: n,
  strokeWidth: i = 1.5
}) {
  const c = useReducedMotion(),
    o = 120,
    A = 36,
    p = Math.max(...a, 1),
    m = Math.min(...a, 0),
    j = p - m || 1,
    x = a.map((h, f) => [f / (a.length - 1) * o, A - 2 - (h - m) / j * (A - 4)]);
  return <svg viewBox={`0 0 ${o} ${A}`} preserveAspectRatio="none" className={cn("h-9 w-full overflow-visible", n)} aria-hidden="true"><motion.path d={v0(x)} fill="none" stroke="var(--gold)" strokeWidth={i} strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={c ? !1 : {
      pathLength: 0,
      opacity: 0
    }} animate={{
      pathLength: 1,
      opacity: 1
    }} transition={{
      duration: 1.1,
      ease: Ft,
      delay: .25
    }} /></svg>;
}
function RevenueAreaChart({
  data: a,
  height: n = 300,
  heightClass: i,
  id: c = "rev"
}) {
  const o = useReducedMotion(),
    [A, p] = React.useState(null),
    m = React.useRef(null),
    j = 1e3,
    x = 300,
    peak = a.length ? Math.max(...a.map(R => R.value)) : 0,
    // Axis top follows the busiest day instead of a fixed 2M, so the line fills
    // the frame. Above 500K a day the top is the next 500K step: a 600K peak
    // tops at 1M, a 1M day at 1.5M, a 2M day at 2.5M. Quieter periods step in
    // 100K instead, which keeps the same "one step of headroom" look.
    chartStep = peak >= 5e5 ? 5e5 : 1e5,
    h = Math.max(chartStep, Math.ceil(Math.max(0, peak) * 1.02 / chartStep) * chartStep),
    f = a.map((R, J) => [J / (a.length - 1) * j, x - R.value / h * x]),
    q = v0(f),
    y = `${q} L ${j} ${x} L 0 ${x} Z`,
    N = [0, .25, .5, .75, 1].map(R => R * h),
    k = R => {
      const J = m.current?.getBoundingClientRect();
      if (!J) return;
      const v = (R.clientX - J.left) / J.width;
      p(Math.max(0, Math.min(a.length - 1, Math.round(v * (a.length - 1)))));
    },
    O = A === null ? null : a[A];
  return <div ref={m} className={cn("relative w-full touch-pan-y select-none", i)} style={i ? void 0 : {
    height: n
  }} onPointerMove={k} onPointerDown={k} onPointerLeave={() => p(null)}>{N.map((R, J) => <div className="pointer-events-none absolute inset-x-0 flex items-center" style={{
      top: `${(1 - R / h) * 100}%`
    }} key={J}><div className="h-px w-full" style={{
        background: J === 0 ? "var(--line)" : "var(--line-soft)"
      }} /><span className="legend absolute -top-[7px] right-0 bg-panel pl-2 text-ink-3">{R >= 1e6 ? `${(R / 1e6).toFixed(R % 1e6 ? 1 : 0)}M` : R === 0 ? "0" : `${R / 1e3}K`}</span></div>)}<svg viewBox={`0 0 ${j} ${x}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible"><defs><linearGradient id={`fill-${c}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--gold)" stopOpacity="0.3" /><stop offset="65%" stopColor="var(--gold)" stopOpacity="0.05" /><stop offset="100%" stopColor="var(--gold)" stopOpacity="0" /></linearGradient></defs><motion.path d={y} fill={`url(#fill-${c})`} initial={o ? !1 : {
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: .9,
        delay: .5
      }} /><motion.path d={q} fill="none" stroke="var(--gold)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={o ? !1 : {
        pathLength: 0
      }} animate={{
        pathLength: 1
      }} transition={{
        duration: 1.5,
        ease: Ft,
        delay: .15
      }} /></svg>{O && <><div className="pointer-events-none absolute top-0 bottom-0 w-px bg-gold/45" style={{
        left: `${(A ?? 0) / (a.length - 1) * 100}%`
      }} /><div className="pointer-events-none absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold ring-4 ring-gold/15" style={{
        left: `${(A ?? 0) / (a.length - 1) * 100}%`,
        top: `${(1 - O.value / h) * 100}%`
      }} /><div className="pointer-events-none absolute z-10 -translate-y-[calc(100%+14px)] rounded-[2px] border border-gold/40 bg-raised px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.45)]" style={{
        left: `${(A ?? 0) / (a.length - 1) * 100}%`,
        transform: `translateX(${(A ?? 0) / (a.length - 1) > .75 ? "-100%" : (A ?? 0) / (a.length - 1) < .12 ? "0%" : "-50%"}) translateY(calc(-100% - 14px))`,
        top: `${(1 - O.value / h) * 100}%`
      }}><div className="legend text-ink-3">{O.label}</div><div className="tnum mt-1 text-[13px] font-medium text-gold">{"LKR "}{O.value.toLocaleString("en-US")}</div></div></>}</div>;
}
function FilterRow({
  children: a,
  className: n
}) {
  return <div className={cn("no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0", n)}>{a}</div>;
}
function MetricBar({
  label: a,
  value: n,
  max: i,
  sub: c,
  tone: o = "gold"
}) {
  const A = useReducedMotion(),
    p = i > 0 ? Math.max(n > 0 ? 3 : 0, n / i * 100) : 0,
    m = o === "alert" ? "var(--alert)" : o === "muted" ? "var(--ink-3)" : "var(--gold)";
  return <div className="group"><div className="flex items-baseline justify-between gap-4"><div className="legend-lg min-w-0 flex-1 truncate text-ink">{a}</div><div className="tnum shrink-0 text-[11.5px] text-ink-2">{c}</div></div><div className="mt-2.5 h-[3px] w-full bg-line"><motion.div className="h-full" style={{
        background: m
      }} initial={A ? !1 : {
        width: 0
      }} animate={{
        width: `${p}%`
      }} transition={{
        duration: .9,
        ease: Ft,
        delay: .1
      }} /></div></div>;
}
const Tr = "4 Oct – 2 Nov",
  m5 = "Sunday, 2 November",
  Dn = (a, n) => `2025-${String(n + 1).padStart(2, "0")}-${String(a).padStart(2, "0")}`,
  no = [];
(() => {
  const a = [],
    n = new Date(Date.UTC(2025, 9, 4));
  for (let c = 0; c < 30; c++) {
    const o = new Date(n.getTime() + c * 864e5),
      A = `${o.getUTCDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][o.getUTCMonth()]}`;
    a.push({
      label: A,
      value: 0
    });
  }
  const i = c => {
    const o = new Date(c + "T00:00:00Z");
    return Math.round((o.getTime() - n.getTime()) / 864e5);
  };
  return no.forEach(c => {
    const o = i(c.date);
    o >= 0 && o < a.length && (a[o].value += c.amount);
  }), a;
})();
const hA = [{
    sku: "HT-W-214",
    name: "Meridian Automatic 40mm",
    category: "Wrist Watches",
    gender: "Men",
    productType: "Watches",
    isNew: false,
    stock: 4,
    reserved: 22,
    price: publicPriceByName.get("Meridian Automatic 40mm") || 12450,
    image: "images/product-wrist.jpg",
    trend: [8, 12, 9, 14, 22, 19, 31]
  }, {
    sku: "HT-W-118",
    name: "Aurelia Slim Quartz",
    category: "Wrist Watches",
    gender: "Women",
    productType: "Watches",
    isNew: true,
    stock: 61,
    reserved: 14,
    price: publicPriceByName.get("Aurelia Slim Quartz") || 4190,
    image: "images/product-wrist.jpg",
    trend: [12, 9, 14, 11, 16, 13, 18]
  }, {
    sku: "HT-W-330",
    name: "Diver Chronograph 42mm",
    category: "Wrist Watches",
    gender: "Men",
    productType: "Watches",
    isNew: false,
    stock: 2,
    reserved: 7,
    price: publicPriceByName.get("Diver Chronograph 42mm") || 15985,
    image: "images/product-wrist.jpg",
    trend: [3, 5, 4, 7, 6, 9, 7]
  }, {
    sku: "HT-W-512",
    name: "Skeleton Tourbillon — Dealer Ed.",
    category: "Wrist Watches",
    gender: "Unisex",
    productType: "Watches",
    isNew: true,
    stock: 1,
    reserved: 15,
    price: publicPriceByName.get("Skeleton Tourbillon — Dealer Ed.") || 69377,
    image: "images/product-wrist.jpg",
    trend: [1, 0, 2, 1, 3, 2, 2]
  }, {
    sku: "HT-C-042",
    name: "Regulator Wall Clock 30cm",
    category: "Wall Watches",
    gender: "Unisex",
    productType: "Wall clocks",
    isNew: false,
    stock: 18,
    reserved: 5,
    price: publicPriceByName.get("Regulator Wall Clock 30cm") || 5212,
    image: "images/product-wall.jpg",
    trend: [2, 4, 3, 5, 4, 6, 5]
  }, {
    sku: "HT-C-017",
    name: "Pendulum Table Clock",
    category: "Table Watches",
    gender: "Unisex",
    productType: "Table clocks",
    isNew: false,
    stock: 23,
    reserved: 3,
    price: publicPriceByName.get("Pendulum Table Clock") || 4520,
    image: "images/product-table.jpg",
    trend: [1, 3, 2, 4, 3, 2, 4]
  }];
hA.filter(a => a.stock <= 4);
const x5 = [],
  M0 = [],
  os = [],
  Al = [{
    tone: "Stock",
    title: "5 products low on stock",
    detail: "W-330 · W-512 · W-214 and 2 more below reorder point",
    action: "Open reorder list"
  }, {
    tone: "Favourites",
    title: "Watch favourites are ready to review",
    detail: "See which watches visitors save most often and plan your next promotion.",
    action: "Review favourite counts"
  }, {
    tone: "Dealers",
    title: "1 dealer pending approval",
    detail: "Kurunegala Hourglass submitted documents on 19 Oct",
    action: "Open approvals"
  }],
  bt = a => a.toLocaleString("en-US"),
  j5 = a => a >= 1e6 ? `${(a / 1e6).toFixed(a % 1e6 === 0 ? 0 : 1)}M` : a >= 1e3 ? `${Math.round(a / 1e3)}K` : String(a);
const X0 = React.createContext({
  user: null,
  authReady: true,
  login: async () => "Administrator sign-in is unavailable.",
  logout: () => {}
}),
  Vl = () => React.useContext(X0);
function AuthProvider({
  children: a
}) {
  const adminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const [user, setUser] = React.useState(null);
  const [authReady, setAuthReady] = React.useState(!adminRoute);
  const login = React.useCallback(async (emailValue, password) => {
    const email = emailValue.trim().toLowerCase();
    if (email !== ADMIN_EMAIL) return "Administrator access is restricted.";
    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) return result.error || "Invalid administrator credentials.";
      setUser(ADMIN_USER);
      return null;
    } catch {
      return "Administrator sign-in is temporarily unavailable.";
    }
  }, []);
  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/admin-logout", { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
    window.scrollTo({ top: 0 });
  }, []);
  React.useEffect(() => {
    if (!adminRoute) {
      setAuthReady(true);
      return undefined;
    }
    let cancelled = false;
    setAuthReady(false);
    fetch("/api/admin-session", { credentials: "include" })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        if (!cancelled && result?.authenticated) setUser(ADMIN_USER);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => { cancelled = true; };
  }, [adminRoute]);
  return <X0.Provider value={{ user, authReady, login, logout }}>{a}</X0.Provider>;
}
const fp = "ht-store-v3",
  kh = ["Submitted", "Confirmed", "Packing", "Ready", "Completed"],
  Dr = () => ({
    orders: no.map(a => ({
      ...a,
      lines: a.lines.map(n => ({
        ...n
      }))
    })),
    products: hA.map(a => ({
      ...a,
      trend: [...a.trend]
    })),
    dealers: x5.map(a => ({
      name: a.name,
      email: a.email,
      city: a.city,
      since: a.since,
      status: a.status,
      terms: a.terms
    })),
    reviews: os.map((a, idx) => ({ id: idx + 1, ...a }))
  });
function q5() {
  try {
    const a = localStorage.getItem(fp);
    if (!a) return Dr();
    const n = JSON.parse(a),
      i = Dr();
    return {
      orders: Array.isArray(n.orders) && n.orders.length ? n.orders : i.orders,
      products: Array.isArray(n.products) && n.products.length ? n.products : i.products,
      dealers: Array.isArray(n.dealers) && n.dealers.length ? n.dealers : i.dealers,
      reviews: Array.isArray(n.reviews) && n.reviews.length ? n.reviews : i.reviews
    };
  } catch {
    return Dr();
  }
}
function fs(a, productsList = hA) {
  // Revenue is earned only after the administrator marks an order Completed.
  const n = a.filter(f => f.status === "Completed"),
    i = n.reduce((f, q) => f + q.amount, 0),
    c = n.reduce((f, q) => f + q.units, 0),
    o = n.length,
    A = kh.map(f => ({
      stage: f,
      count: a.filter(q => q.status === f).length
    })),
    p = new Map();
  n.forEach(f => {
    const q = f.lines.reduce((N, k) => N + k.qty * k.price, 0);
    let y = 0;
    f.lines.forEach((N, k) => {
      const O = productsList.find(J => J.sku === N.sku)?.category ?? hA.find(J => J.sku === N.sku)?.category ?? "Others",
        R = k === f.lines.length - 1 ? f.amount - y : Math.round(f.amount * (N.qty * N.price) / Math.max(1, q));
      y += R, p.set(O, (p.get(O) ?? 0) + R);
    });
  });
  const m = n.reduce((f, q) => {
      const y = Date.parse(`${q.date}T00:00:00Z`);
      return Number.isFinite(y) ? Math.max(f, y) : f;
    }, Date.UTC(2025, 10, 2)),
    j = new Date(m),
    x = new Date(m - 29 * 864e5),
    h = Array.from({
      length: 30
    }, (f, q) => {
      const y = new Date(x.getTime() + q * 864e5);
      return {
        label: `${y.getUTCDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][y.getUTCMonth()]}`,
        value: 0
      };
    });
  return n.forEach(f => {
    const q = new Date(f.date + "T00:00:00Z"),
      y = Math.round((q.getTime() - x.getTime()) / 864e5);
    y >= 0 && y < h.length && (h[y].value += f.amount);
  }), {
    revenue: i,
    units: c,
    count: o,
    avg: o ? Math.round(i / o) : 0,
    pipeline: A,
    daily: h,
    periodLabel: `${h[0].label} - ${h[h.length - 1].label} ${j.getUTCFullYear()}`,
    byCategory: p,
    stages: kh
  };
}
function f5(a, n) {
  switch (n.type) {
    case "placeOrder":
      {
        if (a.orders.some(A => A.id === n.order.id)) return a;
        const i = new Map(a.products.map(A => [A.sku, A.stock])),
          c = n.order.lines.map(A => {
            const p = i.get(A.sku) ?? 0,
              m = Math.min(Math.max(0, p), A.qty);
            return i.set(A.sku, p - m), {
              ...A,
              reservedQty: m
            };
          }),
          o = a.products.map(A => {
            const p = c.filter(m => m.sku === A.sku).reduce((m, j) => m + j.reservedQty, 0);
            return p ? {
              ...A,
              stock: A.stock - p,
              reserved: A.reserved + p
            } : A;
          });
        return {
          ...a,
          products: o,
          orders: [{
            ...n.order,
            lines: c
          }, ...a.orders]
        };
      }
    case "setOrderStatus":
      {
        const i = a.orders.find(o => o.id === n.id);
        if (!i || i.status === n.status) return a;
        const c = i.status !== "Completed" && n.status === "Completed" ? a.products.map(o => {
          const A = i.lines.filter(p => p.sku === o.sku).reduce((p, m) => p + (m.reservedQty ?? 0), 0);
          return A ? {
            ...o,
            reserved: Math.max(0, o.reserved - A)
          } : o;
        }) : a.products;
        return {
          ...a,
          products: c,
          orders: a.orders.map(o => o.id === n.id ? {
            ...o,
            status: n.status
          } : o)
        };
      }
    case "setDealer":
      return {
        ...a,
        dealers: a.dealers.map(i => i.name === n.name ? {
          ...i,
          ...n.patch
        } : i)
      };
    case "adjustStock":
      return {
        ...a,
        products: a.products.map(i => i.sku === n.sku ? {
          ...i,
          stock: Math.max(0, i.stock + n.delta)
        } : i)
      };
    case "addProduct":
      return a.products.some(i => i.sku === n.product.sku) ? a : {
        ...a,
        products: [...a.products, n.product]
      };
    case "updateProduct":
      return {
        ...a,
        products: a.products.map(i => i.sku === n.sku ? {
          ...i,
          ...n.patch,
          sku: i.sku
        } : i)
      };
    case "addFeedback":
      return {
        ...a,
        reviews: [n.item, ...(a.reviews || [])]
      };
    case "setFeedbackStatus":
      return {
        ...a,
        reviews: (a.reviews || []).map(i => i.id === n.id ? {
          ...i,
          status: n.status,
          resolved: n.status === "read"
        } : i)
      };
    case "deleteFeedback":
      return {
        ...a,
        reviews: (a.reviews || []).filter(i => i.id !== n.id)
      };
    case "replace":
      return {
        ...a,
        ...n.state
      };
    case "reset":
      return Dr();
    default:
      return a;
  }
}
function formatAgoLabel(createdAt, fallback = "Just now") {
  if (!createdAt) return fallback;
  const ts = Date.parse(createdAt);
  if (!Number.isFinite(ts)) return fallback;
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
const C0 = React.createContext(null);
function qe() {
  const a = React.useContext(C0);
  if (!a) throw new Error("useStore must be used inside <StoreProvider>");
  return a;
}
async function requestAdminAction(action, payload = {}) {
  const response = await fetch("/api/admin-action", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error || "Administrator action failed.");
  return result;
}
function StoreProvider({
  children: a
}) {
  const { user: currentUser, authReady } = Vl();
  const adminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const [n, i] = React.useReducer(f5, void 0, () => {
      const base = Dr();
      const initial = typeof window === "undefined" ? base : { ...base, orders: [], dealers: [], reviews: [] };
      registerProductPhotos(initial.products);
      return initial;
    }),
    [c, o] = React.useState(!1),
    [syncStatus, setSyncStatus] = React.useState("connecting"),
    A = React.useRef(n);
  A.current = n;

  const fetchFromSupabase = React.useCallback(async () => {
    if (!adminRoute) {
      try {
        const { data, error } = await supabase.from("ht_products").select("sku,name,category,price,image,description,colors,gender,product_type,is_new,availability").order("sku", { ascending: true });
        if (error) {
          setSyncStatus("offline");
          return;
        }
        const nextProducts = (data || []).map(r => ({
          sku: r.sku,
          name: r.name,
          category: r.category,
          price: Number(r.price) || 0,
          image: r.image || "images/product-wrist.jpg",
          description: r.description ?? undefined,
          colors: Array.isArray(r.colors) ? r.colors : [],
          gender: r.gender || "Unisex",
          productType: r.product_type || "Watches",
          isNew: !!r.is_new,
          availability: r.availability || "Available to order",
          trend: hA.find(product => product.sku === r.sku)?.trend || [0, 0, 0, 0, 0, 0, 0],
        }));
        registerProductPhotos(nextProducts);
        if (nextProducts.length) i({ type: "replace", state: { products: nextProducts } });
        setSyncStatus("live");
      } catch {
        setSyncStatus("offline");
      } finally {
        o(true);
      }
      return;
    }
    if (!authReady || currentUser?.role !== "admin") {
      setSyncStatus(authReady ? "offline" : "connecting");
      o(authReady);
      return;
    }
    try {
      const response = await fetch("/api/admin-data", { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error("Admin data request failed");
      const payload = await response.json();
      const nextProducts = (payload.products || []).map(r => ({
        sku: r.sku,
        name: r.name,
        category: r.category,
        price: Number(r.price) || 0,
        stock: Number(r.stock) || 0,
        reserved: Number(r.reserved) || 0,
        image: r.image || "images/product-wrist.jpg",
        brand: r.brand ?? undefined,
        description: r.description ?? undefined,
        colors: Array.isArray(r.colors) ? r.colors : [],
        gender: r.gender || "Unisex",
        productType: r.product_type || "Watches",
        isNew: !!r.is_new,
        availability: r.availability || "Available to order",
        favoriteCount: Number(r.favorite_count) || 0,
        supplierPrice: r.supplier_price == null ? undefined : Number(r.supplier_price),
        markupPercent: r.markup_percent == null ? undefined : Number(r.markup_percent),
        trend: Array.isArray(r.trend) ? r.trend.map(Number) : [0, 0, 0, 0, 0, 0, 0],
      }));
      const nextDealers = (payload.dealers || []).map(r => ({
        name: r.name,
        email: r.email || undefined,
        city: r.city,
        since: r.since,
        status: r.status,
        terms: r.terms,
      }));
      const nextOrders = (payload.orders || []).map(r => ({
        id: r.id,
        dealer: r.dealer,
        city: r.city,
        date: r.date,
        amount: Number(r.amount) || 0,
        units: Number(r.units) || 0,
        status: r.status,
        channel: r.channel,
        delivery: r.delivery || undefined,
        reference: r.reference || undefined,
        customerName: r.customer_name || r.customerName || r.customer_name_text || undefined,
        customerPhone: r.customer_phone || r.customerPhone || r.phone || undefined,
        deliveryAddress: r.delivery_address || r.deliveryAddress || r.address || undefined,
        lines: Array.isArray(r.lines) ? r.lines.map(ln => ({
          sku: ln.sku,
          name: ln.name,
          colour: ln.colour || ln.color || ln.colour_name || undefined,
          color: ln.color || ln.colour || undefined,
          qty: Number(ln.qty) || 0,
          price: Number(ln.price) || 0,
          reservedQty: ln.reservedQty != null ? Number(ln.reservedQty) : undefined,
        })) : [],
      }));
      const nextReviews = (payload.feedback || []).map(r => ({
        id: r.id,
        author: r.name,
        name: r.name,
        email: r.email || "",
        phone: r.phone || "",
        rating: r.rating != null ? Number(r.rating) : 0,
        body: r.message,
        status: r.status || "new",
        resolved: r.status === "read",
        isDealer: !!r.is_dealer,
        role: r.role_label || (r.is_dealer ? "Registered dealer" : "Visitor"),
        time: formatAgoLabel(r.created_at),
        createdAt: r.created_at,
      }));
      registerProductPhotos(nextProducts);
      i({ type: "replace", state: {
        products: nextProducts,
        dealers: nextDealers,
        orders: nextOrders,
        reviews: nextReviews,
      }});
      setSyncStatus("live");
    } catch {
      setSyncStatus("offline");
    } finally {
      o(true);
    }
  }, [adminRoute, authReady, currentUser?.role]);

  // Coalesce realtime echoes into one refresh. Without this, one stock change
  // fires several full 5-table refetches in a burst, which is what made taps
  // feel heavy on mobile.
  const syncTimer = React.useRef(null);
  const scheduleSync = React.useCallback(() => {
    window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => {
      fetchFromSupabase();
    }, 800);
  }, [fetchFromSupabase]);

  React.useEffect(() => {
    if (adminRoute && (!authReady || currentUser?.role !== "admin")) return undefined;
    fetchFromSupabase();
    let channel = supabase
      .channel(adminRoute ? "rsd-admin-realtime" : "rsd-public-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "ht_products" }, scheduleSync);
    if (adminRoute) {
      channel = channel
        .on("postgres_changes", { event: "*", schema: "public", table: "ht_orders" }, scheduleSync)
        .on("postgres_changes", { event: "*", schema: "public", table: "feedback" }, scheduleSync)
        .on("postgres_changes", { event: "*", schema: "public", table: "ht_product_favorites" }, scheduleSync);
    }
    channel.subscribe();
    return () => {
      window.clearTimeout(syncTimer.current);
      supabase.removeChannel(channel);
    };
  }, [adminRoute, authReady, currentUser?.role, fetchFromSupabase, scheduleSync]);

  const p = React.useMemo(() => ({
    ...n,
    ready: c,
    syncStatus,
    refresh: fetchFromSupabase,
    placeOrder: async m => {
      i({ type: "placeOrder", order: m });
      try {
        await requestAdminAction("placeOrder", { order: m });
        await fetchFromSupabase();
      } catch {}
    },
    setOrderStatus: async (m, j) => {
      i({ type: "setOrderStatus", id: m, status: j });
      try {
        await requestAdminAction("setOrderStatus", { id: m, status: j });
        await fetchFromSupabase();
      } catch {}
    },
    setDealer: async (m, j) => {
      i({ type: "setDealer", name: m, patch: j });
      try {
        await requestAdminAction("setDealer", { name: m, patch: j });
        await fetchFromSupabase();
      } catch {}
    },
    adjustStock: async (m, j) => {
      i({ type: "adjustStock", sku: m, delta: j });
      try {
        await requestAdminAction("adjustStock", { sku: m, delta: j });
        await fetchFromSupabase();
      } catch {}
    },
    addProduct: async m => {
      i({ type: "addProduct", product: m });
      registerProductPhotos([m]);
      try {
        await requestAdminAction("addProduct", { product: m });
        await fetchFromSupabase();
        return { ok: !0 };
      } catch (err) {
        return { ok: !1, error: err?.message || "Network problem — the product was not saved." };
      }
    },
    updateProduct: async (m, j) => {
      i({ type: "updateProduct", sku: m, patch: j });
      registerProductPhotos([{ sku: m, image: j.image }]);
      try {
        await requestAdminAction("updateProduct", { sku: m, patch: j });
        await fetchFromSupabase();
        return { ok: !0 };
      } catch (err) {
        return { ok: !1, error: err?.message || "Network problem — the changes were not saved." };
      }
    },
    sendFeedback: async m => {
      const cleanName = (m.name || "").trim();
      const cleanMsg = (m.message || "").trim();
      const cleanContact = (m.contact || "").trim();
      const ratingVal = m.rating && Number(m.rating) >= 1 && Number(m.rating) <= 5 ? Math.round(Number(m.rating)) : null;
      const emailVal = cleanContact.includes("@") ? cleanContact : null;
      const phoneVal = cleanContact && !cleanContact.includes("@") ? cleanContact : null;
      const roleLabel = m.roleLabel || (m.isDealer ? "Registered dealer" : "Visitor");
      const optimistic = {
        id: `tmp-${Date.now()}`,
        author: cleanName,
        name: cleanName,
        email: emailVal || "",
        phone: phoneVal || "",
        rating: ratingVal || 0,
        body: cleanMsg,
        status: "new",
        resolved: false,
        isDealer: !!m.isDealer,
        role: roleLabel,
        time: "Just now",
        createdAt: new Date().toISOString(),
      };
      i({ type: "addFeedback", item: optimistic });
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cleanName,
            contact: cleanContact,
            rating: ratingVal,
            message: cleanMsg,
            isDealer: !!m.isDealer,
            roleLabel,
          }),
        });
        if (!response.ok) return false;
        if (adminRoute) await fetchFromSupabase();
        return true;
      } catch {
        return false;
      }
    },
    setFeedbackStatus: async (m, j) => {
      const nextSt = j === "read" ? "read" : "new";
      i({ type: "setFeedbackStatus", id: m, status: nextSt });
      try {
        await requestAdminAction("setFeedbackStatus", { id: m, status: nextSt });
        await fetchFromSupabase();
      } catch {}
    },
    deleteFeedback: async m => {
      i({ type: "deleteFeedback", id: m });
      try {
        await requestAdminAction("deleteFeedback", { id: m });
        await fetchFromSupabase();
      } catch {}
    },
    reset: async () => {
      i({ type: "reset" });
      try {
        await requestAdminAction("reset");
        await fetchFromSupabase();
      } catch {}
    }
  }), [n, c, syncStatus, fetchFromSupabase]);
  return <C0.Provider value={p}>{a}</C0.Provider>;
}
const F0 = a => `WC-${a.reduce((i, c) => {
    const o = Number(c.id.split("-")[1]);
    return Number.isFinite(o) && o > i ? o : i;
  }, 1009) + 1}`,
  S5 = [{
    group: "Workspace",
    items: [{
      id: "overview",
      label: "Overview",
      icon: "overview"
    }, {
      id: "orders",
      label: "Orders",
      icon: "orders",
      badge: "8"
    }, {
      id: "bills",
      label: "Bills / Receipt",
      icon: "receipt"
    }]
  }, {
    group: "Catalogue",
    items: [{
      id: "products",
      label: "Products",
      icon: "products",
      badge: "27"
    }, {
      id: "dealers",
      label: "Dealers",
      icon: "dealers"
    }]
  }, {
    group: "Intelligence",
    items: [{
      id: "analytics",
      label: "Analytics",
      icon: "analytics"
    }, {
      id: "comments",
      label: "Comments",
      icon: "comments",
      badge: "4"
    }]
  }, {
    group: "System",
    items: [{
      id: "account",
      label: "My Account",
      icon: "account"
    }]
  }],
  Md = {
    overview: "Overview",
    orders: "Orders",
    bills: "Bills / Receipt",
    products: "Products",
    "new-product": "Add product",
    dealers: "Dealers",
    analytics: "Analytics",
    comments: "Comments",
    account: "My Account",
    more: "More"
  };
function SidebarNav({
  view: a,
  onNavigate: n,
  onDone: i
}) {
  const {
    orders: c,
    products: o,
    reviews: rList = []
  } = qe(),
  unreadFb = rList.filter(item => item.status === "new" || !item.resolved).length;
  return <nav className="flex flex-col gap-7">{S5.map(A => <div key={A.group}><LegendText className="px-3 pb-3 text-ink-3/80">{A.group}</LegendText><ul className="flex flex-col gap-[3px]">{A.items.map(p => {
          const m = a === p.id;
          return <li key={p.id}><button onClick={() => {
              n(p.id), i?.();
            }} className={cn("group relative flex w-full items-center gap-3 rounded-[2px] px-3 py-[10px] text-left text-[13.5px] transition-colors duration-200", m ? "bg-raised text-gold" : "text-ink-2 hover:bg-raised/60 hover:text-ink")}><span className={cn("absolute top-1/2 left-0 h-5 w-[2px] -translate-y-1/2 rounded-full transition-all duration-300", m ? "scale-y-100 bg-gold" : "scale-y-0 bg-gold/50")} /><Icon name={p.icon} className={cn("h-[17px] w-[17px]", m ? "text-gold" : "text-ink-3 group-hover:text-ink-2")} /><span className="flex-1 truncate">{p.label}</span>{p.badge && <span className={cn("tnum text-[10.5px]", m ? "text-gold/80" : "text-ink-3")}>{p.id === "orders" ? c.length : p.id === "products" ? o.length : p.id === "comments" ? (unreadFb || rList.length) : p.badge}</span>}</button></li>;
        })}</ul></div>)}</nav>;
}
function ThemeSwitcher({
  theme: a,
  setTheme: n
}) {
  return <div className="flex items-center justify-between gap-3"><LegendText className="text-ink-3">Theme</LegendText><div className="flex rounded-[2px] border border-line p-[3px]">{["dark", "light"].map(i => <button onClick={() => n(i)} className={cn("legend rounded-[1px] px-[10px] py-[6px] transition-colors duration-200", a === i ? "bg-gold-fill text-on-gold" : "text-ink-3 hover:text-ink")} key={i}>{i === "dark" ? "Black" : "White"}</button>)}</div></div>;
}
function DesktopSidebar({
  view: a,
  onNavigate: n,
  theme: i,
  setTheme: c
}) {
  const {
    logout: o
  } = Vl();
  return <div className="flex h-full flex-col bg-panel"><div className="flex items-center gap-3 px-5 pt-6 pb-5"><span className="text-gold"><BrandClockLogo size={32} /></span><div><div className="font-display text-[17px] leading-none font-semibold tracking-[0.01em] text-ink">R.S.D.</div><div className="legend mt-[7px] text-gold/80">Modern Timepieces</div></div></div><div className="rule mx-5" /><div className="flex-1 overflow-y-auto px-3 py-6"><SidebarNav view={a === "new-product" ? "products" : a} onNavigate={n} /></div><div className="px-5 pt-4 pb-5"><div className="rule mb-4" /><ThemeSwitcher theme={i} setTheme={c} /><div className="mt-4 flex items-center gap-3 rounded-[2px] border border-line bg-raised px-3 py-[10px]"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] bg-gold-fill text-[11px] font-semibold text-on-gold">AD</div><div className="min-w-0"><div className="truncate text-[13px] font-medium text-ink">Admin</div><div className="legend mt-1 truncate text-ink-3">Administrator</div></div><button onClick={o} aria-label="Sign out" title="Sign out" className="ml-auto flex h-8 w-8 items-center justify-center rounded-[2px] text-ink-3 transition-colors hover:bg-panel hover:text-alert"><Icon name="logout" className="h-4 w-4" /></button></div></div></div>;
}
function O5(a, n, i, c) {
  const o = a.trim().toLowerCase();
  if (!o) return [];
  const A = [];
  return n.forEach(p => {
    `${p.id} ${p.dealer} ${p.city}`.toLowerCase().includes(o) && A.push({
      view: "orders",
      title: p.id,
      sub: `${p.dealer} · LKR ${p.amount.toLocaleString("en-US")}`
    });
  }), i.forEach(p => {
    `${p.sku} ${p.name} ${p.category}`.toLowerCase().includes(o) && A.push({
      view: "products",
      title: p.name,
      sub: `${p.sku} · ${p.stock} in stock`
    });
  }), c.forEach(p => {
    `${p.name} ${p.city}`.toLowerCase().includes(o) && A.push({
      view: "dealers",
      title: p.name,
      sub: `${p.city} · ${p.status}`
    });
  }), A.slice(0, 6);
}
function DesktopHeader({
  view: a,
  onNavigate: n,
  theme: i,
  setTheme: c,
  menuOpen: o,
  setMenuOpen: A
}) {
  const {
      orders: p,
      products: m,
      dealers: j
    } = qe(),
    [x, h] = React.useState(""),
    [f, q] = React.useState(!1),
    [y, N] = React.useState(!1),
    k = React.useMemo(() => O5(x, p, m, j), [x, p, m, j]);
  return React.useEffect(() => {
    if (!o) return;
    const O = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const R = J => {
      J.key === "Escape" && A(!1);
    };
    return window.addEventListener("keydown", R), () => {
      document.body.style.overflow = O, window.removeEventListener("keydown", R);
    };
  }, [o, A]), <><header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-xl"><div className="flex h-[68px] items-center gap-4 px-5 sm:px-8 lg:px-10"><button className="-ml-2 flex h-11 w-11 items-center justify-center rounded-[2px] text-ink-2 transition-colors hover:text-ink lg:hidden" onClick={() => A(!0)} aria-label="Open navigation"><Icon name="menu" className="h-5 w-5" /></button><button onClick={() => n("overview")} className="flex items-center gap-2.5 lg:hidden" aria-label="R.S.D. Premium Watches \u2014 overview"><span className="text-gold"><BrandClockLogo size={24} /></span><span className="text-left"><span className="font-display block text-[15px] leading-none font-semibold tracking-[0.01em] text-ink">R.S.D.</span><span className="legend mt-[5px] block text-gold/80">Modern Timepieces</span></span></button><div className="hidden min-w-0 items-baseline gap-3 lg:flex"><span className="legend text-ink-3">R.S.D. Premium Watches</span><span className="text-ink-3">/</span><span className="legend text-gold">{Md[a]}</span></div><button onClick={() => N(O => !O)} aria-label={y ? "Close search" : "Search"} aria-expanded={y} className="ml-auto flex h-11 w-11 items-center justify-center rounded-[2px] border border-line text-ink-2 transition-colors hover:text-ink sm:hidden"><Icon name={y ? "close" : "search"} className="h-[17px] w-[17px]" /></button><div className="relative ml-auto hidden w-full max-w-[320px] sm:block"><Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-[15px] w-[15px] -translate-y-1/2 text-ink-3" /><input value={x} onChange={O => {
            h(O.target.value), q(!0);
          }} onFocus={() => q(!0)} onBlur={() => setTimeout(() => q(!1), 160)} placeholder="Search orders, SKUs, dealers\u2026" aria-label="Search" className="w-full rounded-[2px] border border-line bg-panel py-[9px] pr-3 pl-9 text-[13px] text-ink placeholder:text-ink-3/80 focus:border-gold/50" /><AnimatePresence>{f && x.trim() && <motion.div initial={{
              opacity: 0,
              y: -6
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -6
            }} transition={{
              duration: .18,
              ease: Ft
            }} className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 overflow-hidden rounded-[2px] border border-line bg-raised shadow-[0_24px_60px_rgba(0,0,0,0.5)]">{k.length === 0 ? <div className="px-4 py-5"><div className="legend text-ink-3">No matches</div><p className="mt-2 text-[12.5px] text-ink-2">{"Nothing in the ledger for “"}{x}{"”. Try an order code such as WC-1009."}</p></div> : k.map((O, R) => <button onMouseDown={() => {
                n(O.view), h(""), q(!1);
              }} className="flex w-full items-center gap-3 border-b border-line-soft px-4 py-3 text-left last:border-0 hover:bg-panel" key={R}><span className="legend text-gold">{Md[O.view]}</span><span className="min-w-0 flex-1"><span className="block truncate text-[13px] text-ink">{O.title}</span><span className="block truncate text-[11.5px] text-ink-3">{O.sub}</span></span><Icon name="chevron" className="h-3 w-3 text-ink-3" /></button>)}</motion.div>}</AnimatePresence></div><div className="hidden items-center gap-2 sm:flex"><button className="relative flex h-9 w-9 items-center justify-center rounded-[2px] border border-line text-ink-2 transition-colors hover:border-ink-3 hover:text-ink" aria-label="Notifications"><Icon name="bell" className="h-[17px] w-[17px]" /><span className="absolute top-[7px] right-[8px] h-[5px] w-[5px] rounded-full bg-alert" /></button><div className="hidden items-baseline gap-2 border-l border-line pl-4 lg:flex"><span className="legend text-ink-3">Colombo</span><span className="tnum text-[11px] text-ink-2">{m5}</span></div></div></div>{y && <div className="border-t border-line bg-surface px-4 pt-3 pb-4 sm:hidden"><div className="relative"><Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-[15px] w-[15px] -translate-y-1/2 text-ink-3" /><input autoFocus={!0} value={x} onChange={O => h(O.target.value)} placeholder="Search orders, SKUs, dealers\u2026" aria-label="Search" className="w-full rounded-[2px] border border-line bg-panel py-[11px] pr-3 pl-9 text-[13px] text-ink placeholder:text-ink-3/80 focus:border-gold/50" /></div>{x.trim() !== "" && <div className="mt-3 overflow-hidden rounded-[2px] border border-line bg-raised">{k.length === 0 ? <p className="px-4 py-4 text-[12.5px] leading-relaxed text-ink-3">{"Nothing in the ledger for “"}{x}{"”. Try an order code such as WC-1009."}</p> : k.map((O, R) => <button onClick={() => {
            n(O.view), h(""), N(!1);
          }} className="flex w-full items-center gap-3 border-b border-line-soft px-4 py-3 text-left last:border-0 active:bg-panel" key={R}><span className="legend w-[60px] shrink-0 text-gold">{Md[O.view]}</span><span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] text-ink">{O.title}</span><span className="block truncate text-[11px] text-ink-3">{O.sub}</span></span></button>)}</div>}</div>}</header><AnimatePresence>{o && <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} role="dialog" aria-modal="true" aria-label="Navigation"><div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" onClick={() => A(!1)} /><motion.div className="absolute top-0 bottom-0 left-0 w-[286px] border-r border-line shadow-[20px_0_60px_rgba(0,0,0,0.45)]" initial={{
          x: -300
        }} animate={{
          x: 0
        }} exit={{
          x: -300
        }} transition={{
          duration: .32,
          ease: Ft
        }}><button onClick={() => A(!1)} className="absolute top-6 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-[2px] text-ink-3 hover:text-ink" aria-label="Close navigation"><Icon name="close" className="h-4 w-4" /></button><DesktopSidebar view={a} theme={i} setTheme={c} onNavigate={O => {
            n(O), A(!1);
          }} /></motion.div></motion.div>}</AnimatePresence></>;
}
function PageHeader({
  eyebrow: a,
  title: n,
  sub: i,
  action: c
}) {
  return <div className="flex flex-wrap items-end justify-between gap-6 pb-7"><div><LegendText className="text-gold">{a}</LegendText><h1 className="font-display mt-4 text-[clamp(2.1rem,4.6vw,3.15rem)] leading-[0.95] font-semibold tracking-[-0.015em] text-ink">{n}</h1>{i && <p className="mt-4 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-2 sm:text-[14px]">{i}</p>}</div>{c && <div className="w-full sm:w-auto">{c}</div>}</div>;
}
function EmptyNotice({
  title: a,
  body: n,
  icon: i = "alert"
}) {
  return <div className="flex items-start gap-3 rounded-[2px] border border-dashed border-line px-5 py-6"><span className="mt-[2px] text-ink-3"><Icon name={i} className="h-4 w-4" /></span><div><div className="legend-lg text-ink-2">{a}</div><p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">{n}</p></div></div>;
}
const V5 = assetPhoto1,
  $0 = assetPhoto2,
  Np = assetPhoto3,
  Sp = assetPhoto4,
  R5 = assetPhoto5,
  H5 = assetPhoto6,
  U5 = assetPhoto7,
  T5 = assetPhoto8,
  W5 = assetPhoto9,
  Ta = {
    movement: V5,
    productWrist: $0,
    productWall: Np,
    productTable: Sp,
    collection: watchHeroUrl
  };
function Lr(a, n) {
  const uploaded = productPhoto(a);
  if (uploaded) return uploaded;
  const local = productImageSrc(a);
  if (local) return local;
  return {
    "HT-W-214": H5,
    "HT-W-118": $0,
    "HT-W-330": T5,
    "HT-W-512": U5,
    "HT-C-042": Np,
    "HT-C-017": Sp
  }[a] ?? (n === "Wall Watches" ? Np : n === "Table Watches" ? Sp : W5);
}
function D5() {
  const [a, n] = React.useState(() => typeof window > "u" ? !0 : window.matchMedia("(min-width: 1024px)").matches);
  return React.useEffect(() => {
    const i = window.matchMedia("(min-width: 1024px)"),
      c = () => n(i.matches);
    return c(), i.addEventListener("change", c), () => i.removeEventListener("change", c);
  }, []), a;
}
function Bn(a = 8) {
  if (typeof navigator < "u" && "vibrate" in navigator) try {
    navigator.vibrate(a);
  } catch {}
}
function tf(a) {
  React.useEffect(() => {
    if (!a) return;
    const n = document.body.style.overflow;
    return document.body.style.overflow = "hidden", () => {
      document.body.style.overflow = n;
    };
  }, [a]);
}
function z5(a) {
  return a === "Wall Watches" ? Ta.productWall : a === "Table Watches" ? Ta.productTable : Ta.productWrist;
}
const ef = React.createContext(() => {}),
  In = () => React.useContext(ef);
function ToastProvider({
  children: a
}) {
  const [n, i] = React.useState(null),
    c = React.useRef(void 0),
    o = React.useCallback((A, p = "check") => {
      i({
        id: Date.now(),
        message: A,
        icon: p
      }), Bn(10), window.clearTimeout(c.current), c.current = window.setTimeout(() => i(null), 2600);
    }, []);
  return React.useEffect(() => () => window.clearTimeout(c.current), []), <ef.Provider value={o}>{a}<AnimatePresence>{n && <motion.div initial={{
        opacity: 0,
        y: 16,
        scale: .97
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: 10,
        scale: .98
      }} transition={{
        duration: .24,
        ease: Ft
      }} className="pointer-events-none fixed inset-x-4 bottom-[calc(164px+env(safe-area-inset-bottom))] z-[95] mx-auto max-w-[520px]" role="status" aria-live="polite" key={n.id}><div className="flex items-center gap-3 rounded-[12px] border border-gold/30 bg-raised/95 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold"><Icon name={n.icon} className="h-3.5 w-3.5" /></span><span className="text-[13px] leading-snug text-ink">{n.message}</span></div></motion.div>}</AnimatePresence></ef.Provider>;
}
function SheetDialog({
  open: a,
  onClose: n,
  title: i,
  eyebrow: c,
  children: o,
  footer: A
}) {
  const [p, m] = React.useState(!1);
  return React.useEffect(() => m(!0), []), tf(a), React.useEffect(() => {
    if (!a) return;
    const j = x => {
      x.key === "Escape" && n();
    };
    return window.addEventListener("keydown", j), () => window.removeEventListener("keydown", j);
  }, [a, n]), p ? ReactDOM.createPortal(<AnimatePresence>{a && <motion.div className="fixed inset-0 z-[80]" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} transition={{
      duration: .2
    }}><div className="absolute inset-0 bg-black/65 backdrop-blur-[3px]" onClick={n} /><motion.div role="dialog" aria-modal="true" aria-label={i} initial={{
        y: "100%",
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} exit={{
        y: "100%",
        opacity: 0
      }} transition={{
        type: "spring",
        stiffness: 330,
        damping: 34
      }} className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92svh] w-full max-w-[560px] flex-col rounded-t-[22px] border-t border-line bg-panel shadow-[0_-24px_70px_rgba(0,0,0,0.5)] lg:top-[7vh] lg:bottom-auto lg:h-auto lg:max-h-[86vh] lg:w-[92%] lg:max-w-[640px] lg:rounded-[16px] lg:border lg:shadow-[0_40px_120px_rgba(0,0,0,0.55)]"><button onClick={n} aria-label="Dismiss sheet" className="mx-auto block w-full pt-2.5 pb-1.5 lg:hidden"><span className="mx-auto block h-1 w-9 rounded-full bg-line" /></button><div className="flex items-start justify-between gap-4 px-5 pt-1 pb-4"><div className="min-w-0">{c && <LegendText className="text-gold">{c}</LegendText>}<h2 className="font-display mt-2 truncate text-[22px] leading-tight font-semibold text-ink">{i}</h2></div><button onClick={n} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-2 active:bg-raised"><Icon name="close" className="h-4 w-4" /></button></div><div className="rule mx-5" /><div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">{o}</div>{A && <div className="border-t border-line bg-panel px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">{A}</div>}</motion.div></motion.div>}</AnimatePresence>, document.body) : null;
}
function SegmentedControl({
  options: a,
  value: n,
  onChange: i,
  className: c,
  label: o
}) {
  return <div role="group" aria-label={o} className={cn("flex items-center gap-1 rounded-[10px] border border-line bg-surface/70 p-1 backdrop-blur", c)}>{a.map(A => {
      const p = A.value === n;
      return <button onClick={() => {
        i(A.value), Bn(6);
      }} aria-pressed={p} className={cn("legend relative min-h-[30px] flex-1 rounded-[7px] px-2.5 py-[7px] transition-colors duration-200", p ? "bg-gold-fill text-on-gold" : "text-ink-2 active:bg-raised")} key={A.value}>{A.label}</button>;
    })}</div>;
}
function RoundIconBtn({
  icon: a,
  label: n,
  onClick: i,
  dot: c,
  className: o
}) {
  return <button onClick={i} aria-label={n} className={cn("relative flex h-10 w-10 items-center justify-center rounded-[11px] border border-line bg-panel/70 text-ink-2 transition-colors active:bg-raised", o)}><Icon name={a} className="h-[18px] w-[18px]" />{c && <span className="absolute top-[9px] right-[9px] h-[5px] w-[5px] rounded-full bg-alert ring-2 ring-panel" />}</button>;
}
function MobileSectionHeader({
  title: a,
  action: n,
  onAction: i,
  note: c
}) {
  return <div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="text-[15px] font-semibold tracking-[-0.005em] text-ink">{a}</h2>{c && <p className="legend mt-1.5 text-ink-3">{c}</p>}</div>{n && <button onClick={i} className="legend flex min-h-[30px] items-center gap-1 text-gold">{n}<Icon name="chevron" className="h-3 w-3" /></button>}</div>;
}
function MobileEmptyState({
  icon: a = "search",
  title: n,
  body: i,
  action: c
}) {
  return <div className="rounded-[16px] border border-dashed border-line px-5 py-8 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-3"><Icon name={a} className="h-5 w-5" /></span><h3 className="mt-4 text-[14px] font-semibold text-ink">{n}</h3><p className="mx-auto mt-2 max-w-[34ch] text-[12px] leading-relaxed text-ink-3">{i}</p>{c && <button onClick={c.onClick} className="legend mt-4 inline-flex min-h-[36px] items-center rounded-full border border-gold/40 px-4 text-gold">{c.label}</button>}</div>;
}
function MiniStars({
  n: a,
  size: n = 12
}) {
  return <div className="flex gap-[3px]" aria-label={`${a} out of 5`}>{[1, 2, 3, 4, 5].map(i => <svg viewBox="0 0 24 24" style={{
      width: n,
      height: n
    }} fill={i <= a ? "var(--gold)" : "none"} stroke="var(--gold)" strokeWidth="1.3" key={i}><path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 9.6l6.3-.9z" /></svg>)}</div>;
}
function ToggleSwitch({
  on: a,
  onChange: n,
  label: i
}) {
  return <button role="switch" aria-checked={a} aria-label={i} onClick={() => {
    n(!a), Bn(8);
  }} className={cn("relative h-[26px] w-[46px] shrink-0 rounded-full border transition-colors duration-200", a ? "border-gold/50 bg-gold/25" : "border-line bg-line")}><motion.span className={cn("absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full", a ? "bg-gold" : "bg-ink-3")} animate={{
      x: a ? 20 : 0
    }} transition={{
      duration: .2,
      ease: Ft
    }} /></button>;
}
function E5() {
  const a = new Date().getHours();
  return a < 12 ? "Good morning" : a < 17 ? "Good afternoon" : "Good evening";
}
function B5(a = 650) {
  const [n, i] = React.useState(!1);
  return React.useEffect(() => {
    const c = window.setTimeout(() => i(!0), a);
    return () => window.clearTimeout(c);
  }, [a]), n;
}
function ShimmerBlock({
  className: a
}) {
  return <div className={cn("shimmer rounded-[12px]", a)} aria-hidden="true" />;
}

// Placeholder cards that mirror the real order-card layout, so the page has
// shape on the very first paint instead of an empty area while Supabase answers.
function OrdersSkeleton({
  rows: a = 4
}) {
  const rows = Array.from({
    length: a
  }).map((n, i) => i);
  // Mobile only: an agenda timeline with a dashed spine, one dot per entry,
  // text lines on the left and an artwork block on the right.
  return <div className="order-timeline lg:hidden" aria-busy="true" aria-live="polite">
      <div className="order-timeline-head">
        <ShimmerBlock className="h-3 w-[104px]" />
        <ShimmerBlock className="mt-2 h-2.5 w-[64px]" />
      </div>
      {rows.map(i => <div className={`order-timeline-row${i === 0 ? " is-first" : ""}`} key={i}>
          <span className="order-timeline-dot" aria-hidden="true" />
          <div className="order-timeline-card">
            <div className="min-w-0 flex-1">
              <ShimmerBlock className="h-3 w-[86%]" />
              <ShimmerBlock className="mt-2.5 h-2.5 w-[58%]" />
              <ShimmerBlock className="mt-2.5 h-2.5 w-[44%]" />
            </div>
            <ShimmerBlock className="order-timeline-thumb" />
          </div>
        </div>)}
    </div>;
}

function RadialGauge({
  value: a,
  size: n = 64,
  stroke: i = 6,
  label: c,
  sub: o,
  tone: A = "gold"
}) {
  const p = (n - i) / 2,
    m = 2 * Math.PI * p,
    j = Math.min(1, Math.max(0, a)),
    x = A === "alert" ? "var(--alert)" : A === "ok" ? "var(--ok)" : "var(--gold)";
  return <div className="relative shrink-0" style={{
    width: n,
    height: n
  }} role="img" aria-label={`${c} ${o ?? ""}`}><svg viewBox={`0 0 ${n} ${n}`} className="h-full w-full -rotate-90"><circle cx={n / 2} cy={n / 2} r={p} fill="none" stroke="var(--line)" strokeWidth={i} /><motion.circle cx={n / 2} cy={n / 2} r={p} fill="none" stroke={x} strokeWidth={i} strokeLinecap="round" strokeDasharray={m} initial={{
        strokeDashoffset: m
      }} animate={{
        strokeDashoffset: m * (1 - j)
      }} transition={{
        duration: 1.1,
        ease: Ft,
        delay: .15
      }} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="tnum text-[12px] leading-none font-semibold text-ink">{c}</span>{o && <span className="legend mt-1 text-[7.5px] text-ink-3">{o}</span>}</div></div>;
}
function SwipeActionRow({
  children: a,
  actionLabel: n,
  actionIcon: i = "check",
  onAction: c,
  tone: o = "gold",
  disabled: A,
  className: p
}) {
  const m = useMotionValue(0),
    j = useTransform(m, [-112, -24, 0], [1, .5, 0]),
    x = React.useRef(0),
    h = () => animate(m, 0, {
      duration: .24,
      ease: Ft
    });
  return A ? <div className={p}>{a}</div> : <div className={cn("relative overflow-hidden rounded-[15px]", p)}><motion.div className={cn("absolute inset-y-0 right-0 flex w-[112px] items-center justify-center", o === "alert" ? "bg-alert text-white" : "bg-gold-fill text-on-gold")} style={{
      opacity: j
    }}><button onClick={() => {
        c(), h();
      }} className="flex h-full w-full flex-col items-center justify-center gap-1.5"><Icon name={i} className="h-5 w-5" strokeWidth={2} /><span className="legend text-[9px]">{n}</span></button></motion.div><motion.div drag="x" dragDirectionLock={!0} dragConstraints={{
      left: -112,
      right: 0
    }} dragElastic={.06} style={{
      x: m
    }} onDragStart={() => x.current = Date.now()} onDrag={() => x.current = Date.now()} onDragEnd={(f, q) => {
      x.current = Date.now(), q.offset.x < -56 || q.velocity.x < -400 ? (animate(m, -112, {
        duration: .22,
        ease: Ft
      }), Bn(8)) : h();
    }} onClickCapture={f => {
      Date.now() - x.current < 300 && (f.stopPropagation(), f.preventDefault());
    }} className="relative">{a}</motion.div></div>;
}
function Xr(a, n) {
  const i = n.map(p => p.map(m => `"${String(m).replace(/"/g, '""')}"`).join(",")).join(`
`),
    c = new Blob([i], {
      type: "text/csv;charset=utf-8"
    }),
    o = URL.createObjectURL(c),
    A = document.createElement("a");
  A.href = o, A.download = a, A.click(), URL.revokeObjectURL(o);
}
const I5 = [{
  value: "7",
  label: "7D"
}, {
  value: "14",
  label: "14D"
}, {
  value: "30",
  label: "30D"
}];
function MobileOverview({
  onNavigate: a,
  onNewOrder: n,
  onOpenSheet: i
}) {
  const c = useReducedMotion(),
    o = In(),
    [A, p] = React.useState("30"),
    [m, j] = React.useState(0),
    {
      orders: x,
      dealers: h,
      products: f
    } = qe(),
    q = React.useMemo(() => fs(x), [x]),
    y = x.filter(E => E.status === "Submitted").length,
    N = x.filter(E => E.status === "Completed").length,
    k = x.filter(E => E.status === "Packing").length,
    O = x.filter(E => E.status === "Ready").length,
    R = f.filter(E => E.stock <= 4).length,
    favoriteCount = f.reduce((total, product) => total + Number(product.favoriteCount || 0), 0),
    topFavorite = [...f].sort((left, right) => Number(right.favoriteCount || 0) - Number(left.favoriteCount || 0))[0],
    J = B5(650),
    v = L0(J ? q.revenue : 0, 1400),
    C = React.useMemo(() => q.daily.slice(-Number(A)), [q.daily, A]),
    tt = React.useMemo(() => [...x].sort((E, at) => at.date.localeCompare(E.date) || at.id.localeCompare(E.id)).slice(0, 3), [x]),
    st = h.map(E => ({
      ...E,
      revenue: x.filter(at => at.dealer === E.name && at.status === "Completed").reduce((at, qt) => at + qt.amount, 0)
    })).sort((E, at) => at.revenue - E.revenue)[0] || { name: "No dealer data", revenue: 0 },
    g = [{
      label: "New order",
      icon: "orders",
      run: n
    }, {
      label: "Reorder",
      icon: "products",
      run: () => a("products")
    }, {
      label: "Approvals",
      icon: "dealers",
      run: () => i("dealers")
    }, {
      label: "Export",
      icon: "download",
      run: () => {
        Xr("rsd-ledger.csv", [["Order", "Dealer", "Date", "Units", "Status", "Amount LKR"], ...x.map(E => [E.id, E.dealer, E.date, E.units, E.status, E.amount])]), o("Ledger exported as CSV", "download");
      }
    }],
    D = E => E === 0 || E === 1 ? a("products") : i("dealers");
  return J ? <div className="mx-auto w-full max-w-[560px] px-4 pt-5"><div className="flex items-start justify-between gap-4"><div><LegendText className="text-ink-3">{new Intl.DateTimeFormat("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long"
          }).format(new Date())}{" · Colombo"}</LegendText><h1 className="font-display mt-2.5 text-[27px] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">{E5()}, Admin</h1></div><button onClick={() => a("more")} aria-label="Open account" className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/10 text-[12px] font-semibold text-gold active:scale-95">AD</button></div><motion.section initial={c ? !1 : {
      opacity: 0,
      y: 14
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: .5,
      ease: Ft
    }} className="relative mt-5 overflow-hidden rounded-[20px] border border-line"><img src={Ta.movement} alt="Brass gear train of a mechanical watch movement" className="photo absolute inset-0 h-full w-full object-cover object-[70%_center]" loading="eager" fetchPriority="high" decoding="async" /><div className="absolute inset-0 bg-gradient-to-r from-panel via-panel/88 to-panel/40" /><div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/65 to-panel/20" /><div className="grain absolute inset-0" /><div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" /><div className="relative z-10 p-5"><div className="flex items-start justify-between gap-3"><div><LegendText className="text-gold">Confirmed revenue</LegendText><p className="mt-1.5 text-[11px] text-ink-3">{"All time · "}{q.count}{" confirmed orders"}</p></div><StatusBadge tone="gold">{"▲ 100%"}</StatusBadge></div><div className="font-display tnum mt-5 flex flex-wrap items-baseline gap-x-2 text-[clamp(2rem,10.5vw,2.75rem)] leading-none font-semibold tracking-[-0.03em] text-ink"><span className="text-[0.34em] font-medium tracking-[0.1em] text-gold">LKR</span>{bt(Math.round(v))}</div><div className="mt-2.5 flex items-center gap-3 text-[11.5px] text-ink-2"><span className="tnum">{q.count}{" confirmed"}</span><span className="h-3 w-px bg-line" /><span className="tnum">{q.units}{" units"}</span><span className="h-3 w-px bg-line" /><span className="tnum">{"LKR "}{bt(q.avg)}{" avg"}</span></div><div className="mt-5 flex items-center justify-between gap-3"><LegendText className="text-ink-3">Revenue trend</LegendText><div className="flex gap-1 rounded-[9px] border border-line bg-surface/60 p-[3px]">{I5.map(E => <button onClick={() => p(E.value)} aria-pressed={A === E.value} className={cn("legend rounded-[6px] px-2.5 py-[6px] transition-colors", A === E.value ? "bg-gold-fill text-on-gold" : "text-ink-2")} key={E.value}>{E.label}</button>)}</div></div><div className="mt-1 -mb-1"><MiniTrendChart values={C.map(E => E.value)} /></div><button onClick={() => a("analytics")} className="mt-3 flex w-full items-center justify-between border-t border-line/70 pt-3.5 active:opacity-70"><span className="legend text-gold">Full report</span><span className="flex items-center gap-1.5 text-[11px] text-ink-2">{"Last "}{A}{" days"}<Icon name="arrow" className="h-3.5 w-3.5 text-gold" /></span></button></div></motion.section><div className="mt-4 grid grid-cols-4 gap-2">{g.map(E => <button onClick={() => {
        E.run();
      }} className="group flex flex-col items-center gap-2 rounded-[14px] border border-line bg-panel py-3 active:scale-[0.97] active:bg-raised" key={E.label}><span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-gold/20 bg-gold/10 text-gold"><Icon name={E.icon} className="h-[17px] w-[17px]" /></span><span className="text-[10.5px] leading-none text-ink-2">{E.label}</span></button>)}</div><div className="mt-4 grid grid-cols-2 gap-2.5">{[{
        label: "Orders",
        value: String(x.length),
        sub: `${y} awaiting confirmation`
      }, {
        label: "Avg. order",
        value: `LKR ${bt(q.avg)}`,
        sub: "Per confirmed order"
      }, {
        label: "Units",
        value: String(q.units),
        sub: `Across ${q.count} confirmed orders`
      }, {
        label: "Watch favourites",
        value: String(favoriteCount),
        sub: topFavorite?.name ? `Most saved: ${topFavorite.name}` : "Browser saves",
        alert: favoriteCount > 0
      }].map(E => <div className="rounded-[14px] border border-line bg-panel p-3.5" key={E.label}><div className="flex items-center justify-between gap-2"><LegendText className="text-ink-3">{E.label}</LegendText>{E.alert && <span className="h-[5px] w-[5px] rounded-full bg-alert" />}</div><div className="font-display tnum mt-2.5 text-[20px] leading-none font-semibold tracking-[-0.01em] text-ink">{E.value}</div><div className="mt-2 text-[10px] leading-snug text-ink-3">{E.sub}</div></div>)}</div><div className="mt-2.5 grid grid-cols-2 gap-2.5"><button onClick={() => a("orders")} className="flex items-center gap-3 rounded-[14px] border border-line bg-panel p-3.5 text-left active:bg-raised"><RadialGauge value={N / Math.max(1, x.length)} size={56} stroke={5} label={`${Math.round(N / Math.max(1, x.length) * 100)}%`} /><div className="min-w-0"><LegendText className="text-ink-3">Fulfilment</LegendText><div className="mt-1.5 text-[13px] font-medium text-ink">{N}{" of "}{x.length}{" completed"}</div><div className="legend mt-1.5 text-gold">{k}{" packing · "}{O}{" ready"}</div></div></button><button onClick={() => a("products")} className="flex items-center gap-3 rounded-[14px] border border-line bg-panel p-3.5 text-left active:bg-raised"><RadialGauge value={R / Math.max(1, f.length)} size={56} stroke={5} label={String(R)} sub="SKU" tone="alert" /><div className="min-w-0"><LegendText className="text-ink-3">Stock health</LegendText><div className="mt-1.5 text-[13px] font-medium text-ink">{R}{" below reorder"}</div><div className="legend mt-1.5 text-alert">Review stock</div></div></button></div><div className="mt-7"><MobileSectionHeader title="Needs attention" note="3 open items" action="All alerts" onAction={() => a("products")} /><div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1" onScroll={E => {
        const at = E.currentTarget,
          qt = Math.round(at.scrollLeft / (at.scrollWidth / Al.length));
        j(Math.min(Al.length - 1, Math.max(0, qt)));
      }}>{Al.map((E, at) => <button onClick={() => D(at)} className={cn("relative w-[84%] shrink-0 snap-start overflow-hidden rounded-[16px] border border-line bg-panel p-4 text-left active:scale-[0.99]", at === 0 && "border-alert/35")} key={E.tone}><div className="flex items-center justify-between gap-3"><span className={cn("flex h-8 w-8 items-center justify-center rounded-[9px]", at === 0 ? "bg-alert/12 text-alert" : "bg-gold/10 text-gold")}><Icon name={at === 0 ? "alert" : at === 1 ? "heart" : "dealers"} className="h-4 w-4" /></span><StatusBadge tone={at === 0 ? "alert" : "gold"}>{E.tone}</StatusBadge></div><h3 className="mt-3.5 text-[15px] leading-snug font-semibold text-ink">{E.title}</h3><p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">{E.detail}</p><span className="legend mt-3 flex items-center gap-1.5 text-gold">{E.action}<Icon name="arrow" className="h-3 w-3" /></span></button>)}</div><div className="mt-2.5 flex justify-center gap-1.5">{Al.map((E, at) => <span className={cn("h-1 rounded-full transition-all duration-300", at === m ? "w-4 bg-gold" : "w-1 bg-line")} key={E.tone} />)}</div></div><div className="mt-7"><MobileSectionHeader title="Recent orders" note="Latest across all channels" action="See all" onAction={() => a("orders")} /><div className="overflow-hidden rounded-[16px] border border-line bg-panel">{tt.map((E, at) => <button onClick={() => a("orders")} className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-raised", at > 0 && "border-t border-line-soft")} key={E.id}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line bg-raised text-[11px] font-semibold text-ink-2">{E.dealer.split(" ").slice(0, 2).map(qt => qt[0]).join("")}</span><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-ink">{E.dealer}</span><span className="legend mt-1.5 flex items-center gap-1.5 text-ink-3">{E.id}<span className="h-2.5 w-px bg-line" />{E.units}{" units"}</span></span><span className="shrink-0 text-right"><span className="tnum block text-[12px] font-medium text-ink">{"LKR "}{bt(E.amount)}</span><span className={cn("legend mt-1.5 flex items-center justify-end gap-1.5", E.status === "Completed" ? "text-ok" : E.status === "Ready" ? "text-alert" : "text-gold")}><span className="h-[4px] w-[4px] rounded-full bg-current" />{E.status}</span></span></button>)}</div></div><div className="relative mt-4 overflow-hidden rounded-[16px] border border-gold/25 bg-gold/[0.06] p-4"><div className="flex items-center justify-between gap-3"><LegendText className="text-gold">Insight</LegendText><span className="w-[74px]"><Sparkline values={q.daily.map(E => E.value)} /></span></div><p className="mt-3 text-[13px] leading-relaxed text-ink"><span className="font-semibold">{st.name}</span>{" accounts for"}{" "}<span className="tnum text-gold">{(st.revenue / Math.max(1, q.revenue) * 100).toFixed(1)}%</span>{" of confirmed revenue this period. Spreading the allocation would lower concentration risk."}</p><button onClick={() => a("analytics")} className="legend mt-3 flex items-center gap-1.5 text-gold">See breakdown<Icon name="chevron" className="h-3 w-3" /></button></div><div className="mt-7"><MobileSectionHeader title="Activity" note="Ledger movement" action="Ledger" onAction={() => a("orders")} /><div className="overflow-hidden rounded-[16px] border border-line bg-panel">{M0.slice(0, 3).map((E, at) => <div className={cn("flex items-center gap-3 px-4 py-3.5", at > 0 && "border-t border-line-soft")} key={E.text}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-line text-ink-2"><Icon name={E.kind === "Order" ? "orders" : E.kind === "Comment" ? "comments" : "dealers"} className="h-3.5 w-3.5" /></span><div className="min-w-0 flex-1"><p className="truncate text-[12.5px] text-ink">{E.text}</p><p className="legend mt-1.5 truncate text-ink-3">{E.meta}</p></div></div>)}</div></div><p className="mt-6 pb-2 text-center text-[10.5px] leading-relaxed text-ink-3">{"Reconciled to "}{q.count}{" confirmed orders · LKR "}{bt(q.revenue)}<br />R.S.D. Premium Watches · Colombo</p></div> : <div className="mx-auto w-full max-w-[560px] px-4 pt-5"><ShimmerBlock className="h-3 w-40" /><ShimmerBlock className="mt-3 h-8 w-64" /><ShimmerBlock className="mt-5 h-[330px] w-full rounded-[20px]" /><div className="mt-4 grid grid-cols-4 gap-2">{[0, 1, 2, 3].map(E => <ShimmerBlock className="h-[74px]" key={E} />)}</div><div className="mt-4 grid grid-cols-2 gap-2.5">{[0, 1, 2, 3].map(E => <ShimmerBlock className="h-[92px]" key={E} />)}</div></div>;
}
function MiniTrendChart({
  values: a
}) {
  const c = Math.max(...a, 1),
    o = a.map((m, j) => [j / Math.max(1, a.length - 1) * 300, 70 - m / c * 64]),
    A = o.map((m, j) => {
      if (j === 0) return `M ${m[0]} ${m[1]}`;
      const x = o[j - 1],
        h = (x[0] + m[0]) / 2;
      return `C ${h} ${x[1]}, ${h} ${m[1]}, ${m[0]} ${m[1]}`;
    }).join(" "),
    p = `${A} L 300 74 L 0 74 Z`;
  return <svg viewBox="0 0 300 74" preserveAspectRatio="none" className="h-[76px] w-full" aria-hidden="true"><defs><linearGradient id="mob-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--gold)" stopOpacity="0.34" /><stop offset="100%" stopColor="var(--gold)" stopOpacity="0" /></linearGradient></defs><motion.path d={p} fill="url(#mob-fill)" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: .4
    }} key={a.join(",")} /><motion.path d={A} fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={{
      pathLength: 0
    }} animate={{
      pathLength: 1
    }} transition={{
      duration: .9,
      ease: Ft
    }} key={a.length + "-line"} /></svg>;
}
function ProductEditorSheet({
  open: a,
  product: n,
  onClose: i
}) {
  const {
      products: c,
      addProduct: o,
      updateProduct: A
    } = qe(),
    p = In(),
    [m, j] = React.useState(""),
    [x, h] = React.useState(""),
    [f, q] = React.useState("Wrist Watches"),
    [gender, setGender] = React.useState("Unisex"),
    [productType, setProductType] = React.useState("Watches"),
    [isNew, setIsNew] = React.useState(!1),
    [availability, setAvailability] = React.useState("Available to order"),
    [supplierPrice, setSupplierPrice] = React.useState(""),
    [markupPercent, setMarkupPercent] = React.useState(""),
    [brand, setBrand] = React.useState(""),
    [desc, setDesc] = React.useState(""),
    [colors, setColors] = React.useState(""),
    [R, J] = React.useState(""),
    [photo, setPhoto] = React.useState(null),
    [photoBusy, setPhotoBusy] = React.useState(!1),
    [photoNote, setPhotoNote] = React.useState(""),
    [saving, setSaving] = React.useState(!1),
    fileRef = React.useRef(null);
  React.useEffect(() => {
    if (!a) return;
    j(n?.sku ?? "");
    h(n?.name ?? "");
    q(n?.category ?? "Wrist Watches");
    setGender(n?.gender ?? "Unisex");
    setProductType(n?.productType ?? "Watches");
    setIsNew(!!n?.isNew);
    setAvailability(n?.availability ?? "Available to order");
    setSupplierPrice(n?.supplierPrice == null ? "" : String(n.supplierPrice));
    setMarkupPercent(n?.markupPercent == null ? "" : String(n.markupPercent));
    setBrand(n?.brand ?? "");
    setDesc(n?.description ?? "");
    setColors(Array.isArray(n?.colors) ? n.colors.join(", ") : "");
    J("");
    setPhoto(null);
    setPhotoNote("");
    setPhotoBusy(!1);
    setSaving(!1);
  }, [a, n]);
  const existingPhoto = n && isUsablePhoto(n.image) ? n.image : null,
    previewSrc = photo?.dataUrl ?? existingPhoto,
    onPick = async ev => {
      const file = ev.target.files?.[0];
      ev.target.value = "";
      if (!file) return;
      const problem = checkPhotoFile(file);
      if (problem) {
        setPhoto(null);
        setPhotoNote(problem);
        return;
      }
      setPhotoBusy(!0);
      setPhotoNote("");
      try {
        const opt = await optimisePhoto(file);
        setPhoto(opt);
        setPhotoNote(`${formatBytes(opt.originalBytes)} → ${formatBytes(opt.bytes)} · ${opt.width}×${opt.height} px`);
      } catch (err) {
        setPhoto(null);
        setPhotoNote(err?.message || "That photo could not be read.");
      } finally {
        setPhotoBusy(!1);
      }
    },
    v = async tt => {
      tt.preventDefault();
      if (saving) return;
      const cleanSku = m.trim().toUpperCase(),
        cleanSupplierPrice = supplierPrice === "" ? null : Number(supplierPrice),
        cleanMarkup = markupPercent === "" ? null : Number(markupPercent);
      if (!cleanSku || !x.trim()) {
        J("Enter a SKU and product name.");
        return;
      }
      if (!/^[A-Z0-9][A-Z0-9-]{1,23}$/.test(cleanSku)) {
        J("SKU can use letters, numbers and dashes, 2–24 characters.");
        return;
      }
      if (!n && c.some(alt => alt.sku.toUpperCase() === cleanSku)) {
        J("That SKU already exists.");
        return;
      }
      if ((!n && cleanSupplierPrice === null) || (cleanSupplierPrice !== null && (!Number.isFinite(cleanSupplierPrice) || cleanSupplierPrice < 0))) {
        J("Enter the supplier watch price in LKR.");
        return;
      }
      if (cleanMarkup !== null && (!Number.isFinite(cleanMarkup) || cleanMarkup < 0 || cleanMarkup > 500)) {
        J("Markup override must be between 0 and 500 percent, or leave it empty.");
        return;
      }
      setSaving(!0);
      J("");
      try {
        let image = n?.image,
          mode = null;
        if (photo) {
          const published = await publishProductPhoto(cleanSku, photo);
          if (published.url) {
            image = published.url;
            mode = published.mode;
          } else {
            J("That photo could not be saved. Try a smaller one, or save without it.");
            setSaving(!1);
            return;
          }
        }
        const payload = {
          name: x.trim(),
          category: f,
          gender,
          productType,
          isNew,
          availability,
          brand: brand.trim() || null,
          description: desc.trim() || null,
          colors: colors.split(",").map(item => item.trim()).filter(Boolean).slice(0, 12),
          markupPercent: cleanMarkup,
        };
        if (cleanSupplierPrice !== null) payload.supplierPrice = cleanSupplierPrice;
        if (image) payload.image = image;
        const result = n ? await A(n.sku, payload) : await o({
          sku: cleanSku,
          ...payload,
          trend: [0, 0, 0, 0, 0, 0, 0]
        });
        if (result && result.ok === !1) {
          J(result.error || "Could not save the product. Check the connection and try again.");
          setSaving(!1);
          return;
        }
        p(n ? "Product updated" : "Product added to the catalogue");
        if (mode === "inline") p("Photo stored as a small inline copy");
        i();
      } catch (err) {
        J(err?.message || "Something went wrong while saving.");
      } finally {
        setSaving(!1);
      }
    },
    C = "mt-2 h-12 w-full rounded-[4px] border border-line bg-surface px-3 text-[16px] text-ink lg:text-[13px]";
  return <SheetDialog open={a} onClose={i} eyebrow="Catalogue" title={n ? "Edit product" : "Add product"} footer={<button type="submit" form="product-editor" disabled={saving} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-gold-fill px-4 text-[13px] font-semibold text-on-gold disabled:opacity-60"><Icon name="check" className="h-4 w-4" />{saving ? "Saving…" : n ? "Save changes" : "Add product"}</button>}>
      <form id="product-editor" onSubmit={v} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label><LegendText>SKU</LegendText><input className={C} value={m} onChange={tt => j(tt.target.value)} placeholder="e.g. HT-W-600" disabled={!!n} required={!0} /></label>
          <label><LegendText>Product name</LegendText><input className={C} value={x} onChange={tt => h(tt.target.value)} placeholder="Enter product name" required={!0} /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label><LegendText>Category</LegendText><select className={C} value={f} onChange={tt => q(tt.target.value)}><option>Wrist Watches</option><option>Wall Watches</option><option>Table Watches</option><option>Others</option></select></label>
          <label><LegendText>Product type</LegendText><select className={C} value={productType} onChange={tt => setProductType(tt.target.value)}><option>Watches</option><option>Bracelet</option><option>Wall clocks</option><option>Table clocks</option><option>Accessories</option></select></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label><LegendText>Audience</LegendText><select className={C} value={gender} onChange={tt => setGender(tt.target.value)}><option>Men</option><option>Women</option><option>Unisex</option><option>Kids</option></select></label>
          <label><LegendText>Availability label</LegendText><select className={C} value={availability} onChange={tt => setAvailability(tt.target.value)}><option>Available to order</option><option>Limited availability</option><option>Coming soon</option></select></label>
        </div>
        <label className="flex items-center gap-3 rounded-[7px] border border-line bg-surface px-3 py-3 text-[13px] text-ink"><input type="checkbox" checked={isNew} onChange={tt => setIsNew(tt.target.checked)} className="h-4 w-4 accent-[var(--gold)]" />Show in New arrivals</label>
        <div className="rounded-[8px] border border-gold/30 bg-gold/[0.06] p-3.5"><LegendText className="text-gold">Automatic customer price</LegendText><p className="mt-2 text-[11.5px] leading-relaxed text-ink-2">Enter the supplier watch price only. R.S.D. calculates the customer price, delivery and minimum profit automatically.</p><div className="mt-3 grid grid-cols-2 gap-3"><label><LegendText>Supplier watch price (LKR)</LegendText><input className={C} type="number" min="0" step="0.01" value={supplierPrice} onChange={tt => setSupplierPrice(tt.target.value)} placeholder="e.g. 525" required={!n} /></label><label><LegendText>Markup override (%)</LegendText><input className={C} type="number" min="0" max="500" step="0.01" value={markupPercent} onChange={tt => setMarkupPercent(tt.target.value)} placeholder="Use default" /></label></div></div>
        <label><LegendText>Brand</LegendText><input className={C} value={brand} onChange={tt => setBrand(tt.target.value)} placeholder="e.g. R.S.D." /></label>
        <label><LegendText>Colours</LegendText><input className={C} value={colors} onChange={tt => setColors(tt.target.value)} placeholder="e.g. Steel, Black, Gold" /><p className="mt-1.5 text-[11px] text-ink-3">Separate colour names with commas.</p></label>
        <label><LegendText>Description</LegendText><textarea className="mt-2 min-h-[76px] w-full rounded-[4px] border border-line bg-surface px-3 py-2 text-[16px] text-ink lg:text-[13px]" value={desc} onChange={tt => setDesc(tt.target.value)} placeholder="Short description for the public catalogue" maxLength={1000} /></label>
        <div><LegendText>Product image</LegendText><div className="mt-2 flex items-start gap-3"><div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[10px] border border-line bg-surface">{previewSrc ? <img src={previewSrc} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-[10px] text-ink-3">No photo</div>}{photoBusy && <div className="absolute inset-0 grid place-items-center bg-surface/75 text-[10px] text-ink-2">Working…</div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => fileRef.current?.click()} className="legend min-h-9 rounded-[7px] border border-line bg-surface px-3 text-ink-2">{previewSrc ? "Replace photo" : "Choose photo"}</button>{photo && <button type="button" onClick={() => { setPhoto(null); setPhotoNote(""); }} className="legend min-h-9 rounded-[7px] border border-line bg-surface px-3 text-ink-2">Remove</button>}</div><p className="mt-2 text-[11px] leading-relaxed text-ink-3">JPG, PNG or WebP · max 5 MB · resized to 1000 px and compressed automatically</p>{photoNote && <p className="mt-1 text-[11px] leading-relaxed text-ink-2" role="status">{photoNote}</p>}</div></div></div>
        <input ref={fileRef} type="file" accept={ACCEPT_ATTRIBUTE} onChange={onPick} className="sr-only" tabIndex={-1} />
        {R && <p role="alert" className="text-[12px] text-alert">{R}</p>}
        <p className="text-[11px] leading-relaxed text-ink-3">Only the supplier price is stored as private administrator data. Customer-facing pages receive the calculated price only.</p>
      </form>
    </SheetDialog>;
}

const gh = {
    Submitted: "muted",
    Confirmed: "muted",
    Packing: "gold",
    Ready: "gold",
    Completed: "ok"
  },
  qc = ["All", "Submitted", "Confirmed", "Packing", "Ready", "Completed"],
  L5 = ["All", "Wrist Watches", "Wall Watches", "Table Watches", "Others"];
function MobileOrders({ onNavigate }) {
  const a = In(),
    {
      orders: n,
      products: i,
      setOrderStatus: c,
      ready: mbReady
    } = qe(),
    o = React.useMemo(() => fs(n), [n]),
    [A, p] = React.useState(""),
    [m, j] = React.useState("All"),
    [x, h] = React.useState(null),
    f = React.useMemo(() => {
      const N = A.trim().toLowerCase();
      return [...n].sort((k, O) => O.date.localeCompare(k.date)).filter(k => (m === "All" || k.status === m) && (!N || `${k.id} ${k.dealer} ${k.city} ${k.lines.map(O => O.name).join(" ")}`.toLowerCase().includes(N)));
    }, [A, m, n]),
    q = x ? n.find(N => N.id === x.id)?.status ?? x.status : null,
    y = N => {
      c(N.id, "Completed"), a(`${N.id} marked completed`, "check"), h(null);
    };
  if (!mbReady) return <div className="mx-auto w-full max-w-[560px] px-4 pt-5"><ShimmerBlock className="h-3 w-[84px]" /><ShimmerBlock className="mt-3 h-7 w-[132px]" /><div className="mt-6"><OrdersSkeleton rows={5} /></div></div>;
  return <div className="mx-auto w-full max-w-[560px] px-4 pt-5"><div className="flex items-end justify-between gap-4"><div><LegendText className="text-ink-3">Workspace</LegendText><h1 className="font-display mt-2 text-[27px] leading-none font-semibold tracking-[-0.02em] text-ink">Orders</h1><p className="mt-2 text-[12px] text-ink-2">{f.length}{" of "}{n.length}{" · LKR "}{bt(o.revenue)}</p></div><StatusBadge tone="gold">{Tr}</StatusBadge></div><div className="relative mt-5"><Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 h-[16px] w-[16px] -translate-y-1/2 text-ink-3" /><input value={A} onChange={N => p(N.target.value)} placeholder="Search order, dealer, product\u2026" aria-label="Search orders" className="h-11 w-full rounded-[12px] border border-line bg-panel pr-10 pl-10 text-[16px] text-ink placeholder:text-ink-3/80 focus:border-gold/50" />{A && <button onClick={() => p("")} aria-label="Clear search" className="absolute top-1/2 right-2.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-raised text-ink-3"><Icon name="close" className="h-3 w-3" /></button>}</div><div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">{qc.map(N => <button onClick={() => j(N)} aria-pressed={m === N} className={cn("legend flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-full border px-3", m === N ? "border-gold/50 bg-gold/12 text-gold" : "border-line bg-panel text-ink-2")} key={N}>{N}<span className="tnum text-[9px] opacity-70">{N === "All" ? n.length : n.filter(k => k.status === N).length}</span></button>)}</div><ul className="mt-4 flex flex-col gap-2.5"><AnimatePresence initial={!1}>{f.map((N, k) => <motion.li initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: .3,
          delay: Math.min(k * .03, .18),
          ease: Ft
        }} key={N.id}><SwipeActionRow disabled={N.status === "Completed"} actionLabel="Complete" actionIcon="check" onAction={() => {
            c(N.id, "Completed"), a(`${N.id} marked completed`, "check");
          }}><button onClick={() => h(N)} className="w-full rounded-[15px] border border-line bg-panel p-4 text-left active:bg-raised"><div className="flex items-center justify-between gap-3"><span className="tnum text-[11.5px] text-gold">{N.id}</span><StatusBadge tone={gh[N.status]}>{N.status}</StatusBadge></div><div className="mt-2.5 flex items-start justify-between gap-3"><div className="min-w-0"><div className="truncate text-[15px] leading-snug font-medium text-ink">{N.dealer}</div><div className="legend mt-1.5 text-ink-3">{N.city}{" · "}{N.units}{" units ·"}{" "}{new Date(N.date + "T00:00:00").toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short"
                    })}</div></div><Icon name="chevron" className="mt-1 h-4 w-4 shrink-0 text-ink-3" /></div><div className="mt-3.5 flex items-end justify-between gap-3 border-t border-line-soft pt-3"><span className="font-display tnum text-[20px] leading-none font-semibold text-ink">{"LKR "}{bt(N.amount)}</span><span className="legend text-ink-3">{N.lines.length}{" lines"}</span></div></button></SwipeActionRow></motion.li>)}</AnimatePresence></ul>{f.length === 0 && <div className="mt-4"><MobileEmptyState icon="search" title="No orders match" body={`Nothing for “${A || m}”. Try an order code such as WC-1009, or clear the filters.`} action={{
        label: "Clear filters",
        onClick: () => {
          p(""), j("All");
        }
      }} /></div>}<p className="mt-6 pb-2 text-center text-[10.5px] text-ink-3">Tap an order for details · swipe left to mark it complete.</p><SheetDialog open={!!x} onClose={() => h(null)} eyebrow={x ? `${x.id} · ${x.channel}` : ""} title={x?.dealer ?? ""} footer={x && <div className="flex gap-2"><button onClick={() => {
        try { window.sessionStorage.setItem("rsd-bill-source-order", x.id); } catch {}
        h(null), onNavigate?.("bills");
      }} className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[11px] border border-line text-ink"><Icon name="receipt" className="h-4 w-4" /><span className="legend">Bill / receipt</span></button><button onClick={() => y(x)} disabled={q === "Completed"} className={cn("flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[11px] bg-gold-fill text-on-gold", q === "Completed" && "opacity-45")}><Icon name="check" className="h-4 w-4" /><span className="legend">{q === "Completed" ? "Completed" : "Mark complete"}</span></button></div>}>{x && <div><div className="flex items-start justify-between gap-4"><div><LegendText className="text-ink-3">Order value</LegendText><div className="font-display tnum mt-2 text-[30px] leading-none font-semibold tracking-[-0.02em] text-ink">{"LKR "}{bt(x.amount)}</div><div className="legend mt-2.5 text-gold">{x.units}{" units"}</div></div><StatusBadge tone={gh[q ?? x.status]}>{q ?? x.status}</StatusBadge></div><label className="mt-5 block"><LegendText className="text-ink-3">Update order status</LegendText><select aria-label={`Update status for ${x.id}`} value={q ?? x.status} onChange={N => {
            c(x.id, N.target.value), a(`${x.id} updated to ${N.target.value}`);
          }} className="mt-2 h-12 w-full rounded-[10px] border border-line bg-surface px-3 text-[16px] text-ink">{qc.filter(N => N !== "All").map(N => <option value={N} disabled={qc.indexOf(N) < qc.indexOf(q ?? x.status)} key={N}>{N}</option>)}</select></label><dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 rounded-[12px] border border-line bg-surface p-4">{[["City", x.city], ["Channel", x.channel], ["Fulfilment", x.delivery ?? "Not specified"], ["Reference", x.reference ?? "-"], ["Placed", new Date(x.date + "T00:00:00").toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })], ["Lines", `${x.lines.length} products`]].map(([N, k]) => <div key={N}><dt className="legend text-ink-3">{N}</dt><dd className="mt-1.5 text-[12.5px] text-ink">{k}</dd></div>)}</dl><div className="mt-5"><LegendText className="text-ink-3">Order lines</LegendText><ul className="mt-2">{x.lines.map(N => {
              const k = i.find(O => O.sku === N.sku);
              return <li className="flex items-center gap-3 border-b border-line-soft py-3 last:border-0" key={N.sku}><img src={z5(k?.category ?? "Wrist Watches")} alt="" className="h-11 w-11 shrink-0 rounded-[9px] border border-line object-cover" loading="lazy" decoding="async" /><div className="min-w-0 flex-1"><div className="truncate text-[12.5px] text-ink">{N.name}</div><div className="legend mt-1.5 text-ink-3">{N.sku}{" · "}{N.qty}{" × LKR "}{bt(N.price)}</div></div><div className="tnum shrink-0 text-[12px] text-ink">{"LKR "}{bt(N.qty * N.price)}</div></li>;
            })}</ul></div><div className="mt-4 flex items-center justify-between rounded-[12px] border border-gold/25 bg-gold/[0.06] px-4 py-3"><span className="legend text-ink-2">Order total</span><span className="font-display tnum text-[18px] font-semibold text-gold">{"LKR "}{bt(x.amount)}</span></div></div>}</SheetDialog></div>;
}
function MobileProducts({ onNavigate: navTo }) {
  const a = In(),
    {
      products: n,
      adjustStock: i
    } = qe(),
    [c, o] = React.useState(""),
    [A, p] = React.useState("All"),
    [m, j] = React.useState("default"),
    [x, h] = React.useState(null),
    [f, q] = React.useState(null),
    [y, N] = React.useState(!1),
    k = React.useMemo(() => {
      const R = c.trim().toLowerCase(),
        J = n.filter(v => (A === "All" || v.category === A) && (!R || `${v.sku} ${v.name} ${v.category}`.toLowerCase().includes(R)));
      return m === "stock" ? [...J].sort((v, C) => v.stock - C.stock) : m === "price" ? [...J].sort((v, C) => C.price - v.price) : J;
    }, [c, A, m, n]),
    O = n.filter(R => R.stock <= 4).length;
  return <div className="mx-auto w-full max-w-[560px] px-4 pt-5"><div className="flex items-end justify-between gap-4"><div><LegendText className="text-ink-3">Catalogue</LegendText><h1 className="font-display mt-2 text-[27px] leading-none font-semibold tracking-[-0.02em] text-ink">Products</h1><p className="mt-2 text-[12px] text-ink-2">{n.length}{" SKUs · "}<span className="text-alert">{O}{" need reorder"}</span></p></div><div className="flex items-center gap-2"><button onClick={() => {
          const R = m === "default" ? "stock" : m === "stock" ? "price" : "default";
          j(R), a(R === "price" ? "Sorted by price" : R === "stock" ? "Lowest stock first" : "Catalogue order");
        }} className="flex min-h-[36px] items-center gap-2 rounded-full border border-line bg-panel px-3 text-[11px] text-ink-2 active:bg-raised"><Icon name="analytics" className="h-3.5 w-3.5 text-gold" />{m === "price" ? "Price" : m === "stock" ? "Stock" : "Sort"}</button><button onClick={() => {
          q(null), navTo ? navTo("new-product") : N(!0);
        }} className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-fill text-on-gold" aria-label="Add product"><Icon name="plus" /></button></div></div><div className="relative mt-5"><Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 h-[16px] w-[16px] -translate-y-1/2 text-ink-3" /><input value={c} onChange={R => o(R.target.value)} placeholder="Search SKU or product\u2026" aria-label="Search products" className="h-11 w-full rounded-[12px] border border-line bg-panel pr-10 pl-10 text-[16px] text-ink placeholder:text-ink-3/80 focus:border-gold/50" />{c && <button onClick={() => o("")} aria-label="Clear search" className="absolute top-1/2 right-2.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-raised text-ink-3"><Icon name="close" className="h-3 w-3" /></button>}</div><div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">{L5.map(R => <button onClick={() => p(R)} aria-pressed={A === R} className={cn("legend flex min-h-[34px] shrink-0 items-center rounded-full border px-3", A === R ? "border-gold/50 bg-gold/12 text-gold" : "border-line bg-panel text-ink-2")} key={R}>{R === "All" ? "All lines" : R}</button>)}</div><ul className="mt-4 flex flex-col gap-2.5">{k.map(R => {
        const J = R.stock <= 4;
        return <li key={R.sku}><button onClick={() => h(R)} className="flex w-full items-center gap-3 rounded-[15px] border border-line bg-panel p-3 text-left active:scale-[0.99] active:bg-raised"><div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[11px] border border-line bg-surface"><img src={Lr(R.sku, R.category)} alt={R.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />{J && <span className="absolute top-1 right-1 h-[6px] w-[6px] rounded-full bg-alert ring-2 ring-panel" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><span className="truncate text-[13.5px] leading-snug font-medium text-ink">{R.name}</span><Icon name="chevron" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" /></div><div className="legend mt-1.5 text-ink-3">{R.sku}{" · "}{R.category}</div><div className="mt-2 flex items-center justify-between gap-3"><span className="font-display tnum text-[16px] font-semibold text-ink">{"LKR "}{bt(R.price)}</span><span className="legend text-ink-3">{Number(R.favoriteCount || 0)} saved</span><span className={cn("legend", J ? "text-alert" : "text-ok")}>{R.stock}{" in stock"}</span></div></div></button></li>;
      })}</ul>{k.length === 0 && <div className="mt-4"><MobileEmptyState icon="products" title="No products found" body={`Nothing for “${c}” in ${A === "All" ? "the catalogue" : A}. Try another SKU or line.`} action={{
        label: "Reset",
        onClick: () => {
          o(""), p("All");
        }
      }} /></div>}<p className="mt-6 pb-2 text-center text-[10.5px] text-ink-3">Tap a product for stock, movement and ordering.</p><SheetDialog open={!!x} onClose={() => h(null)} eyebrow={x ? `${x.sku} · ${x.category}` : ""} title={x?.name ?? ""} footer={x && <div className="flex gap-2"><button onClick={() => {
        q(x), h(null), N(!0);
      }} className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[11px] border border-line text-ink"><Icon name="products" className="h-4 w-4" /><span className="legend">Edit product</span></button><button onClick={() => {
        i(x.sku, 24), a(`Added 24 units to ${x.sku}`, "check"), h(null);
      }} className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[11px] bg-gold-fill text-on-gold"><Icon name="check" className="h-4 w-4" /><span className="legend">Add 24 stock</span></button></div>}>{x && <div><div className="relative h-[168px] overflow-hidden rounded-[14px] border border-line"><img src={Lr(x.sku, x.category)} alt={x.name} className="h-full w-full object-cover" loading="eager" fetchPriority="high" decoding="async" /><div className="absolute inset-0 bg-gradient-to-t from-panel/80 to-transparent" /><span className="absolute bottom-3 left-3"><StatusBadge tone={x.stock <= 4 ? "alert" : "ok"}>{x.stock <= 4 ? "Reorder point reached" : "Healthy stock"}</StatusBadge></span></div><div className="mt-4 flex items-end justify-between gap-4"><div><LegendText className="text-ink-3">Trade price</LegendText><div className="font-display tnum mt-2 text-[28px] leading-none font-semibold tracking-[-0.02em] text-ink">{"LKR "}{bt(x.price)}</div></div><span className="w-[86px]"><Sparkline values={x.trend} /></span></div><div className="mt-5 grid grid-cols-2 gap-2.5">{[["On hand", String(x.stock), x.stock <= 4 ? "text-alert" : "text-ink"], ["Reserved", String(x.reserved), "text-ink"], ["Favourites", String(x.favoriteCount || 0), "text-gold"], ["Category", x.category, "text-ink-2"]].map(([R, J, v]) => <div className="rounded-[12px] border border-line bg-surface p-3.5" key={R}><LegendText className="text-ink-3">{R}</LegendText><div className={cn("font-display tnum mt-2 text-[19px] leading-none font-semibold", v)}>{J}</div></div>)}</div><div className="mt-4 rounded-[12px] border border-line bg-surface p-4"><div className="flex items-baseline justify-between"><LegendText className="text-ink-3">7-day movement</LegendText><span className="legend text-ok">{"▲ trending"}</span></div><div className="mt-2"><Sparkline values={x.trend} /></div></div></div>}</SheetDialog><ProductEditorSheet open={y} product={f} onClose={() => N(!1)} /></div>;
}
const Vh = ["var(--gold)", "var(--gold-soft)", "#a8a294", "#6e685e", "#4a4a50", "#2e2e33"];
function MobileReports() {
  const a = In(),
    {
      orders: n,
      products: i,
      dealers: c
    } = qe(),
    o = React.useMemo(() => fs(n), [n]),
    A = o.revenue,
    [p, m] = React.useState("30"),
    j = React.useMemo(() => o.daily.slice(-Number(p)), [o.daily, p]),
    x = React.useMemo(() => j.reduce((k, O) => k + O.value, 0), [j]),
    h = React.useMemo(() => j.reduce((k, O) => O.value > k.value ? O : k, j[0]), [j]),
    f = React.useMemo(() => c.map(k => ({
      ...k,
      revenue: n.filter(O => O.dealer === k.name && O.status === "Completed").reduce((O, R) => O + R.amount, 0)
    })).filter(k => k.revenue > 0).sort((k, O) => O.revenue - k.revenue).map((k, O) => ({
      ...k,
      share: k.revenue / Math.max(1, A),
      color: Vh[Math.min(O, Vh.length - 1)]
    })), [c, n, A]),
    q = React.useMemo(() => {
      const k = new Map();
      return n.filter(O => O.status === "Completed").forEach(O => k.set(O.channel, (k.get(O.channel) ?? 0) + O.amount)), [...k.entries()].map(([O, R]) => ({
        label: O,
        value: R
      })).sort((O, R) => R.value - O.value);
    }, [n]),
    y = React.useMemo(() => {
      const k = new Map();
      return n.filter(O => O.status === "Completed").forEach(O => O.lines.forEach(R => {
        const J = k.get(R.sku) ?? {
          name: R.name,
          units: 0,
          revenue: 0
        };
        J.units += R.qty, J.revenue += R.qty * R.price, k.set(R.sku, J);
      })), [...k.entries()].map(([O, R]) => ({
        sku: O,
        ...R
      })).sort((O, R) => R.revenue - O.revenue).slice(0, 4);
    }, [n]),
    N = 2 * Math.PI * 52;
  return <div className="mx-auto w-full max-w-[560px] px-4 pt-5"><div className="flex items-end justify-between gap-4"><div><LegendText className="text-ink-3">Intelligence</LegendText><h1 className="font-display mt-2 text-[27px] leading-none font-semibold tracking-[-0.02em] text-ink">Reports</h1><p className="mt-2 text-[12px] text-ink-2">{o.periodLabel}{" · last 30 days"}</p></div><button onClick={() => {
        Xr("rsd-report.csv", [["Day", "Confirmed revenue LKR"], ...j.map(k => [k.label, k.value]), ["Total", x], ["Peak day", h.label, h.value]]), a("Report exported as CSV", "download");
      }} className="flex min-h-[36px] items-center gap-2 rounded-full border border-line bg-panel px-3 text-[11px] text-ink-2 active:bg-raised"><Icon name="download" className="h-3.5 w-3.5 text-gold" />Export</button></div><div className="mt-5"><SegmentedControl label="Reporting period" value={p} onChange={m} options={[{
        value: "7",
        label: "7 days"
      }, {
        value: "14",
        label: "14 days"
      }, {
        value: "30",
        label: "30 days"
      }]} /></div><section className="relative mt-3 overflow-hidden rounded-[18px] border border-line bg-panel p-4"><div className="flex items-start justify-between gap-3"><div><LegendText className="text-ink-3">{"Confirmed revenue · last "}{p}{" days"}</LegendText><div className="font-display tnum mt-2.5 text-[clamp(1.9rem,9vw,2.5rem)] leading-none font-semibold tracking-[-0.025em] text-ink">{"LKR "}{bt(x)}</div></div><span className="legend shrink-0 rounded-full border border-gold/40 px-2 py-1 text-gold">{"▲ 100%"}</span></div><div className="mt-2 flex items-center gap-2 text-[11px] text-ink-3"><span className="tnum">{j.filter(k => k.value > 0).length}{" trading days"}</span><span className="h-2.5 w-px bg-line" /><span className="tnum">{"peak "}{h.label}</span></div><div className="mt-4"><RevenueAreaChart data={j} heightClass="h-[150px]" id="mobile-report" /></div></section><div className="mt-5 rounded-[18px] border border-line bg-panel p-4"><MobileSectionHeader title="Dealer concentration" note="Share of period revenue" /><div className="flex items-center gap-5"><div className="relative h-[132px] w-[132px] shrink-0"><svg viewBox="0 0 140 140" className="h-full w-full"><circle cx="70" cy="70" r="52" fill="none" stroke="var(--line)" strokeWidth="13" /><g transform="rotate(-90 70 70)">{(() => {
                let k = 0;
                return f.map((O, R) => {
                  const J = O.share * N,
                    v = <motion.circle cx="70" cy="70" r="52" fill="none" stroke={O.color} strokeWidth="13" strokeDasharray={`${Math.max(0, J - 2.5)} ${N - J + 2.5}`} strokeDashoffset={-k} initial={{
                      opacity: 0
                    }} animate={{
                      opacity: 1
                    }} transition={{
                      duration: .4,
                      delay: .1 + R * .08,
                      ease: Ft
                    }} key={O.name} />;
                  return k += J, v;
                });
              })()}</g></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="legend text-ink-3">Total</span><span className="font-display tnum mt-1 text-[17px] font-semibold text-ink">{(o.revenue / 1e6).toFixed(1)}M</span></div></div><ul className="min-w-0 flex-1">{f.slice(0, 4).map(k => <li className="flex items-center gap-2 border-b border-line-soft py-2 last:border-0" key={k.name}><span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{
              background: k.color
            }} /><span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-2">{k.name}</span><span className="tnum shrink-0 text-[11px] text-ink">{(k.share * 100).toFixed(0)}%</span></li>)}<li className="flex items-center gap-2 pt-2"><span className="h-[7px] w-[7px] shrink-0 rounded-full bg-line" /><span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-2">Others ({Math.max(0, f.length - 4)})</span><span className="tnum shrink-0 text-[11px] text-ink-2">{Math.round(f.slice(4).reduce((k, O) => k + O.share, 0) * 100)}%</span></li></ul></div><div className="mt-3 rounded-[10px] border border-alert/25 bg-alert/[0.07] px-3.5 py-2.5"><p className="text-[11px] leading-relaxed text-ink-2"><span className="text-alert">Concentration risk.</span>{" The largest account drives "}{((f[0]?.share ?? 0) * 100).toFixed(1)}% of revenue. The 45% internal guideline.</p></div></div><div className="mt-5 rounded-[18px] border border-line bg-panel p-4"><MobileSectionHeader title="Channel mix" note="Confirmed value by route" /><div className="flex flex-col gap-4">{q.map(k => <div key={k.label}><div className="flex items-baseline justify-between gap-3"><span className="text-[12px] text-ink">{k.label}</span><span className="tnum text-[11px] text-ink-2">{"LKR "}{bt(k.value)}{" · "}{Math.round(k.value / Math.max(1, o.revenue) * 100)}%</span></div><div className="mt-2 h-[4px] w-full rounded-full bg-line"><motion.div className="h-full rounded-full bg-gold" initial={{
              width: 0
            }} animate={{
              width: `${k.value / Math.max(1, o.revenue) * 100}%`
            }} transition={{
              duration: .8,
              ease: Ft
            }} /></div></div>)}</div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-line-soft pt-4">{[[String(o.count), "Orders"], [String(o.units), "Units"], [`${bt(o.avg)}`, "Avg. LKR"]].map(([k, O]) => <div key={O}><div className="font-display tnum text-[17px] leading-none font-semibold text-ink">{k}</div><div className="legend mt-1.5 text-ink-3">{O}</div></div>)}</div></div><div className="mt-5"><MobileSectionHeader title="Top products" note="Revenue contribution" /><div className="overflow-hidden rounded-[18px] border border-line bg-panel">{y.map((k, O) => {
          const R = i.find(J => J.sku === k.sku);
          return <div className={cn("flex items-center gap-3 px-4 py-3.5", O > 0 && "border-t border-line-soft")} key={k.sku}><span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[10px] text-ink-3">{O + 1}</span><div className="min-w-0 flex-1"><div className="truncate text-[12.5px] text-ink">{k.name}</div><div className="legend mt-1.5 text-ink-3">{k.sku}{" · "}{k.units}{" units"}</div></div><div className="shrink-0 text-right"><div className="tnum text-[12px] text-ink">{"LKR "}{bt(k.revenue)}</div><div className="legend mt-1.5 text-ink-3">{R?.stock ?? "—"}{" in stock"}</div></div></div>;
        })}</div></div><p className="mt-6 pb-2 text-center text-[10.5px] text-ink-3">{"Figures reconcile to LKR "}{bt(o.revenue)}{" across "}{o.count}{" confirmed orders."}</p></div>;
}
function MobileMore({
  theme: a,
  setTheme: n,
  onNavigate: i,
  onOpenSheet: c
}) {
  const o = In(),
    {
      logout: A
    } = Vl(),
    {
      reset: p,
      orders: m,
      products,
      reviews: rList = []
    } = qe(),
    favoriteCount = products.reduce((total, product) => total + Number(product.favoriteCount || 0), 0),
    topFavorite = [...products].sort((left, right) => Number(right.favoriteCount || 0) - Number(left.favoriteCount || 0))[0],
    ratedList = rList.filter(item => item.rating > 0),
    avgScore = ratedList.length ? (ratedList.reduce((acc, item) => acc + item.rating, 0) / ratedList.length).toFixed(1) : "–",
    [j, x] = React.useState(!0),
    [h, f] = React.useState(!0),
    [q, y] = React.useState(!0);
  return <div className="mx-auto w-full max-w-[560px] px-4 pt-5"><LegendText className="text-ink-3">System</LegendText><h1 className="font-display mt-2 text-[27px] leading-none font-semibold tracking-[-0.02em] text-ink">More</h1><div className="mt-5 flex items-center gap-4 rounded-[18px] border border-line bg-panel p-4"><div className="relative"><div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/12 text-[16px] font-semibold text-gold">AD</div><span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-panel bg-ok" /></div><div className="min-w-0 flex-1"><div className="text-[16px] font-semibold text-ink">Admin</div><div className="legend mt-1.5 text-ink-3">Administrator · Colombo 10</div><div className="mt-2 flex items-center gap-2"><span className="legend rounded-full border border-ok/40 px-2 py-[3px] text-ok">Active session</span><span className="legend text-ink-3">Supabase Cloud</span></div></div></div><div className="mt-6"><MobileSectionHeader title="Operations" note="Everything outside the daily tabs" /><div className="overflow-hidden rounded-[16px] border border-line bg-panel">{[{
          label: "Watch favourites",
          value: `${favoriteCount} saves`,
          icon: "heart",
          run: () => i("products"),
          note: topFavorite?.name ? `Most saved: ${topFavorite.name}` : "No saves yet"
        }, {
          label: "Dealers",
          value: "1 pending",
          icon: "dealers",
          run: () => c("dealers"),
          alert: !0
        }, {
          label: "Comments",
          value: `${avgScore} avg · ${rList.length}`,
          icon: "comments",
          run: () => c("comments")
        }, {
          label: "Orders ledger",
          value: `${m.length} orders`,
          icon: "orders",
          run: () => i("orders")
        }, {
          label: "Bills / Receipt",
          value: "Create PDF documents",
          icon: "receipt",
          run: () => i("bills")
        }, {
          label: "Analytics",
          value: "30 days",
          icon: "analytics",
          run: () => i("analytics")
        }].map((N, k) => <button onClick={N.run} className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-raised", k > 0 && "border-t border-line-soft")} key={N.label}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line bg-raised text-ink-2"><Icon name={N.icon} className="h-4 w-4" /></span><span className="flex-1 text-[13.5px] text-ink">{N.label}</span><span className="text-right"><span className={cn("legend block", N.alert ? "text-alert" : "text-ink-3")}>{N.value}</span>{N.note && <span className="legend mt-1 block max-w-[130px] truncate text-ink-3">{N.note}</span>}</span><Icon name="chevron" className="h-3.5 w-3.5 text-ink-3" /></button>)}</div></div><div className="mt-6"><MobileSectionHeader title="Appearance" note="Applies instantly across the console" /><div className="rounded-[16px] border border-line bg-panel p-4"><div className="flex items-center justify-between gap-4"><div><div className="text-[13.5px] text-ink">Theme</div><p className="mt-1 text-[11.5px] text-ink-3">Graphite dial or ivory service manual.</p></div><div className="flex gap-1 rounded-[10px] border border-line bg-surface p-1">{["dark", "light"].map(N => <button onClick={() => {
              n(N), Bn(8);
            }} aria-pressed={a === N} className={cn("legend flex min-h-[32px] items-center gap-1.5 rounded-[7px] px-2.5", a === N ? "bg-gold-fill text-on-gold" : "text-ink-2")} key={N}><Icon name={N === "dark" ? "moon" : "sun"} className="h-3.5 w-3.5" />{N === "dark" ? "Dark" : "Light"}</button>)}</div></div></div></div><div className="mt-6"><MobileSectionHeader title="Notifications" note="What reaches this device" /><div className="rounded-[16px] border border-line bg-panel px-4">{[{
          label: "Low-stock alerts",
          note: "When a SKU drops below reorder point",
          on: j,
          set: x
        }, {
          label: "Weekly digest",
          note: "Monday revenue and pipeline summary",
          on: h,
          set: f
        }, {
          label: "Haptic feedback",
          note: "Subtle taps on actions and tabs",
          on: q,
          set: y
        }].map((N, k) => <div className={cn("flex items-center justify-between gap-4 py-3.5", k > 0 && "border-t border-line-soft")} key={N.label}><div><div className="text-[13px] text-ink">{N.label}</div><p className="mt-1 text-[11px] text-ink-3">{N.note}</p></div><ToggleSwitch on={N.on} label={N.label} onChange={O => {
            N.set(O), N.label === "Haptic feedback" && Bn(12), o(`${N.label} ${O ? "on" : "off"}`, "check");
          }} /></div>)}</div></div><div className="mt-6"><MobileSectionHeader title="Data" note="Reconciled 2 Nov 2025" /><div className="overflow-hidden rounded-[16px] border border-line bg-panel"><button onClick={() => {
          Xr("rsd-orders.csv", [["Order", "Dealer", "City", "Date", "Units", "Status", "Amount LKR"], ...m.map(N => [N.id, N.dealer, N.city, N.date, N.units, N.status, N.amount])]), o("Full ledger exported", "download");
        }} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-raised"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-raised text-ink-2"><Icon name="download" className="h-4 w-4" /></span><span className="flex-1 text-[13.5px] text-ink">Export ledger</span><span className="legend text-ink-3">CSV</span></button><div className="flex items-center justify-between border-t border-line-soft px-4 py-3.5"><span className="text-[13.5px] text-ink">Period revenue</span><span className="tnum text-[12px] text-gold">{"LKR "}{bt(m.filter(N => N.status === "Completed").reduce((N, k) => N + k.amount, 0))}</span></div></div></div><div className="mt-6"><MobileSectionHeader title="Supabase cloud ledger" note="Orders and stock sync live across devices" /><button onClick={() => {
        window.confirm("Reset the Supabase cloud ledger to the baseline sample data?") && (p(), o("Cloud ledger reset to baseline sample data"));
      }} className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[12px] border border-line text-[12.5px] text-ink-2 active:bg-raised"><Icon name="alert" className="h-4 w-4" />Reset cloud ledger to sample data</button></div><div className="mt-6 overflow-hidden rounded-[16px] border border-gold/25 bg-gold/[0.06] p-4"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gold/15 text-gold"><Icon name="download" className="h-4 w-4" /></span><LegendText className="text-gold">Install to home screen</LegendText></div><p className="mt-2.5 text-[12px] leading-relaxed text-ink-2">{"In Safari or Chrome, open the share menu and choose "}<span className="text-ink">Add to Home Screen</span>. The console then launches full-screen with this theme and your last screen.</p></div><button onClick={A} className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[12px] border border-alert/35 text-[13px] text-alert active:bg-alert/10"><Icon name="logout" className="h-4 w-4" />Sign out of admin@rsd.com</button><div className="mt-6 pb-2 text-center"><LegendText className="text-ink-3">R.S.D. Premium Watches · v2.4</LegendText><p className="mt-2 text-[10.5px] leading-relaxed text-ink-3">R.S.D. Premium Watches · Colombo 01<br />Ledger reconciled 2 November 2025</p></div></div>;
}
const X5 = [{
    id: "overview",
    label: "Home",
    icon: "overview"
  }, {
    id: "orders",
    label: "Orders",
    icon: "orders",
    badge: "8"
  }, {
    id: "products",
    label: "Catalogue",
    icon: "products"
  }, {
    id: "analytics",
    label: "Reports",
    icon: "analytics"
  }, {
    id: "more",
    label: "More",
    icon: "menu"
  }],
  C5 = {
    overview: "R.S.D.",
    orders: "Orders",
    bills: "Bills",
    products: "Catalogue",
    analytics: "Reports",
    more: "More"
  };
function MobileShellRoot({
  view: a,
  onNavigate: n,
  theme: i,
  setTheme: c
}) {
  return <ToastProvider><MobileShell view={a} onNavigate={n} theme={i} setTheme={c} /></ToastProvider>;
}
function MobileShell({
  view: a,
  onNavigate: n,
  theme: i,
  setTheme: c
}) {
  const o = In(),
    {
      orders: A,
      products: p,
      dealers: m,
      reviews: rList = [],
      setFeedbackStatus: setFbSt,
      deleteFeedback: delFb,
      setDealer: j,
      setOrderStatus: x
    } = qe(),
    ratedMobile = rList.filter(item => item.rating > 0),
    avgMobileScore = ratedMobile.length ? (ratedMobile.reduce((acc, item) => acc + item.rating, 0) / ratedMobile.length).toFixed(1) : "–",
    [h, f] = React.useState(null),
    [q, y] = React.useState(!1),
    N = m.find(g => g.name === "Kurunegala Hourglass"),
    k = N?.status === "Active" ? "approved" : N?.status === "On hold" ? "declined" : "pending",
    [O, R] = React.useState("");
  tf(h === "search"), React.useEffect(() => {
    f(null), window.scrollTo({
      top: 0
    });
  }, [a]);
  const J = g => {
      Bn(6), f(null), n(g);
    },
    v = React.useMemo(() => {
      const g = O.trim().toLowerCase();
      return g ? {
        orders: A.filter(D => `${D.id} ${D.dealer} ${D.city}`.toLowerCase().includes(g)).slice(0, 4),
        products: p.filter(D => `${D.sku} ${D.name} ${D.category}`.toLowerCase().includes(g)).slice(0, 3),
        dealers: m.filter(D => `${D.name} ${D.city}`.toLowerCase().includes(g)).slice(0, 3)
      } : {
        orders: [],
        products: [],
        dealers: []
      };
    }, [O, A, p, m]),
    C = v.orders.length + v.products.length + v.dealers.length > 0,
    tt = !["overview", "orders", "bills", "products", "analytics"].includes(a),
    st = tt ? "More" : C5[a] ?? "R.S.D.";
  return <div className="min-h-screen bg-surface"><header className="safe-top sticky top-0 z-40 border-b border-line bg-surface/92 backdrop-blur-xl"><div className="mx-auto flex h-[58px] w-full max-w-[560px] items-center gap-3 px-4"><button onClick={() => J("overview")} className="flex items-center gap-2.5" aria-label="R.S.D. Premium Watches home"><span className="text-gold"><BrandClockLogo size={27} /></span><span className="text-left"><span className="font-display block text-[15px] leading-none font-semibold tracking-[0.005em] text-ink">{st}</span><span className="legend mt-[5px] block text-gold/80">{a === "overview" ? "Modern Timepieces" : "Wholesale console"}</span></span></button><div className="ml-auto flex items-center gap-2"><RoundIconBtn icon="search" label="Search" onClick={() => f("search")} className="h-9 w-9 rounded-full" /><RoundIconBtn icon="bell" label="Notifications" dot={!q} onClick={() => {
            f("notifications"), y(!0);
          }} className="h-9 w-9 rounded-full" /></div></div></header><main className="pb-[calc(104px+env(safe-area-inset-bottom))]"><AnimatePresence mode="wait" initial={!1}><motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -6
        }} transition={{
          duration: .24,
          ease: Ft
        }} key={a}>{a === "orders" ? <MobileOrders onNavigate={n} /> : a === "bills" ? <AdminBillsView /> : a === "products" ? <MobileProducts onNavigate={n} /> : a === "new-product" ? <AdminAddProductView onNavigate={n} /> : a === "analytics" ? <MobileReports /> : tt ? <MobileMore theme={i} setTheme={c} onNavigate={n} onOpenSheet={g => f(g)} /> : <MobileOverview onNavigate={n} onNewOrder={() => f("newOrder")} onOpenSheet={g => f(g)} />}</motion.div></AnimatePresence></main>{(a === "overview" || a === "orders") && <motion.button initial={{
      scale: .6,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} onClick={() => {
      Bn(10), f("newOrder");
    }} aria-label="Create new order" className="fixed right-4 bottom-[calc(96px+env(safe-area-inset-bottom))] z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full border border-gold-soft/40 bg-gold-fill text-on-gold shadow-[0_12px_34px_rgba(228,180,41,0.38)] active:scale-95"><Icon name="plus" className="h-6 w-6" strokeWidth={2} /></motion.button>}<nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[max(env(safe-area-inset-bottom),6px)] backdrop-blur-xl"><div className="mx-auto flex w-full max-w-[560px] items-stretch px-1.5 pt-1.5">{X5.map(g => {
          const D = a === g.id || g.id === "more" && !["overview", "orders", "bills", "products", "analytics"].includes(a);
          return <button onClick={() => J(g.id)} aria-current={D ? "page" : void 0} className="relative flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 py-1" key={g.id}><span className={cn("relative flex h-8 w-[46px] items-center justify-center rounded-full transition-colors duration-200", D ? "bg-gold/14" : "")}><Icon name={g.icon} className={cn("h-[19px] w-[19px]", D ? "text-gold" : "text-ink-3")} />{g.badge && <span className="tnum absolute -top-0.5 -right-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full border-2 border-surface bg-gold px-1 text-[8px] font-semibold text-on-gold">{g.id === "orders" ? A.length : g.badge}</span>}</span><span className={cn("text-[9.5px] leading-none tracking-[0.02em]", D ? "font-semibold text-gold" : "text-ink-3")}>{g.label}</span></button>;
        })}</div></nav><AnimatePresence>{h === "search" && <motion.div initial={{
        opacity: 0,
        y: 14
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: 10
      }} transition={{
        duration: .2,
        ease: Ft
      }} className="fixed inset-0 z-[85] overflow-y-auto bg-surface"><div className="safe-top sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur-xl"><div className="mx-auto flex w-full max-w-[560px] items-center gap-2 px-4 py-2.5"><div className="relative flex-1"><Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-[16px] w-[16px] -translate-y-1/2 text-ink-3" /><input autoFocus={!0} value={O} onChange={g => R(g.target.value)} placeholder="Orders, SKUs, dealers\u2026" aria-label="Search console" className="h-11 w-full rounded-[12px] border border-line bg-panel pr-3 pl-9 text-[16px] text-ink placeholder:text-ink-3/80 focus:border-gold/50" /></div><button onClick={() => f(null)} className="legend min-h-[40px] px-1 text-ink-2">Cancel</button></div></div><div className="mx-auto w-full max-w-[560px] px-4 py-4">{O.trim() ? C ? <div className="flex flex-col gap-5">{v.orders.length > 0 && <div><LegendText className="mb-2 text-ink-3">Orders</LegendText><div className="overflow-hidden rounded-[14px] border border-line bg-panel">{v.orders.map((g, D) => <button onClick={() => J("orders")} className={cn("flex w-full items-center gap-3 px-4 py-3 text-left active:bg-raised", D > 0 && "border-t border-line-soft")} key={g.id}><span className="tnum w-[62px] shrink-0 text-[11px] text-gold">{g.id}</span><span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{g.dealer}</span><span className="tnum shrink-0 text-[11px] text-ink-3">{bt(g.amount)}</span></button>)}</div></div>}{v.products.length > 0 && <div><LegendText className="mb-2 text-ink-3">Catalogue</LegendText><div className="overflow-hidden rounded-[14px] border border-line bg-panel">{v.products.map((g, D) => <button onClick={() => J("products")} className={cn("flex w-full items-center gap-3 px-4 py-3 text-left active:bg-raised", D > 0 && "border-t border-line-soft")} key={g.sku}><span className="tnum w-[62px] shrink-0 text-[11px] text-gold">{g.sku}</span><span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{g.name}</span><span className="tnum shrink-0 text-[11px] text-ink-3">{g.stock}{" in stock"}</span></button>)}</div></div>}{v.dealers.length > 0 && <div><LegendText className="mb-2 text-ink-3">Dealers</LegendText><div className="overflow-hidden rounded-[14px] border border-line bg-panel">{v.dealers.map((g, D) => <button onClick={() => f("dealers")} className={cn("flex w-full items-center gap-3 px-4 py-3 text-left active:bg-raised", D > 0 && "border-t border-line-soft")} key={g.name}><span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{g.name}</span><span className="legend shrink-0 text-ink-3">{g.city}</span></button>)}</div></div>}</div> : <div className="rounded-[16px] border border-dashed border-line px-5 py-8 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-3"><Icon name="search" className="h-5 w-5" /></span><h3 className="mt-4 text-[14px] font-semibold text-ink">{"No matches for “"}{O}{"”"}</h3><p className="mt-2 text-[12px] leading-relaxed text-ink-3">Try an order code like WC-1009, a SKU like HT-W-214, or a dealer name.</p></div> : <><LegendText className="text-ink-3">Recent searches</LegendText><div className="mt-3 flex flex-wrap gap-2">{["WC-1009", "Meridian", "Kandy", "Tourbillon", "Sakura"].map(g => <button onClick={() => R(g)} className="legend flex min-h-[34px] items-center gap-1.5 rounded-full border border-line bg-panel px-3 text-ink-2" key={g}><Icon name="search" className="h-3 w-3 text-ink-3" />{g}</button>)}</div><div className="mt-6 overflow-hidden rounded-[16px] border border-line bg-panel">{["Orders", "Catalogue", "Reports"].map((g, D) => <button onClick={() => J(g === "Orders" ? "orders" : g === "Catalogue" ? "products" : g === "Reports" ? "analytics" : "more")} className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-raised", D > 0 && "border-t border-line-soft")} key={g}><span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-line text-ink-2"><Icon name={g === "Orders" ? "orders" : g === "Catalogue" ? "products" : g === "Reports" ? "analytics" : "heart"} className="h-3.5 w-3.5" /></span><span className="flex-1 text-[13px] text-ink">{"Go to "}{g}</span><Icon name="chevron" className="h-3.5 w-3.5 text-ink-3" /></button>)}</div></>}</div></motion.div>}</AnimatePresence><SheetDialog open={h === "notifications"} onClose={() => f(null)} eyebrow="Notifications" title="What needs you" footer={<button onClick={() => {
      y(!0), f(null), o("All notifications marked read");
    }} className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-gold-fill text-on-gold"><Icon name="check" className="h-4 w-4" /><span className="legend">Mark all read</span></button>}><div className="flex flex-col gap-2.5">{Al.map((g, D) => <button onClick={() => {
          f(null), D === 2 ? J("dealers") : J("products");
        }} className={cn("rounded-[13px] border bg-surface p-3.5 text-left active:bg-raised", D === 0 ? "border-alert/30" : "border-line")} key={g.tone}><div className="flex items-center gap-2"><span className={cn("h-[6px] w-[6px] rounded-full", q ? "bg-line" : "bg-gold")} /><StatusBadge tone={D === 0 ? "alert" : "gold"}>{g.tone}</StatusBadge><span className="legend ml-auto text-ink-3">2 Nov</span></div><h3 className="mt-2.5 text-[13px] font-semibold text-ink">{g.title}</h3><p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">{g.detail}</p></button>)}</div><div className="mt-5"><LegendText className="mb-2 text-ink-3">Recent comments</LegendText><div className="overflow-hidden rounded-[13px] border border-line bg-surface">{rList.slice(0, 2).map((g, D) => <div className={cn("px-3.5 py-3", D > 0 && "border-t border-line-soft")} key={g.id ?? g.author}><div className="flex items-center justify-between gap-2"><span className="text-[12px] text-ink">{g.author}</span>{g.rating > 0 && <MiniStars n={g.rating} size={10} />}</div><p className="mt-1.5 truncate text-[11px] text-ink-3">{g.body}</p></div>)}</div></div></SheetDialog><NewOrderSheet open={h === "newOrder"} onClose={() => f(null)} /><SheetDialog open={h === "dealers"} onClose={() => f(null)} eyebrow="Catalogue" title="Dealers"><div className="rounded-[14px] border border-gold/30 bg-gold/[0.06] p-4"><div className="flex items-center justify-between gap-3"><div><LegendText className="text-gold">Pending approval</LegendText><div className="mt-2 text-[14px] font-semibold text-ink">Kurunegala Hourglass</div><p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">Applied 19 Oct · Net 14 requested · opening order 20 units.</p></div><StatusBadge tone={k === "pending" ? "alert" : k === "approved" ? "ok" : "muted"}>{k === "pending" ? "Review" : k === "approved" ? "Approved" : "Declined"}</StatusBadge></div>{k === "pending" ? <div className="mt-3 flex gap-2"><button onClick={() => {
            j("Kurunegala Hourglass", {
              status: "On hold"
            }), o("Application placed on hold", "close");
          }} className="legend flex min-h-[40px] flex-1 items-center justify-center rounded-[10px] border border-line text-ink-2">Decline</button><button onClick={() => {
            j("Kurunegala Hourglass", {
              status: "Active",
              terms: "Net 14"
            }), o("Kurunegala Hourglass approved on Net 14", "check");
          }} className="legend flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-gold-fill text-on-gold"><Icon name="check" className="h-3.5 w-3.5" />Approve</button></div> : <p className="mt-3 text-[11.5px] text-ink-2">{k === "approved" ? "The dealer account is marked active in Supabase with Net 14 terms." : "The dealer application is marked on hold in Supabase."}</p>}</div><ul className="mt-4 flex flex-col">{m.slice(0, 6).map(g => <li className="flex items-center gap-3 border-b border-line-soft py-3 last:border-0" key={g.name}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-[10px] font-semibold text-ink-2">{g.name.split(" ").slice(0, 2).map(D => D[0]).join("")}</span><div className="min-w-0 flex-1"><div className="truncate text-[12.5px] text-ink">{g.name}</div><div className="legend mt-1.5 text-ink-3">{g.city}{" · "}{g.terms}</div></div><div className="shrink-0 text-right"><div className="tnum text-[11.5px] text-ink">{A.filter(D => D.dealer === g.name).reduce((D, E) => D + E.amount, 0) > 0 ? bt(A.filter(D => D.dealer === g.name).reduce((D, E) => D + E.amount, 0)) : "—"}</div><div className={cn("legend mt-1.5", g.status === "Active" ? "text-ok" : "text-ink-3")}>{g.status}</div></div></li>)}</ul></SheetDialog><SheetDialog open={h === "comments"} onClose={() => f(null)} eyebrow="Intelligence" title="Comments"><div className="mb-4 flex items-center gap-4 rounded-[13px] border border-line bg-surface p-4"><div className="font-display tnum text-[38px] leading-none font-semibold text-ink">{avgMobileScore}</div><div><MiniStars n={Math.round(Number(avgMobileScore) || 0)} size={13} /><p className="legend mt-2 text-ink-3">{rList.length}{" total comments"}</p></div></div><div className="flex flex-col gap-2.5">{rList.map(g => <div className={cn("rounded-[13px] border bg-surface p-3.5", g.status === "new" ? "border-gold/40" : "border-line")} key={g.id ?? g.author}><div className="flex items-start justify-between gap-2"><div><div className="flex items-center gap-2"><span className="text-[12.5px] font-medium text-ink">{g.author}</span>{g.status === "new" && <StatusBadge tone="gold">New</StatusBadge>}</div><div className="legend mt-1.5 text-ink-3">{g.role}{" · "}{g.time}</div></div>{g.rating > 0 && <MiniStars n={g.rating} size={11} />}</div><p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-2">{g.body}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => {
          setFbSt(g.id, g.status === "new" ? "read" : "new"), o(g.status === "new" ? "Marked as read" : "Marked as new", "check");
        }} className="legend rounded-[7px] border border-line px-2.5 py-1.5 text-ink-2 active:bg-raised">{g.status === "new" ? "Mark as read" : "Mark as new"}</button><button onClick={() => {
          window.confirm("Delete this comment?") && (delFb(g.id), o("Comment deleted", "close"));
        }} className="legend rounded-[7px] border border-line px-2.5 py-1.5 text-alert active:bg-raised">Delete</button></div></div>)}</div></SheetDialog></div>;
}
function NewOrderSheet({
  open: a,
  onClose: n
}) {
  const i = In(),
    {
      dealers: c,
      products: o,
      orders: A,
      placeOrder: p
    } = qe(),
    [m, j] = React.useState(c[0]?.name || ""),
    [x, h] = React.useState(o[0]?.sku || ""),
    [f, q] = React.useState(1),
    y = o.find(k => k.sku === x) ?? o[0],
    N = y ? y.price * f : 0;
  return <SheetDialog open={a} onClose={n} eyebrow="New order" title="Draft a dealer order" footer={<button onClick={() => {
    p({
      id: F0(A),
      dealer: m,
      city: c.find(k => k.name === m)?.city ?? "Colombo",
      date: new Date().toISOString().slice(0, 10),
      amount: N,
      units: f,
      status: "Submitted",
      channel: "Wholesale",
      lines: [{
        sku: y.sku,
        name: y.name,
        qty: f,
        price: y.price
      }]
    }), i(`Order created for ${m} · LKR ${bt(N)}`, "orders"), n();
  }} disabled={f > y.stock} className="legend-lg flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-gold-fill text-on-gold disabled:opacity-50"><Icon name={f > y.stock ? "alert" : "check"} className="h-4 w-4" /><span>{f > y.stock ? "Not enough stock" : `Create order · LKR ${bt(N)}`}</span></button>}><div className="flex flex-col gap-4"><label className="block"><LegendText className="text-ink-3">Dealer</LegendText><select value={m} onChange={k => j(k.target.value)} className="mt-2 h-12 w-full rounded-[12px] border border-line bg-surface px-3 text-[16px] text-ink focus:border-gold/50">{c.filter(k => k.status !== "Pending approval").map(k => <option value={k.name} key={k.name}>{k.name}{" — "}{k.city}</option>)}</select></label><label className="block"><LegendText className="text-ink-3">Product</LegendText><select value={x} onChange={k => h(k.target.value)} className="mt-2 h-12 w-full rounded-[12px] border border-line bg-surface px-3 text-[16px] text-ink focus:border-gold/50">{o.map(k => <option value={k.sku} key={k.sku}>{k.name}{" — "}{k.sku}</option>)}</select></label><div><LegendText className="text-ink-3">Quantity</LegendText><div className="mt-2 flex items-center gap-2"><button onClick={() => q(k => Math.max(1, k - 1))} aria-label="Decrease quantity" className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-line text-[18px] text-ink-2 active:bg-raised">{"−"}</button><input type="number" min={1} value={f} onChange={k => q(Math.max(1, Math.min(999, Number(k.target.value) || 1)))} aria-label="Quantity" className="tnum h-12 w-full rounded-[12px] border border-line bg-surface px-3 text-center text-[16px] text-ink focus:border-gold/50" /><button onClick={() => q(k => Math.min(999, k + 1))} aria-label="Increase quantity" className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-line text-[18px] text-ink-2 active:bg-raised">+</button></div></div><div className="flex flex-col gap-3 rounded-[13px] border border-line bg-surface p-4"><div className="flex items-center justify-between gap-3"><span className="legend text-ink-3">Unit price</span><span className="tnum text-[12px] text-ink">{"LKR "}{bt(y.price)}</span></div><div className="flex items-center justify-between gap-3 border-b border-line-soft pb-3"><span className="legend text-ink-3">Stock available</span><span className={cn("tnum text-[12px]", y.stock <= 4 ? "text-alert" : "text-ok")}>{y.stock}{" units"}</span></div><div className="flex items-center justify-between gap-3"><span className="legend text-ink-2">Order total</span><span className="font-display tnum text-[18px] font-semibold text-gold">{"LKR "}{bt(N)}</span></div></div><p className="text-[11px] leading-relaxed text-ink-3">Drafts are not reserved against stock until confirmed by the warehouse. You can add more lines after creation.</p></div></SheetDialog>;
}
function LoginScreen() {
  const { login, user } = Vl();
  const reducedMotion = useReducedMotion();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (user?.role === "admin") window.location.replace("/admin");
  }, [user]);

  const submit = async event => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Enter your administrator email and password.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await login(cleanEmail, password, false);
    setBusy(false);
    if (result) setError(result);
  };

  return <main className="login-page admin-login-page">
    <div className="login-image"><img src={watchHeroUrl} alt="A premium mechanical wristwatch on dark stone" loading="eager" decoding="async" /><div /></div>
    <motion.div className="login-content" initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
      <a className="login-back-link" href="/">← Back to public catalogue</a>
      <div className="login-brand"><BrandClockLogo size={38} /><span>R.S.D.<small>PREMIUM WATCHES</small></span></div>
      <div className="login-body"><span className="login-eyebrow">PRIVATE ADMINISTRATION</span><h1>Welcome to the<br /><em>R.S.D. console.</em></h1><p className="login-description">This secure area is reserved for the R.S.D. administrator. The public catalogue never requires an account.</p>
        <form onSubmit={submit} className="login-form" noValidate><label htmlFor="login-email">Administrator email</label><div className="login-input"><Icon name="account" /><input id="login-email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" value={email} onChange={event => { setEmail(event.target.value); setError(""); }} placeholder={ADMIN_EMAIL} required /></div><label htmlFor="login-password">Password</label><div className="login-input"><Icon name="lock" /><input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={event => { setPassword(event.target.value); setError(""); }} placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}><Icon name={showPassword ? "eyeOff" : "eye"} /></button></div>{error && <p className="login-error" role="alert">{error}</p>}<button className="login-submit" type="submit" disabled={busy}>{busy ? "Verifying…" : <>Sign in securely <Icon name="arrow" /></>}</button></form>
        <p className="login-footnote"><Icon name="shield" /> Protected session · HttpOnly cookie · R.S.D. administrator only</p>
      </div>
    </motion.div>
  </main>;
}

const en = a => `LKR ${bt(a)}`;
function HeartIcon({ selected: a }) {
  return <svg viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 6l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.3a5.5 5.5 0 0 0 0-7.8z" /></svg>;
}
function getPublicVisitorId() {
  if (typeof window === "undefined") return "server-rendered";
  try {
    const existing = window.localStorage.getItem("rsd-visitor-id");
    if (existing && /^[A-Za-z0-9_-]{16,120}$/.test(existing)) return existing;
    const generated = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now()}${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem("rsd-visitor-id", generated);
    return generated;
  } catch {
    return `${Date.now()}${Math.random().toString(36).slice(2)}`;
  }
}

function publicProductHref(product) {
  return `/shop/${encodeURIComponent(product.sku || product.name)}`;
}
function publicDefaultColour(product, colours) {
  const preferred = product.featuredColor || product.featuredColour || product.defaultColor || product.defaultColour;
  return preferred && colours.includes(preferred) ? preferred : (colours[0] || "Not selected");
}
function publicColourValue(colour) {
  const value = String(colour || "").toLowerCase();
  if (/black|onyx|ebony/.test(value)) return "#171615";
  if (/white|ivory|cream/.test(value)) return "#f1eee7";
  if (/gold|champagne|yellow/.test(value)) return "#c9a44e";
  if (/rose|copper|pink/.test(value)) return "#b97868";
  if (/blue|navy|azure/.test(value)) return "#315a86";
  if (/green|olive|emerald/.test(value)) return "#4c6856";
  if (/brown|walnut|leather|bronze/.test(value)) return "#704c35";
  if (/red|burgundy|ruby/.test(value)) return "#8b3d3b";
  if (/silver|steel|grey|gray|chrome/.test(value)) return "#c3c5c3";
  return "#9e968b";
}
function publicColourFilter(colour) {
  const value = String(colour || "").toLowerCase();
  if (/black|onyx|ebony/.test(value)) return "brightness(.68) contrast(1.12) saturate(.78)";
  if (/white|ivory|cream|silver|steel|grey|gray|chrome/.test(value)) return "grayscale(.16) brightness(1.08) contrast(1.04)";
  if (/gold|champagne|yellow/.test(value)) return "sepia(.52) saturate(1.25) hue-rotate(345deg)";
  if (/rose|copper|pink/.test(value)) return "sepia(.3) saturate(1.28) hue-rotate(320deg)";
  if (/blue|navy|azure/.test(value)) return "sepia(.16) saturate(1.46) hue-rotate(158deg)";
  if (/green|olive|emerald/.test(value)) return "sepia(.22) saturate(1.18) hue-rotate(55deg)";
  if (/brown|walnut|leather|bronze/.test(value)) return "sepia(.45) saturate(1.18) hue-rotate(335deg)";
  if (/red|burgundy|ruby/.test(value)) return "sepia(.22) saturate(1.38) hue-rotate(300deg)";
  return undefined;
}
function getPublicColourImage(product, colour, index, fallback) {
  const sources = product.colorImages || product.colourImages || product.imagesByColor || product.imagesByColour;
  if (Array.isArray(sources)) {
    const source = sources[index] || sources[0];
    if (typeof source === "string" && source.trim()) return { src: source.trim(), variant: true };
  } else if (sources && typeof sources === "object") {
    const requested = String(colour || "").trim().toLowerCase();
    const key = Object.keys(sources).find(option => option.trim().toLowerCase() === requested);
    const entry = key ? sources[key] : undefined;
    const source = Array.isArray(entry) ? entry[index] || entry[0] : entry;
    if (typeof source === "string" && source.trim()) return { src: source.trim(), variant: true };
  }
  if (Array.isArray(product.images) && product.images.length > 1) {
    const source = product.images[index] || product.images[0];
    if (typeof source === "string" && source.trim()) return { src: source.trim(), variant: true };
  }
  return { src: fallback, variant: false };
}

function PublicProductCard({ product: a, saved: n, onSave: i, onOrder: c, compact: o = false }) {
  const price = Number(a.price) || 0;
  const productType = a.productType || (a.category === "Wall Watches" ? "Wall clocks" : a.category === "Table Watches" ? "Table clocks" : "Watches");
  const availability = a.availability || "Available to order";
  const colours = Array.isArray(a.colors) && a.colors.length ? a.colors : ["Not selected"];
  const defaultColour = publicDefaultColour(a, colours);
  const defaultColourIndex = Math.max(0, colours.indexOf(defaultColour));
  const image = getPublicColourImage(a, defaultColour, defaultColourIndex, Lr(a.sku, a.category));
  return <motion.article className={cn("public-product-card", o && "public-product-card-compact")} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -35px" }} transition={{ duration: .35 }}>
    <div className="public-product-image">
      <a className="public-product-image-link" href={publicProductHref(a)} aria-label={`View details for ${a.name}`}>
        <img src={image.src} alt={`${a.name} in ${defaultColour}`} loading="lazy" decoding="async" style={image.variant ? undefined : { filter: publicColourFilter(defaultColour) }} />
      </a>
      <button type="button" className={cn("public-favorite", n && "is-saved")} onClick={() => i(a)} aria-label={`${n ? "Remove" : "Add"} ${a.name} ${n ? "from" : "to"} favourites`} aria-pressed={n}><HeartIcon selected={n} /></button>
      <span>{availability}</span>
    </div>
    <div className="public-product-info">
      <span className="product-category">{productType}</span>
      <h3><a className="public-product-title-link" href={publicProductHref(a)}>{a.name}</a></h3>
      {a.description && <p className="public-product-description">{a.description}</p>}
      <div className="public-product-bottom">
        <div><strong>{en(price)}</strong><small className="public-delivery-badge">Free delivery</small></div>
        <a className="public-order" href={rsdWhatsAppLink(a.name, price, defaultColour)} target="_blank" rel="noopener noreferrer" onClick={() => c(a, defaultColour)} aria-label={`Order ${a.name} on WhatsApp`}><Icon name="comments" /><span>Order</span></a>
      </div>
    </div>
  </motion.article>;
}

function PublicProductDetail({ product: a, saved: n, onSave: i, onOrder: c }) {
  const price = Number(a.price) || 0;
  const productType = a.productType || (a.category === "Wall Watches" ? "Wall clocks" : a.category === "Table Watches" ? "Table clocks" : "Watches");
  const availability = a.availability || "Available to order";
  const colours = Array.isArray(a.colors) && a.colors.length ? a.colors : ["Not selected"];
  const [colour, setColour] = React.useState(() => publicDefaultColour(a, colours));
  React.useEffect(() => setColour(publicDefaultColour(a, colours)), [a.sku, colours.join(",")]);
  const colourIndex = Math.max(0, colours.indexOf(colour));
  const image = getPublicColourImage(a, colour, colourIndex, Lr(a.sku, a.category));
  const details = [["Type", productType], ["For", a.gender || "Unisex"], ["Availability", availability], ["SKU", a.sku]].filter(([, value]) => value);
  return <section className="public-product-detail">
    <a className="public-detail-back" href="/shop"><Icon name="chevron" className="rotate-180" /> Back to shop</a>
    <div className="public-detail-layout">
      <div className="public-detail-visual">
        <div className="public-detail-image-frame">
          <img className="public-detail-image" src={image.src} alt={`${a.name} in ${colour}`} decoding="async" style={image.variant ? undefined : { filter: publicColourFilter(colour) }} />
          <button type="button" className={cn("public-detail-favorite", n && "is-saved")} onClick={() => i(a)} aria-label={`${n ? "Remove" : "Add"} ${a.name} ${n ? "from" : "to"} favourites`} aria-pressed={n}><HeartIcon selected={n} /></button>
          <span className="public-detail-availability">{availability}</span>
        </div>
        <p className="public-detail-image-note">Image shown in {colour}</p>
      </div>
      <div className="public-detail-info">
        <span className="store-eyebrow">R.S.D. TIMEPIECE</span>
        <div className="public-detail-heading-row"><h1>{a.name}</h1><span className="public-detail-code">{a.sku}</span></div>
        <p className="public-detail-type">{productType}{a.gender ? ` · ${a.gender}` : ""}</p>
        {a.description && <p className="public-detail-description">{a.description}</p>}
        <div className="public-detail-price-row"><strong>{en(price)}</strong><span className="public-delivery-badge">Free delivery</span></div>
        <div className="public-detail-colours">
          <div className="public-detail-colours-heading"><span>Available colours</span><strong>{colour}</strong></div>
          <div className="public-colour-options" role="list" aria-label={`Available colours for ${a.name}`}>
            {colours.map((option, index) => <button type="button" className={cn("public-colour-option", colour === option && "active")} onClick={() => setColour(option)} aria-label={`Show ${a.name} in ${option}`} aria-pressed={colour === option} key={option}><span className="public-colour-swatch" style={{ background: publicColourValue(option) }} /><span>{option}</span>{colour === option && <Icon name="check" />}</button>)}
          </div>
        </div>
        <dl className="public-detail-facts">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <a className="store-primary public-detail-order" href={rsdWhatsAppLink(a.name, price, colour)} target="_blank" rel="noopener noreferrer" onClick={() => c(a, colour)}><Icon name="comments" /> Order on WhatsApp <span>· {colour}</span></a>
        <p className="public-detail-order-note">Tell us the colour you prefer and our team will confirm the order personally.</p>
      </div>
    </div>
  </section>;
}


function PublicCatalog({
  theme: a,
  setTheme: n
}) {
  const { products: productRows = [], ready } = qe();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const detailMatch = pathname.match(/^\/shop\/([^/]+)\/?$/);
  let detailKey = null;
  if (detailMatch) {
    try { detailKey = decodeURIComponent(detailMatch[1]); } catch { detailKey = detailMatch[1]; }
  }
  const detailRoute = detailKey !== null;
  const shopRoute = /^\/shop\/?$/.test(pathname) || detailRoute;
  const [query, setQuery] = React.useState("");
  const [collectionMode, setCollectionMode] = React.useState("best");
  const [showCollection, setShowCollection] = React.useState(shopRoute);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [favoriteSkus, setFavoriteSkus] = React.useState(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem("rsd-favourites") || "[]");
      return new Set(Array.isArray(stored) ? stored : []);
    } catch {
      return new Set();
    }
  });
  const visitorId = React.useMemo(() => getPublicVisitorId(), []);
  const products = React.useMemo(() => {
    const source = productRows.length ? productRows : hA.map(({ stock, reserved, ...product }) => product);
    return source.map((product, index) => {
      const baseline = hA.find(item => item.sku === product.sku || item.name === product.name) || {};
      const publicDetails = publicProductByName.get(product.name) || {};
      const publicBaseline = {
        sku: baseline.sku,
        name: baseline.name,
        category: baseline.category,
        image: baseline.image,
        brand: baseline.brand,
        description: baseline.description,
        colors: baseline.colors,
        gender: baseline.gender,
        productType: baseline.productType,
        isNew: baseline.isNew,
        availability: baseline.availability,
        trend: baseline.trend,
        images: baseline.images,
        colorImages: baseline.colorImages,
        featuredColor: baseline.featuredColor,
        featuredColour: baseline.featuredColour,
        defaultColor: baseline.defaultColor,
        defaultColour: baseline.defaultColour,
      };
      const safeProduct = {
        sku: product.sku,
        name: product.name,
        category: product.category,
        image: product.image,
        brand: product.brand,
        description: product.description,
        colors: product.colors,
        gender: product.gender,
        productType: product.productType,
        isNew: product.isNew,
        availability: product.availability,
        trend: product.trend,
        images: product.images,
        colorImages: product.colorImages || product.colourImages || product.imagesByColor || product.imagesByColour,
        featuredColor: product.featuredColor,
        featuredColour: product.featuredColour,
        defaultColor: product.defaultColor,
        defaultColour: product.defaultColour,
      };
      const colours = Array.isArray(safeProduct.colors) && safeProduct.colors.length ? safeProduct.colors : (publicDetails.colors || []);
      return {
        ...publicBaseline,
        ...safeProduct,
        sku: safeProduct.sku || publicBaseline.sku || `RSD-${String(index + 1).padStart(3, "0")}`,
        name: safeProduct.name || publicBaseline.name || `R.S.D. Timepiece ${index + 1}`,
        category: safeProduct.category || publicBaseline.category || "Wrist Watches",
        price: Number(product.price) || publicPriceByName.get(product.name) || 0,
        description: safeProduct.description || publicDetails.description || publicBaseline.description || "",
        colors: colours,
        images: Array.isArray(safeProduct.images) && safeProduct.images.length ? safeProduct.images : (publicDetails.images || publicBaseline.images || []),
        colorImages: safeProduct.colorImages || publicDetails.colorImages || publicDetails.colourImages || publicBaseline.colorImages || {},
        featuredColor: safeProduct.featuredColor || publicBaseline.featuredColor,
        featuredColour: safeProduct.featuredColour || publicBaseline.featuredColour,
        defaultColor: safeProduct.defaultColor || publicBaseline.defaultColor,
        defaultColour: safeProduct.defaultColour || publicBaseline.defaultColour,
        gender: safeProduct.gender || publicBaseline.gender || "Unisex",
        productType: safeProduct.productType || publicBaseline.productType || (safeProduct.category === "Wall Watches" ? "Wall clocks" : safeProduct.category === "Table Watches" ? "Table clocks" : "Watches"),
        isNew: safeProduct.isNew ?? publicBaseline.isNew ?? false,
        availability: safeProduct.availability || publicDetails.availability || publicBaseline.availability || "Available to order",
        trend: Array.isArray(safeProduct.trend) ? safeProduct.trend : (publicBaseline.trend || []),
      };
    });
  }, [productRows]);
  const salesScore = product => Array.isArray(product.trend) ? product.trend.reduce((sum, value) => sum + Number(value || 0), 0) : 0;
  const bestProducts = React.useMemo(() => [...products].sort((left, right) => salesScore(right) - salesScore(left)).slice(0, 4), [products]);
  const newProducts = React.useMemo(() => {
    const marked = products.filter(product => product.isNew);
    return (marked.length ? marked : [...products].reverse()).slice(0, 4);
  }, [products]);
  const sortOptions = [
    ["best", "Best sales"],
    ["new", "New arrivals"],
    ["men", "Men"],
    ["women", "Women"],
    ["unisex", "Unisex"],
    ["kids", "Kids"],
    ["bracelet", "Bracelet"],
    ["price-low", "Lowest price"],
    ["price-high", "Highest price"],
  ];
  const selectedFilterLabel = sortOptions.find(([value]) => value === collectionMode)?.[1] || "Filter";
  const filteredProducts = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    let result = products.filter(product => !term || `${product.name} ${product.sku} ${product.category} ${product.brand || ""} ${product.gender || ""} ${product.productType || ""}`.toLowerCase().includes(term));
    if (collectionMode === "men" || collectionMode === "women" || collectionMode === "unisex" || collectionMode === "kids") {
      result = result.filter(product => String(product.gender).toLowerCase() === collectionMode);
    } else if (collectionMode === "bracelet") {
      result = result.filter(product => /bracelet/i.test(`${product.productType} ${product.category} ${product.name}`));
    }
    if (collectionMode === "best") result.sort((left, right) => salesScore(right) - salesScore(left));
    if (collectionMode === "new") result.sort((left, right) => Number(right.isNew) - Number(left.isNew) || salesScore(right) - salesScore(left));
    if (collectionMode === "price-low") result.sort((left, right) => left.price - right.price);
    if (collectionMode === "price-high") result.sort((left, right) => right.price - left.price);
    return result;
  }, [products, query, collectionMode]);
  const detailProduct = React.useMemo(() => {
    if (!detailKey) return null;
    const key = String(detailKey).trim().toLowerCase();
    return products.find(product => String(product.sku || "").toLowerCase() === key || String(product.name || "").trim().toLowerCase() === key) || null;
  }, [products, detailKey]);
  const openCollection = () => {
    if (shopRoute) return;
    window.location.assign("/shop");
  };
  const toggleFavorite = product => {
    const next = new Set(favoriteSkus);
    const favorite = !next.has(product.sku);
    favorite ? next.add(product.sku) : next.delete(product.sku);
    setFavoriteSkus(next);
    try { window.localStorage.setItem("rsd-favourites", JSON.stringify([...next])); } catch {}
    fetch("/api/favorite", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku: product.sku, visitorId, favorite }),
    }).catch(() => {});
  };
  const recordOrder = (product, colour = "Not selected") => {
    fetch("/api/customer-order", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku: product.sku, quantity: 1, colour }),
    }).catch(() => {});
  };
  const renderCards = (items, compact = false) => <div className="public-product-grid">{items.map(product => <PublicProductCard key={product.sku} product={product} saved={favoriteSkus.has(product.sku)} onSave={toggleFavorite} onOrder={recordOrder} compact={compact} />)}</div>;

  return <div className="public-site store-app">
    <header className="store-header public-header">
      <div className="store-header-inner public-header-inner">
        <a className="public-brand" href="/" aria-label="R.S.D. Premium Watches home">
          <span className="store-brand-mark"><BrandClockLogo size={36} /></span>
          <span className="store-brand-name">R.S.D.<small>PREMIUM WATCHES</small></span>
        </a>
        <nav className="public-nav" aria-label="Public navigation">
          <a className={showCollection ? "active" : ""} href="/shop">{showCollection ? "Shop" : "Collection"}</a>
          {!showCollection && <a href="#about">About R.S.D.</a>}
          <a href={RSD_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </nav>
        <div className="public-header-actions">
          <button type="button" className="store-icon-button public-theme-button" onClick={() => n(a === "dark" ? "light" : "dark")} aria-label={`Use ${a === "dark" ? "light" : "dark"} theme`}><Icon name={a === "dark" ? "sun" : "moon"} /></button>
          <a className="public-whatsapp-head" href={RSD_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><Icon name="comments" /><span>WhatsApp</span></a>
        </div>
      </div>
    </header>

    <main id={detailRoute ? "product-detail" : showCollection ? "shop" : "top"}>
      {detailRoute ? (
        detailProduct ? <PublicProductDetail product={detailProduct} saved={favoriteSkus.has(detailProduct.sku)} onSave={toggleFavorite} onOrder={recordOrder} /> : <section className="public-product-detail public-detail-missing"><span className="store-eyebrow">R.S.D. SHOP</span><h1>Timepiece not found</h1><p>That watch is no longer listed in the collection.</p><a className="store-primary" href="/shop">Back to shop <Icon name="arrow" /></a></section>
      ) : <>
      {!showCollection && <>
        <section className="public-hero" aria-label="R.S.D. Premium Watches">
          <img src="/rsd-watch-hero.png" alt="A premium R.S.D. mechanical wristwatch on dark stone" loading="eager" fetchPriority="high" decoding="async" />
          <div className="public-hero-shade" />
          <div className="public-hero-content">
            <span className="store-hero-kicker">R.S.D. PREMIUM WATCHES · EST. 1994</span>
            <h1>Time, beautifully<br /><em>considered.</em></h1>
            <p>A considered collection of watches and clocks for the moments that matter.</p>
            <div className="public-hero-actions">
              <button type="button" className="store-primary" onClick={openCollection}>View the collection <Icon name="arrow" /></button>
              <a className="public-hero-link" href={RSD_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><Icon name="comments" /> Order on WhatsApp</a>
            </div>
          </div>
        </section>

        <section className="public-intro" id="about">
          <div><span className="store-eyebrow">THE R.S.D. EDIT</span><h2>Objects with a sense of time.</h2></div>
          <p>Choose a best seller or a new arrival, then place your order in simple language through WhatsApp. Every listed price includes free delivery.</p>
        </section>

        <section className="public-curated-section">
          <div className="public-section-heading"><div><span className="store-eyebrow">MOST LOVED</span><h2>Best sellers</h2></div><button type="button" className="store-text-link" onClick={openCollection}>See all <Icon name="chevron" /></button></div>
          {renderCards(bestProducts, true)}
        </section>
        <section className="public-curated-section public-curated-new">
          <div className="public-section-heading"><div><span className="store-eyebrow">JUST ARRIVED</span><h2>New arrivals</h2></div><button type="button" className="store-text-link" onClick={openCollection}>See all <Icon name="chevron" /></button></div>
          {renderCards(newProducts, true)}
        </section>
        <section className="public-collection-cta"><span className="store-eyebrow">SHOP YOUR WAY</span><h2>Find the right timepiece.</h2><p>Browse by best sales, new arrivals, men, women, unisex, kids, bracelet or price.</p><button type="button" className="store-primary" onClick={openCollection}>View full collection <Icon name="arrow" /></button></section>

        <section className="public-order-panel">
          <div><span className="store-eyebrow">READY WHEN YOU ARE</span><h2>Order by conversation.</h2><p>R.S.D. orders are handled personally through WhatsApp Business. Tell us what you want in simple words and our team will help.</p></div>
          <a className="store-primary" href={RSD_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><Icon name="comments" /> Order on WhatsApp · 0711368623</a>
        </section>
      </>}

      {showCollection && <section className="public-collection public-shop-page" id="collection">
        <div className="public-section-heading"><div><span className="store-eyebrow">THE R.S.D. SHOP</span><h1>Find your timepiece</h1></div><span className="public-count">{filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}</span></div>
        <p className="public-delivery-note">Free delivery on every order. Choose a filter to browse the collection.</p>
        <div className="public-controls">
          <div className="public-search"><Icon name="search" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the shop" aria-label="Search the shop" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" /></button>}</div>
          <div className="public-filter-control">
            <button type="button" className="public-filter-toggle" onClick={() => setFiltersOpen(value => !value)} aria-expanded={filtersOpen} aria-controls="shop-filters"><Icon name="filter" /><span>{selectedFilterLabel}</span><Icon name="chevron" className={filtersOpen ? "rotate-90" : ""} /></button>
            {filtersOpen && <div className="public-filter-menu" id="shop-filters" role="group" aria-label="Filter the shop"><span className="public-filter-menu-label">Filter the collection</span>{sortOptions.map(([value, label]) => <button type="button" key={value} onClick={() => { setCollectionMode(value); setFiltersOpen(false); }} aria-pressed={collectionMode === value} className={collectionMode === value ? "active" : ""}><span>{label}</span>{collectionMode === value && <Icon name="check" />}</button>)}</div>}
          </div>
        </div>
        {!ready && <div className="public-loading-note" role="status"><span className="public-loading-dot" />Refreshing the collection…</div>}
        {filteredProducts.length ? renderCards(filteredProducts) : <div className="public-empty"><Icon name="search" /><h3>No pieces found</h3><p>Try another search or choose a different filter.</p><button type="button" onClick={() => { setQuery(""); setCollectionMode("best"); }}>Clear filters</button></div>}
      </section>}
      </>}
    </main>
    <footer className="public-footer"><div><span className="public-footer-brand">R.S.D. Premium Watches</span><span>Modern timepieces · Colombo, Sri Lanka</span></div><div><span>Orders via WhatsApp Business</span><a href={RSD_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">0711368623</a></div></footer>
  </div>;
}

function OverviewHeroBanner({
  value: a,
  prefix: n = "LKR "
}) {
  const i = L0(a, 1500);
  return <div className="font-display tnum flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[clamp(2.55rem,8.4vw,6.4rem)] leading-[0.86] font-semibold tracking-[-0.025em] text-ink"><span className="text-[0.36em] font-medium tracking-[0.08em] text-gold uppercase">{n}</span><span>{bt(Math.round(i))}</span></div>;
}
function KpiStatTile({
  label: a,
  value: n,
  sub: i,
  spark: c,
  wide: o,
  delay: A
}) {
  return <FadeIn delay={A} className={cn("border-r border-b border-line px-4 py-5 sm:px-6 sm:py-6", o && "col-span-2")}><LegendText className="text-ink-3">{a}</LegendText><div className="font-display tnum mt-4 text-[clamp(1.35rem,3.2vw,2.05rem)] leading-none font-semibold tracking-[-0.015em] text-ink">{n}</div><div className="mt-3 flex items-end justify-between gap-4"><p className="text-[11.5px] leading-snug text-ink-3">{i}</p>{c && <div className="w-[92px] shrink-0"><Sparkline values={c} /></div>}</div></FadeIn>;
}
function AdminOverviewView({
  onNavigate: a
}) {
  const n = useReducedMotion(),
    {
      orders: i,
      dealers: c,
      products: o
    } = qe(),
    A = React.useMemo(() => fs(i), [i]),
    p = A.pipeline,
    m = A.daily,
    j = React.useMemo(() => {
      const q = [{
        key: "Wrist Watches",
        sku: 14,
        value: 0,
        note: ""
      }, {
        key: "Wall Watches",
        sku: 6,
        value: 0,
        note: ""
      }, {
        key: "Table Watches",
        sku: 4,
        value: 0,
        note: ""
      }, {
        key: "Others",
        sku: 3,
        value: 0,
        note: ""
      }];
      return A.byCategory.forEach((y, N) => {
        const k = q.find(O => O.key === N) ?? q[3];
        k.value += y;
      }), q.forEach(y => y.note = y.value > 0 ? `${i.filter(N => N.lines.some(k => (k.sku.startsWith("HT-W") ? "Wrist Watches" : k.sku.startsWith("HT-C-042") ? "Wall Watches" : "Table Watches") === y.key)).length} lines confirmed` : "No revenue in period"), q;
    }, [A.byCategory, i]),
    x = Math.max(...j.map(q => q.value), 1),
    h = m.map(q => q.value > 0 ? 1 : 0),
    f = Math.max(...p.map(q => q.count), 1),
    favoriteCount = o.reduce((total, product) => total + Number(product.favoriteCount || 0), 0),
    topFavorite = [...o].sort((left, right) => Number(right.favoriteCount || 0) - Number(left.favoriteCount || 0))[0] || { name: "No saved watches" };
  return <div><FadeIn className="relative overflow-hidden rounded-[3px] border border-line"><img src={Ta.movement} alt="Macro of a mechanical watch movement \u2014 brass gear train and balance wheel" className="photo absolute inset-0 h-full w-full object-cover object-[66%_center] sm:object-[72%_center]" loading="eager" /><div className="absolute inset-0 bg-gradient-to-r from-panel via-panel/78 to-panel/5" /><div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/58 to-transparent" /><div className="grain absolute inset-0" /><div className="relative z-10 flex min-h-[560px] flex-col px-5 pt-7 pb-6 sm:min-h-[600px] sm:px-10 sm:pt-10 sm:pb-7 lg:px-12"><div className="flex flex-wrap items-start justify-between gap-6"><div><LegendText className="text-gold">R.S.D. Premium Watches · Wholesale Console</LegendText><h1 className="font-display mt-5 text-[clamp(2.35rem,5.4vw,3.9rem)] leading-[0.94] font-semibold tracking-[-0.022em] text-ink">Good afternoon, Admin</h1><p className="mt-4 max-w-[54ch] text-[14px] leading-relaxed text-ink-2">{"You have "}<span className="tnum text-ink">{i.filter(q => q.status === "Submitted").length}{" orders"}</span>{" awaiting confirmation and"}{" "}<span className="tnum text-ink">{c.filter(q => q.status === "Pending approval").length}{" dealers"}</span>{" pending approval. "}{o.filter(q => q.stock <= 4).length}{" products are low on stock."}</p></div><button onClick={() => a("analytics")} className="legend-lg group inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[2px] bg-gold-fill px-4 py-[11px] text-on-gold transition-all duration-200 hover:brightness-110 active:translate-y-px sm:w-auto">View analytics<Icon name="arrow" className="h-[15px] w-[15px] transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" /></button></div><div className="mt-auto pt-9 sm:pt-14"><div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5"><div><LegendText className="text-ink-2">Confirmed revenue · all orders</LegendText><div className="mt-5"><OverviewHeroBanner value={A.revenue} /></div><div className="mt-6 flex flex-wrap items-center gap-3"><StatusBadge tone="gold">{"▲ 100.0% vs previous period"}</StatusBadge><span className="text-[12px] text-ink-2"><span className="tnum text-ink">{A.count}</span>{" confirmed orders ·"}{" "}<span className="tnum text-ink">{A.units}</span>{" units ·"}{" "}<span className="tnum text-ink">{"LKR "}{bt(A.avg)}</span>{" average"}</span></div></div><div className="hidden shrink-0 text-right lg:block"><LegendText className="text-ink-3">Peak day</LegendText><div className="font-display tnum mt-3 text-[26px] leading-none font-semibold text-ink">21 Oct</div><div className="tnum mt-2 text-[12px] text-gold">LKR 1,319,670</div></div></div></div><div className="mt-7 sm:mt-9"><div className="rule mb-5 bg-line/70" /><RevenueAreaChart data={m} heightClass="h-[158px] sm:h-[216px]" id="hero" /><div className="mt-3 flex items-center justify-between">{[0, 9, 18, 29].map(q => <span className="legend text-ink-3 sm:hidden" key={q}>{m[q].label}</span>)}{[0, 6, 12, 18, 24, 29].map(q => <span className="legend hidden text-ink-3 sm:block" key={q}>{m[q].label}</span>)}</div></div></div></FadeIn><div className="mt-8 grid grid-cols-2 overflow-hidden rounded-[3px] border-t border-l border-line bg-panel md:grid-cols-3 lg:grid-cols-6"><KpiStatTile label="Orders" value={String(i.length)} sub={`${i.filter(q => q.status === "Submitted").length} awaiting confirmation`} spark={h} wide={!0} delay={.05} /><KpiStatTile label="Avg. order" value={`LKR ${bt(A.avg)}`} sub="Per confirmed order" delay={.1} /><KpiStatTile label="Units" value={String(A.units)} sub="Across saved watches" delay={.15} /><KpiStatTile label="Watch favourites" value={String(favoriteCount)} sub={topFavorite?.name ? `Most saved: ${topFavorite.name}` : "Browser saves"} delay={.2} /><KpiStatTile label="Active dealers" value={String(c.filter(q => q.status === "Active").length)} sub={`${c.filter(q => q.status === "Pending approval").length} pending approval`} delay={.25} /></div><div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_1fr]"><FadeIn delay={.05}><PanelCard title="Revenue by category" sub={`Confirmed orders · ${Tr}`} action={<StatusBadge tone="muted">4 categories</StatusBadge>}><div className="flex h-[10px] w-full overflow-hidden rounded-[1px] bg-line">{j.map((q, y) => q.value > 0 ? <motion.div className="h-full" style={{
              background: y === 0 ? "var(--gold)" : "var(--ink-3)"
            }} initial={n ? !1 : {
              width: 0
            }} animate={{
              width: `${q.value / Math.max(1, A.revenue) * 100}%`
            }} transition={{
              duration: .9,
              delay: .2,
              ease: Ft
            }} key={q.key} /> : null)}</div><ul className="mt-7 flex flex-col">{j.map((q, y) => <li className="group border-b border-line-soft py-4 last:border-0" key={q.key}><div className="flex items-baseline justify-between gap-5"><div className="flex min-w-0 items-baseline gap-3"><span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{
                    background: q.value > 0 ? "var(--gold)" : "var(--line)"
                  }} /><span className="truncate text-[14px] font-medium text-ink">{q.key}</span><span className="legend text-ink-3">{q.sku}{" SKU"}</span></div><div className="font-display tnum shrink-0 text-[19px] font-semibold text-ink">{q.value > 0 ? `LKR ${bt(q.value)}` : <span className="text-ink-3">LKR 0</span>}</div></div><div className="mt-2.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4"><div className="h-[2px] w-full flex-1 bg-line-soft"><motion.div className="h-full" style={{
                    background: q.value > 0 ? "var(--gold)" : "transparent"
                  }} initial={n ? !1 : {
                    width: 0
                  }} animate={{
                    width: `${q.value / x * 100}%`
                  }} transition={{
                    duration: .9,
                    delay: .25 + y * .06,
                    ease: Ft
                  }} /></div><span className="legend text-[9px] text-ink-3 sm:shrink-0 sm:text-[10px]">{q.note}</span></div></li>)}</ul><div className="mt-6"><EmptyNotice title="Three categories idle this period" body="Wall Watches, Table Watches and Accessories are listed and priced but recorded no confirmed revenue between 4 Oct and 2 Nov. Their stock still counts toward the reorder report." icon="analytics" /></div></PanelCard></FadeIn><FadeIn delay={.12}><PanelCard title="Needs attention" sub="Three open items across stock, saved watches and dealer approvals" action={<button onClick={() => a("analytics")} className="legend text-gold hover:underline">All alerts</button>} bodyClass="px-5 py-2 sm:px-6 sm:py-2"><ul>{Al.map((q, y) => <li className="border-b border-line-soft last:border-0" key={q.tone}><button onClick={() => a(y === 2 ? "dealers" : "products")} className="group w-full py-5 text-left"><div className="flex items-center gap-3"><StatusBadge tone={y === 0 ? "alert" : "gold"}>{q.tone}</StatusBadge><Icon name="chevron" className="ml-auto h-3.5 w-3.5 text-ink-3 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold" /></div><h3 className="mt-3 text-[14.5px] leading-snug font-semibold text-ink">{q.title}</h3><p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{q.detail}</p><span className="legend mt-3 inline-flex items-center gap-1.5 text-gold">{q.action}<Icon name="arrow" className="h-3 w-3" /></span></button></li>)}</ul></PanelCard></FadeIn></div><div className="mt-8 grid gap-8 lg:grid-cols-2"><FadeIn delay={.05}><PanelCard title="Order pipeline" sub={`Current stage · ${Tr}`} action={<StatusBadge tone="muted">{A.count}{" orders"}</StatusBadge>}><div className="flex flex-col gap-6">{p.map(q => <MetricBar label={q.stage} value={q.count} max={f} sub={`${q.count} ${q.count === 1 ? "order" : "orders"}`} tone={q.count === 0 ? "muted" : q.stage === "Ready" ? "alert" : "gold"} key={q.stage} />)}</div><div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-line bg-raised px-5 py-4"><div><LegendText className="text-ink-3">Value in pipeline</LegendText><div className="font-display tnum mt-2 text-[21px] font-semibold text-ink">LKR 168,389</div></div><PrimaryBtn onClick={() => a("orders")} className="w-full sm:w-auto">Open orders<Icon name="arrow" className="h-[15px] w-[15px]" /></PrimaryBtn></div></PanelCard></FadeIn><FadeIn delay={.12}><PanelCard title="Activity" sub="Everything that moved on the ledger" action={<span className="legend text-ink-3">Tap a row to open</span>} bodyClass="px-5 py-2 sm:px-6 sm:py-2"><ul>{M0.map((q, y) => <li key={y}><button onClick={() => a(q.kind === "Comment" ? "comments" : q.kind === "Dealer" ? "dealers" : "orders")} className="group flex w-full items-center gap-4 border-b border-line-soft py-[15px] text-left last:border-0"><span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border", q.kind === "Order" ? "border-gold/35 text-gold" : q.kind === "Comment" ? "border-line text-ink-2" : "border-alert/35 text-alert")}><Icon name={q.kind === "Order" ? "orders" : q.kind === "Comment" ? "comments" : "dealers"} className="h-[15px] w-[15px]" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] text-ink">{q.text}{q.amount > 0 && <span className="tnum text-ink-3">{" · LKR "}{bt(q.amount)}</span>}</span><span className="legend mt-[7px] block truncate text-ink-3">{q.meta}</span></span><Icon name="chevron" className="h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold" /></button></li>)}</ul></PanelCard></FadeIn></div><RuleLine className="mt-10" /><p className="py-8 text-[11.5px] text-ink-3">{"Figures reconcile to "}{A.count}{" confirmed orders totalling LKR "}{bt(A.revenue)}{" between "}{Tr}. Exported from R.S.D. Premium Watches · Colombo.</p></div>;
}
const of = {
    Submitted: "muted",
    Confirmed: "muted",
    Packing: "gold",
    Ready: "gold",
    Completed: "ok"
  },
  xs = ["All", "Submitted", "Confirmed", "Packing", "Ready", "Completed"];
function uf(a) {
  const n = ["Order", "Dealer", "City", "Date", "Units", "Status", "Amount LKR"],
    i = a.map(p => [p.id, p.dealer, p.city, p.date, p.units, p.status, p.amount].join(",")),
    c = new Blob([[n.join(","), ...i].join(`
`)], {
      type: "text/csv"
    }),
    o = URL.createObjectURL(c),
    A = document.createElement("a");
  A.href = o, A.download = "rsd-orders.csv", A.click(), URL.revokeObjectURL(o);
}
function OrdersDesktopTable({
  rows: a,
  open: n,
  setOpen: i,
  onBill: billAction
}) {
  const {
    setOrderStatus: c
  } = qe();
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse"><thead><tr className="border-b border-line">{["Order", "Dealer", "Date", "Units", "Status", "Amount"].map((o, A) => <th className={cn("legend py-3 text-ink-3", A === 0 ? "text-left" : A >= 3 ? "text-right" : "text-left", A === 3 && "pr-6")} key={o}>{o}</th>)}</tr></thead><tbody>{a.map(o => {
          const A = n === o.id;
          return <React.Fragment key={o.id}><tr onClick={() => i(A ? null : o.id)} className={cn("cursor-pointer border-b border-line-soft transition-colors duration-150", A ? "bg-raised" : "hover:bg-raised/60")}><td className="py-[15px] pr-4"><div className="flex items-center gap-3"><Icon name="chevron" className={cn("h-3 w-3 text-ink-3 transition-transform duration-200", A && "rotate-90 text-gold")} /><span className="tnum text-[12.5px] font-medium text-gold">{o.id}</span></div></td><td className="py-[15px] pr-4"><div className="text-[13.5px] text-ink">{o.dealer}</div><div className="legend mt-[6px] text-ink-3">{o.city}</div></td><td className="tnum py-[15px] pr-4 text-[12px] text-ink-2">{new Date(o.date + "T00:00:00").toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short"
                })}</td><td className="tnum py-[15px] pr-6 text-right text-[12.5px] text-ink-2">{o.units}</td><td className="py-[15px] pr-4 text-right"><StatusBadge tone={of[o.status]}>{o.status}</StatusBadge></td><td className="tnum py-[15px] text-right text-[13px] font-medium text-ink">{"LKR "}{bt(o.amount)}</td></tr><AnimatePresence initial={!1}>{A && <tr key={o.id + "-d"}><td colSpan={6} className="p-0"><motion.div initial={{
                    height: 0,
                    opacity: 0
                  }} animate={{
                    height: "auto",
                    opacity: 1
                  }} exit={{
                    height: 0,
                    opacity: 0
                  }} transition={{
                    duration: .32,
                    ease: Ft
                  }} className="overflow-hidden bg-raised"><div className="grid gap-6 border-b border-line px-6 py-6 md:grid-cols-[1.5fr_1fr]"><div><LegendText className="text-ink-3">Order lines</LegendText><ul className="mt-4 flex flex-col gap-3">{o.lines.map(p => <li className="flex items-baseline justify-between gap-5 border-b border-line-soft pb-3 last:border-0" key={p.sku}><div className="min-w-0"><div className="truncate text-[13px] text-ink">{p.name}</div><div className="legend mt-[6px] text-ink-3">{p.sku}{" · "}{p.qty}{" × LKR "}{bt(p.price)}</div></div><div className="tnum shrink-0 text-[12.5px] text-ink">{"LKR "}{bt(p.qty * p.price)}</div></li>)}</ul></div><div className="flex flex-col justify-between gap-6"><div><LegendText className="text-ink-3">Summary</LegendText><dl className="mt-4 flex flex-col gap-3">{[["Channel", o.channel], ["Fulfilment", o.delivery ?? "Not specified"], ["Reference", o.reference ?? "—"], ["Units", String(o.units)], ["Placed", new Date(o.date + "T00:00:00").toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "long"
                            })], ["Status", o.status]].map(([p, m]) => <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-2 last:border-0" key={p}><span className="legend text-ink-3">{p}</span><span className="text-[12.5px] text-ink">{m}</span></div>)}</dl></div><label className="block"><LegendText className="text-ink-3">Update status</LegendText><select aria-label={`Update status for ${o.id}`} value={o.status} onChange={p => c(o.id, p.target.value)} className="mt-2 w-full rounded-[2px] border border-line bg-surface px-3 py-2.5 text-[13px] text-ink">{xs.filter(p => p !== "All").map(p => <option value={p} disabled={xs.indexOf(p) < xs.indexOf(o.status)} key={p}>{p}</option>)}</select></label><div className="flex flex-wrap gap-2"><SecondaryBtn onClick={() => uf([o])}><Icon name="download" className="h-[14px] w-[14px]" />Export order CSV</SecondaryBtn><SecondaryBtn onClick={() => billAction?.(o.id)}><Icon name="receipt" className="h-[14px] w-[14px]" />Bill / receipt</SecondaryBtn></div></div></div></motion.div></td></tr>}</AnimatePresence></React.Fragment>;
        })}</tbody></table></div>;
}
function AdminOrdersView({ onNavigate }) {
  const {
      orders: a,
      ready: adReady
    } = qe(),
    n = React.useMemo(() => fs(a), [a]),
    [i, c] = React.useState("All"),
    [o, A] = React.useState(""),
    [p, m] = React.useState(null),
    [j, x] = React.useState(!1),
    h = React.useMemo(() => {
      const q = o.trim().toLowerCase();
      return a.filter(y => (i === "All" || y.status === i) && (!q || `${y.id} ${y.dealer} ${y.city} ${y.lines.map(N => N.name).join(" ")}`.toLowerCase().includes(q)));
    }, [i, o, a]),
    f = h.reduce((q, y) => q + y.amount, 0),
    openBill = id => {
      try { window.sessionStorage.setItem("rsd-bill-source-order", id); } catch {}
      onNavigate?.("bills");
    };
  if (!adReady && !a.length) return <div className="mx-auto w-full max-w-[560px] px-4 pt-5"><ShimmerBlock className="h-3 w-[84px]" /><ShimmerBlock className="mt-3 h-7 w-[140px]" /><div className="mt-6"><OrdersSkeleton rows={5} /></div></div>;
  return <div><PageHeader eyebrow="Workspace" title="Orders" sub={`Review orders and update their status. Confirmed revenue is LKR ${bt(n.revenue)}. Open a row to inspect its lines.`} action={<div className="flex flex-wrap items-center gap-3"><SecondaryBtn onClick={() => uf(h)}><Icon name="download" className="h-[14px] w-[14px]" />Export CSV</SecondaryBtn><PrimaryBtn onClick={() => x(!0)}>New order<Icon name="arrow" className="h-[15px] w-[15px]" /></PrimaryBtn></div>} /><div className="grid grid-cols-2 overflow-hidden rounded-[3px] border-t border-l border-line bg-panel md:grid-cols-4">{[["Orders", String(h.length), `of ${a.length} in period`], ["Value", `LKR ${bt(f)}`, "Filtered total"], ["Units", String(h.reduce((q, y) => q + y.units, 0)), `${n.units} units in period`], ["Avg. order", `LKR ${bt(h.length ? Math.round(f / h.length) : 0)}`, `LKR ${bt(n.avg)} in period`]].map(([q, y, N], k) => <div className="border-r border-b border-line px-4 py-4 sm:px-6 sm:py-5" key={q}><LegendText className="text-ink-3">{q}</LegendText><div className="font-display tnum mt-3 text-[clamp(1.15rem,4.4vw,1.375rem)] leading-none font-semibold text-ink">{y}</div><div className="mt-2.5 text-[11px] text-ink-3">{N}</div>{k === 0 && <div className="mt-3 h-[2px] w-8 bg-gold" />}</div>)}</div><FadeIn delay={.06} className="mt-8"><PanelCard title="Order ledger" sub="Tap any row to expand order lines" action={<div className="flex flex-wrap items-center gap-2"><div className="relative"><Icon name="search" className="pointer-events-none absolute top-1/2 left-2.5 h-[14px] w-[14px] -translate-y-1/2 text-ink-3" /><input value={o} onChange={q => A(q.target.value)} placeholder="Filter\u2026" aria-label="Filter orders" className="w-[150px] rounded-[2px] border border-line bg-surface py-[8px] pr-2 pl-8 text-[12px] text-ink placeholder:text-ink-3/80 focus:border-gold/50" /></div></div>} bodyClass="px-5 py-5 sm:px-6"><FilterRow className="mb-5 sm:mb-6">{xs.map(q => <SecondaryBtn active={i === q} onClick={() => c(q)} key={q}>{q}<span className="tnum text-[10px] opacity-70">{q === "All" ? a.length : a.filter(y => y.status === q).length}</span></SecondaryBtn>)}</FilterRow>{h.length === 0 ? <EmptyNotice title="No orders match this filter" body={`Nothing in the ledger for “${o || i}”. Clear the filter or search an order code such as WC-1009.`} icon="search" /> : <><div className="hidden lg:block"><OrdersDesktopTable rows={h} open={p} setOpen={m} onBill={openBill} /></div><ul className="flex flex-col gap-3 lg:hidden">{h.map(q => {
              const y = p === q.id;
              return <li className="overflow-hidden rounded-[2px] border border-line bg-surface" key={q.id}><button onClick={() => m(y ? null : q.id)} aria-expanded={y} className="w-full px-4 pt-4 pb-3.5 text-left active:bg-raised/60"><div className="flex items-center justify-between gap-3"><span className="tnum text-[12px] text-gold">{q.id}</span><StatusBadge tone={of[q.status]}>{q.status}</StatusBadge></div><div className="mt-3 text-[15px] leading-snug text-ink">{q.dealer}</div><div className="legend mt-2 text-ink-3">{q.city}{" · "}{new Date(q.date + "T00:00:00").toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short"
                    })}{" · "}{q.units}{" units"}</div><div className="mt-3.5 flex items-end justify-between gap-3 border-t border-line-soft pt-3"><span className="font-display tnum text-[21px] leading-none font-semibold text-ink">{"LKR "}{bt(q.amount)}</span><Icon name="chevron" className={cn("mb-1 h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform duration-200", y && "rotate-90 text-gold")} /></div></button><AnimatePresence initial={!1}>{y && <motion.div initial={{
                    height: 0,
                    opacity: 0
                  }} animate={{
                    height: "auto",
                    opacity: 1
                  }} exit={{
                    height: 0,
                    opacity: 0
                  }} transition={{
                    duration: .28,
                    ease: Ft
                  }} className="overflow-hidden border-t border-line bg-raised"><div className="px-4 py-4"><LegendText className="text-ink-3">Order lines</LegendText><ul className="mt-3 flex flex-col">{q.lines.map(N => <li className="flex items-baseline justify-between gap-4 border-b border-line-soft py-3 last:border-0" key={N.sku}><div className="min-w-0"><div className="text-[12.5px] leading-snug text-ink">{N.name}</div><div className="legend mt-1.5 text-ink-3">{N.sku}{" · "}{N.qty}{" × "}{bt(N.price)}</div></div><div className="tnum shrink-0 text-[12px] text-ink">{"LKR "}{bt(N.qty * N.price)}</div></li>)}</ul><div className="mt-4 flex flex-wrap gap-2"><SecondaryBtn className="flex-1" onClick={() => openBill(q.id)}><Icon name="receipt" className="h-[14px] w-[14px]" />Bill / receipt</SecondaryBtn><SecondaryBtn className="flex-1"><Icon name="comments" className="h-[14px] w-[14px]" />Message</SecondaryBtn></div></div></motion.div>}</AnimatePresence></li>;
            })}</ul></>}</PanelCard></FadeIn><NewOrderSheet open={j} onClose={() => x(!1)} /></div>;
}
const BILL_DEFAULT_WARRANTY = "1-year colour warranty, starting from the delivery date.";
const BILL_DEFAULT_EXCLUSIONS = "Damage, water, misuse, and normal wear.";
const BILL_CLAIM_PHONE = RSD_WHATSAPP_NUMBER;

function blankBill(billNo = "RSD-0001") {
  return {
    billNo,
    date: "",
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    items: [{ sku: "", name: "", colour: "", qty: 1, price: "" }],
    deliveryLabel: "FREE",
    deliveryCharge: "",
    deliverySaving: "",
    paymentMethod: "Bank transfer",
    paymentStatus: "PAID",
    paymentDate: "",
    paymentReference: "",
    courier: "",
    tracking: "",
    expectedDate: "",
    pickupPlace: "",
    deliveryPlace: "",
    courierAmount: "",
    courierNotes: "",
    warrantyTerm: BILL_DEFAULT_WARRANTY,
    warrantyCovers: "",
    warrantyExclusions: BILL_DEFAULT_EXCLUSIONS,
    warrantyClaim: `To claim, message ${BILL_CLAIM_PHONE} with this bill and photos.`,
    returnsPolicy: "",
  };
}

function nextBillNumber() {
  try {
    const current = Number.parseInt(window.localStorage.getItem("rsd-next-bill-number") || "1", 10);
    const next = Number.isFinite(current) && current > 0 ? current : 1;
    window.localStorage.setItem("rsd-next-bill-number", String(next + 1));
    return `RSD-${String(next).padStart(4, "0")}`;
  } catch {
    return `RSD-${String(Date.now()).slice(-4)}`;
  }
}

function rememberBillNumber(value) {
  const match = String(value || "").match(/^RSD-(\d+)$/i);
  if (!match) return;
  try {
    const used = Number.parseInt(match[1], 10);
    const current = Number.parseInt(window.localStorage.getItem("rsd-next-bill-number") || "1", 10);
    if (Number.isFinite(used) && used >= current) window.localStorage.setItem("rsd-next-bill-number", String(used + 1));
  } catch {}
}

const billInputClass = "mt-2 w-full rounded-[2px] border border-line bg-surface px-3 py-[10px] text-[13px] text-ink placeholder:text-ink-3/70 focus:border-gold/50";
const billTextareaClass = `${billInputClass} min-h-[76px] resize-y leading-relaxed`;

function BillField({ label, value, onChange, type = "text", placeholder = "", className = "", min, step }) {
  return <label className={cn("block", className)}><LegendText className="text-ink-3">{label}</LegendText><input type={type} value={value ?? ""} onChange={event => onChange(event.target.value)} placeholder={placeholder} min={min} step={step} className={billInputClass} /></label>;
}

function BillTextArea({ label, value, onChange, placeholder = "", className = "" }) {
  return <label className={cn("block", className)}><LegendText className="text-ink-3">{label}</LegendText><textarea value={value ?? ""} onChange={event => onChange(event.target.value)} placeholder={placeholder} className={billTextareaClass} /></label>;
}

function BillValue({ value, className = "" }) {
  const text = value === 0 ? "0" : value;
  return <span className={cn(!text && "text-ink-3/70", className)}>{text || "Blank"}</span>;
}

function billUiMoney(value, blank = false) {
  return blank && !Number(value) ? "—" : `LKR ${bt(Number(value) || 0)}`;
}

function BillPreview({ bill, mode }) {
  const totals = calculateBillTotals(bill);
  const isCourier = mode === "courier";
  return <article className="bill-preview rounded-[3px] border border-line bg-[#fbfaf6] p-5 text-[#242320] shadow-[0_18px_45px_rgba(0,0,0,.16)] sm:p-7" aria-label={isCourier ? "Courier bill preview" : "Customer bill preview"}>
    <div className="flex items-start justify-between gap-5 border-b border-[#d9d4c8] pb-5"><div><div className="font-display text-[23px] font-semibold tracking-[-.02em]">R.S.D.</div><div className="mt-1 text-[9px] tracking-[.2em] text-[#8a8377]">PREMIUM WATCHES</div></div><div className="text-right"><div className="font-display text-[17px] font-semibold">{isCourier ? "COURIER COPY" : "BILL / RECEIPT"}</div><div className="mt-2 text-[10px] text-[#777168]">Bill No: <BillValue value={bill.billNo} /></div><div className="mt-1 text-[10px] text-[#777168]">Date: <BillValue value={formatBillDate(bill.date)} /></div></div></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><div><div className="bill-preview-label">{isCourier ? "Receiver" : "Customer"}</div><div className="bill-preview-value"><BillValue value={bill.customerName} /></div></div><div><div className="bill-preview-label">Phone</div><div className="bill-preview-value"><BillValue value={bill.customerPhone} /></div></div><div className="sm:col-span-2"><div className="bill-preview-label">Delivery address</div><div className="bill-preview-value"><BillValue value={bill.deliveryAddress} /></div></div></div>
    <div className="mt-7"><div className="bill-preview-label">Items</div><div className="mt-2 overflow-hidden border-y border-[#d9d4c8]"><div className="grid grid-cols-[minmax(0,1.6fr)_minmax(60px,.8fr)_34px_auto] gap-2 bg-[#f0ede5] px-3 py-2 text-[9px] font-semibold uppercase tracking-[.08em] text-[#777168]"><span>Item</span><span>Colour</span><span>Qty</span>{!isCourier && <span className="text-right">Amount</span>}</div>{(bill.items || []).map((item, index) => <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(60px,.8fr)_34px_auto] gap-2 border-t border-[#e7e2d8] px-3 py-3 text-[11px]" key={`${item.sku || item.name || "item"}-${index}`}><span className="min-w-0 break-words">{index + 1}. <BillValue value={item.name} /></span><span className="break-words"><BillValue value={item.colour} /></span><span>{item.qty || 1}</span>{!isCourier && <span className="text-right">{totals.hasPrice ? billUiMoney(Number(item.price) * (Number(item.qty) || 1)) : "—"}</span>}</div>)}</div></div>
    {!isCourier && <><div className="mt-5 ml-auto max-w-[250px] space-y-2 text-[11px]"><div className="flex justify-between gap-4"><span className="text-[#777168]">Subtotal</span><span>{totals.hasPrice ? billUiMoney(totals.subtotal) : "—"}</span></div><div className="flex justify-between gap-4"><span className="text-[#777168]">Delivery</span><span>{bill.deliveryLabel || (totals.deliveryCharge ? billUiMoney(totals.deliveryCharge) : "FREE")}</span></div>{totals.deliverySaving > 0 && <div className="flex justify-between gap-4"><span className="text-[#777168]">Buy 2+ delivery saving</span><span>- {billUiMoney(totals.deliverySaving)}</span></div>}<div className="flex justify-between gap-4 border-t border-[#242320] pt-3 text-[14px] font-semibold"><span>TOTAL</span><span>{totals.hasPrice ? billUiMoney(totals.total) : "—"}</span></div></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><div><div className="bill-preview-label">Payment method</div><div className="bill-preview-value"><BillValue value={bill.paymentMethod} /></div></div><div><div className="bill-preview-label">Status</div><div className="bill-preview-value"><BillValue value={bill.paymentStatus} /></div></div><div><div className="bill-preview-label">Paid on</div><div className="bill-preview-value"><BillValue value={formatBillDate(bill.paymentDate)} /></div></div><div className="sm:col-span-3"><div className="bill-preview-label">Reference</div><div className="bill-preview-value"><BillValue value={bill.paymentReference} /></div></div></div></>}
    <div className="mt-7"><div className="bill-preview-label">Delivery</div><div className="mt-2 grid gap-4 sm:grid-cols-3"><div><div className="bill-preview-mini-label">Courier</div><div className="bill-preview-value"><BillValue value={bill.courier} /></div></div><div><div className="bill-preview-mini-label">Tracking</div><div className="bill-preview-value"><BillValue value={bill.tracking} /></div></div><div><div className="bill-preview-mini-label">Expected</div><div className="bill-preview-value"><BillValue value={formatBillDate(bill.expectedDate)} /></div></div><div><div className="bill-preview-mini-label">Pickup place</div><div className="bill-preview-value"><BillValue value={bill.pickupPlace} /></div></div><div><div className="bill-preview-mini-label">Delivery place</div><div className="bill-preview-value"><BillValue value={bill.deliveryPlace} /></div></div></div></div>
    {isCourier ? <div className="mt-7 grid gap-4 sm:grid-cols-2"><div><div className="bill-preview-label">Amount / COD</div><div className="bill-preview-value"><BillValue value={bill.courierAmount} /></div></div><div><div className="bill-preview-label">Parcel notes</div><div className="bill-preview-value"><BillValue value={bill.courierNotes} /></div></div></div> : <><div className="mt-7"><div className="bill-preview-label">Warranty</div><div className="mt-2 space-y-2 text-[11px] leading-relaxed"><div><strong>Term:</strong> <BillValue value={bill.warrantyTerm} /></div><div><strong>Covers:</strong> <BillValue value={bill.warrantyCovers} /></div><div><strong>Does not cover:</strong> <BillValue value={bill.warrantyExclusions} /></div><div><strong>To claim:</strong> <BillValue value={bill.warrantyClaim} /></div></div></div><div className="mt-7"><div className="bill-preview-label">Returns</div><p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed"><BillValue value={bill.returnsPolicy} /></p></div></>}
    <div className="mt-8 border-t border-[#d9d4c8] pt-4 text-[11px] font-semibold text-[#9d771c]">Thank you for ordering from R.S.D.!</div><div className="mt-1 text-[9px] text-[#777168]">WhatsApp 0711368623</div>
  </article>;
}

function AdminBillsView() {
  const { orders, products } = qe();
  const toast = In();
  const [bill, setBill] = React.useState(() => blankBill());
  const [sourceOrder, setSourceOrder] = React.useState("");
  const [mode, setMode] = React.useState("receipt");
  const totals = React.useMemo(() => calculateBillTotals(bill), [bill]);
  const update = patch => setBill(previous => ({ ...previous, ...patch }));
  const updateItem = (index, patch) => setBill(previous => ({ ...previous, items: previous.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const resetBill = () => {
    setBill(blankBill(nextBillNumber()));
    setSourceOrder("");
    toast("New blank bill ready", "receipt");
  };
  const loadOrder = id => {
    setSourceOrder(id);
    const order = orders.find(item => item.id === id);
    if (!order) {
      setBill(previous => blankBill(previous.billNo));
      return;
    }
    const lines = (order.lines || []).map(line => {
      const product = products.find(item => item.sku === line.sku);
      return {
        sku: line.sku || "",
        name: line.name || product?.name || "",
        colour: line.colour || line.color || product?.colors?.[0] || "",
        qty: line.qty || 1,
        price: line.price ?? product?.price ?? "",
      };
    });
    setBill(previous => ({
      ...previous,
      customerName: order.customerName || order.customer_name || order.dealer || "",
      customerPhone: order.customerPhone || order.customer_phone || order.phone || "",
      deliveryAddress: order.deliveryAddress || order.delivery_address || order.address || "",
      date: order.date || "",
      deliveryPlace: order.city || "",
      deliveryLabel: order.delivery || "FREE",
      paymentReference: order.reference || "",
      paymentStatus: order.status === "Completed" ? "PAID" : previous.paymentStatus,
      items: lines.length ? lines : previous.items,
    }));
    toast(`Loaded details from ${order.id}`, "check");
  };
  React.useEffect(() => {
    let pending = "";
    try {
      pending = window.sessionStorage.getItem("rsd-bill-source-order") || "";
      if (pending && orders.some(order => order.id === pending)) window.sessionStorage.removeItem("rsd-bill-source-order");
    } catch {}
    if (pending && orders.some(order => order.id === pending)) loadOrder(pending);
  }, [orders.length]);
  const chooseProduct = (index, sku) => {
    const product = products.find(item => item.sku === sku);
    if (!product) {
      updateItem(index, { sku: "" });
      return;
    }
    updateItem(index, { sku, name: product.name, price: product.price, colour: product.colors?.[0] || "" });
  };
  const makePdf = async pdfMode => {
    try {
      rememberBillNumber(bill.billNo);
      await downloadBillPdf(bill, pdfMode);
      toast(`${pdfMode === "courier" ? "Courier copy" : "Customer receipt"} PDF downloaded`, "download");
    } catch {
      toast("The PDF could not be generated in this browser", "alert");
    }
  };
  return <div><PageHeader eyebrow="Operations" title="Bill / Receipt" sub="Build a customer receipt from an existing order or start blank. Prices, dates, courier details, places, warranty text, and returns policy remain editable before the PDF is generated." action={<div className="flex flex-wrap gap-3"><SecondaryBtn onClick={resetBill}><Icon name="plus" className="h-[14px] w-[14px]" />New bill</SecondaryBtn><PrimaryBtn onClick={() => makePdf(mode)}><Icon name="download" className="h-[14px] w-[14px]" />Download {mode === "courier" ? "courier" : "receipt"} PDF</PrimaryBtn></div>} /><div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(420px,.9fr)]"><FadeIn><PanelCard title="Bill details" sub="Leave any price, date, place, or courier field blank when you need to fill it later"><div className="flex flex-col gap-6"><label className="block"><LegendText className="text-ink-3">Start from an existing web order</LegendText><select value={sourceOrder} onChange={event => loadOrder(event.target.value)} className={billInputClass}><option value="">Blank bill</option>{orders.map(order => <option value={order.id} key={order.id}>{order.id} · {order.dealer} · LKR {bt(order.amount)}</option>)}</select><p className="mt-2 text-[11px] leading-relaxed text-ink-3">Selecting an order copies its customer/dealer name, city, date, items, and calculated customer prices. Phone and address stay blank unless the order already contains them.</p></label><div className="grid gap-4 sm:grid-cols-2"><BillField label="Bill No" value={bill.billNo} onChange={value => update({ billNo: value })} placeholder="RSD-0001" /><BillField label="Date" value={bill.date} onChange={value => update({ date: value })} type="date" /></div><div><div className="mb-3 flex items-center justify-between gap-4"><h3 className="legend-lg text-ink">Customer</h3><StatusBadge tone="muted">Editable</StatusBadge></div><div className="grid gap-4 sm:grid-cols-2"><BillField label="Name" value={bill.customerName} onChange={value => update({ customerName: value })} placeholder="Customer name" /><BillField label="Phone" value={bill.customerPhone} onChange={value => update({ customerPhone: value })} placeholder="07X XXX XXXX" type="tel" /><BillTextArea label="Delivery address" value={bill.deliveryAddress} onChange={value => update({ deliveryAddress: value })} placeholder="Full address" className="sm:col-span-2" /></div></div><div><div className="mb-3 flex items-center justify-between gap-4"><h3 className="legend-lg text-ink">Items</h3><SecondaryBtn onClick={() => update({ items: [...bill.items, { sku: "", name: "", colour: "", qty: 1, price: "" }] })}><Icon name="plus" className="h-[13px] w-[13px]" />Add item</SecondaryBtn></div><div className="flex flex-col gap-3">{bill.items.map((item, index) => <div className="rounded-[2px] border border-line bg-surface p-3" key={`${item.sku || "custom"}-${index}`}><div className="flex items-center justify-between gap-3"><LegendText className="text-gold">Item {index + 1}</LegendText>{bill.items.length > 1 && <button type="button" onClick={() => update({ items: bill.items.filter((_, itemIndex) => itemIndex !== index) })} className="legend text-alert">Remove</button>}</div><select value={item.sku || ""} onChange={event => chooseProduct(index, event.target.value)} className={billInputClass}><option value="">Custom item / choose a product</option>{products.map(product => <option value={product.sku} key={product.sku}>{product.name} · {product.sku} · LKR {bt(product.price)}</option>)}</select><div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,.85fr)_72px_120px]"><BillField label="Watch model" value={item.name} onChange={value => updateItem(index, { name: value })} placeholder="Watch model" /><BillField label="Colour" value={item.colour} onChange={value => updateItem(index, { colour: value })} placeholder="Steel" /><BillField label="Qty" value={item.qty} onChange={value => updateItem(index, { qty: value })} type="number" min="1" step="1" /><BillField label="Price (LKR)" value={item.price} onChange={value => updateItem(index, { price: value })} placeholder="Blank" type="number" min="0" step="50" /></div></div>)}</div></div><div><h3 className="legend-lg mb-3 text-ink">Delivery and total</h3><div className="grid gap-4 sm:grid-cols-2"><BillField label="Delivery label" value={bill.deliveryLabel} onChange={value => update({ deliveryLabel: value })} placeholder="FREE" /><BillField label="Delivery charge (LKR)" value={bill.deliveryCharge} onChange={value => update({ deliveryCharge: value })} placeholder="Blank" type="number" min="0" step="50" /><BillField label="Buy 2+ delivery saving (LKR)" value={bill.deliverySaving} onChange={value => update({ deliverySaving: value })} placeholder="Blank" type="number" min="0" step="50" /><div className="rounded-[2px] border border-gold/30 bg-gold/10 px-3 py-2.5"><LegendText className="text-gold">Calculated total</LegendText><div className="font-display tnum mt-1 text-[18px] font-semibold text-ink">{totals.hasPrice ? `LKR ${bt(totals.total)}` : "Blank until prices are added"}</div></div></div></div><div><h3 className="legend-lg mb-3 text-ink">Payment</h3><div className="grid gap-4 sm:grid-cols-2"><BillField label="Method" value={bill.paymentMethod} onChange={value => update({ paymentMethod: value })} placeholder="Bank transfer" /><label className="block"><LegendText className="text-ink-3">Status</LegendText><select value={bill.paymentStatus} onChange={event => update({ paymentStatus: event.target.value })} className={billInputClass}><option>PAID</option><option>PENDING</option><option>PARTIALLY PAID</option></select></label><BillField label="Paid on" value={bill.paymentDate} onChange={value => update({ paymentDate: value })} type="date" /><BillField label="Reference" value={bill.paymentReference} onChange={value => update({ paymentReference: value })} placeholder="Transfer reference" /></div></div><div><h3 className="legend-lg mb-3 text-ink">Delivery / courier</h3><div className="grid gap-4 sm:grid-cols-2"><BillField label="Courier" value={bill.courier} onChange={value => update({ courier: value })} placeholder="Courier name" /><BillField label="Tracking" value={bill.tracking} onChange={value => update({ tracking: value })} placeholder="Tracking number" /><BillField label="Expected date" value={bill.expectedDate} onChange={value => update({ expectedDate: value })} type="date" /><BillField label="Pickup place" value={bill.pickupPlace} onChange={value => update({ pickupPlace: value })} placeholder="Blank for later" /><BillField label="Delivery place" value={bill.deliveryPlace} onChange={value => update({ deliveryPlace: value })} placeholder="Blank for later" /><BillField label="Courier amount / COD" value={bill.courierAmount} onChange={value => update({ courierAmount: value })} placeholder="Blank for courier" /><BillTextArea label="Courier notes" value={bill.courierNotes} onChange={value => update({ courierNotes: value })} placeholder="Parcel notes" className="sm:col-span-2" /></div></div><div><h3 className="legend-lg mb-3 text-ink">Warranty and returns</h3><div className="grid gap-4"><BillTextArea label="Warranty term" value={bill.warrantyTerm} onChange={value => update({ warrantyTerm: value })} /><BillTextArea label="Warranty covers" value={bill.warrantyCovers} onChange={value => update({ warrantyCovers: value })} placeholder="What is covered" /><BillTextArea label="Does not cover" value={bill.warrantyExclusions} onChange={value => update({ warrantyExclusions: value })} /><BillTextArea label="How to claim" value={bill.warrantyClaim} onChange={value => update({ warrantyClaim: value })} /><BillTextArea label="Returns and refund policy" value={bill.returnsPolicy} onChange={value => update({ returnsPolicy: value })} placeholder="Add your return and refund policy" /></div></div></div></PanelCard></FadeIn><FadeIn delay={.08}><div className="sticky top-[84px] flex flex-col gap-4"><PanelCard title="Live preview" sub="The PDF uses the same information shown here" action={<div className="flex gap-2"><SecondaryBtn active={mode === "receipt"} onClick={() => setMode("receipt")}>Customer receipt</SecondaryBtn><SecondaryBtn active={mode === "courier"} onClick={() => setMode("courier")}>Courier copy</SecondaryBtn></div>} bodyClass="p-3 sm:p-5"><BillPreview bill={bill} mode={mode} /></PanelCard><PanelCard title="Download documents" sub="Create one or both copies after you finish editing"><div className="grid gap-3 sm:grid-cols-2"><PrimaryBtn onClick={() => makePdf("receipt")} className="w-full"><Icon name="download" className="h-[14px] w-[14px]" />Customer receipt PDF</PrimaryBtn><SecondaryBtn onClick={() => makePdf("courier")} className="w-full"><Icon name="download" className="h-[14px] w-[14px]" />Courier copy PDF</SecondaryBtn></div><p className="mt-4 text-[11px] leading-relaxed text-ink-3">The courier copy intentionally omits customer prices and payment details. Leave its amount, tracking, expected date, and places blank when you want to complete them by hand.</p></PanelCard></div></FadeIn></div></div>;
}

const dH = [{
  name: "Wrist Watches",
  image: Ta.productWrist,
  skus: 14,
  revenue: 2109038,
  note: "Automatic, quartz and chronograph lines — the whole of this period's revenue."
}, {
  name: "Wall Watches",
  image: Ta.productWall,
  skus: 6,
  revenue: 0,
  note: "Regulator and pendulum wall pieces. Listed and priced, no confirmed sales."
}, {
  name: "Table Watches",
  image: Ta.productTable,
  skus: 4,
  revenue: 0,
  note: "Desk and mantel clocks, mostly bought as gift stock before December."
}];
function productSkuPrefix(category) {
  return category === "Wrist Watches" ? "HT-W" : category === "Wall Watches" ? "HT-C" : category === "Table Watches" ? "HT-T" : "HT-X";
}
function AdminAddProductView({ onNavigate: navTo }) {
  return <AdminProductsView onNavigate={navTo} startNew />;
}
function AdminProductsView({ onNavigate: navTo, startNew = false }) {
  const {
      products: a,
      orders: n
    } = qe(),
    [i, c] = React.useState("All"),
    [o, A] = React.useState(!!startNew),
    [p, m] = React.useState(null),
    j = ["All", "Wrist Watches", "Wall Watches", "Table Watches", "Others"],
    x = a.filter(h => i === "All" || h.category === i);
  React.useEffect(() => {
    if (startNew) {
      m(null);
      A(!0);
    }
  }, [startNew]);
  return <div><PageHeader eyebrow="Catalogue" title="Products" sub={`${a.length} products across the catalogue. Edit a product to update catalogue details or its private supplier price. Customer price is calculated automatically.`} action={<div className="flex flex-wrap gap-3"><SecondaryBtn onClick={() => Xr("rsd-price-list.csv", [["SKU", "Product", "Category", "Price LKR", "Available"], ...a.map(h => [h.sku, h.name, h.category, h.price, h.stock])])}><Icon name="download" className="h-[14px] w-[14px]" />Price list</SecondaryBtn><PrimaryBtn onClick={() => navTo?.("new-product")}>Add product<Icon name="arrow" className="h-[15px] w-[15px]" /></PrimaryBtn></div>} /><div className="grid gap-6 md:grid-cols-3">{dH.map((h, f) => {
        const q = {
          ...h,
          skus: a.filter(y => y.category === h.name).length,
          revenue: fs(n).byCategory.get(h.name) ?? 0
        };
        return <FadeIn delay={f * .07} key={q.name}><article className="group relative h-full overflow-hidden rounded-[3px] border border-line bg-panel"><div className="relative h-[168px] overflow-hidden sm:h-[190px]"><img src={q.image} alt={q.name} loading="lazy" className="photo h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]" /><div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/25 to-transparent" /></div><div className="px-4 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6"><div className="flex items-baseline justify-between gap-3"><h3 className="font-display text-[19px] leading-tight font-semibold text-ink">{q.name}</h3><span className="legend text-ink-3">{q.skus}{" SKU"}</span></div><div className="font-display tnum mt-4 text-[20px] font-semibold text-ink">{q.revenue > 0 ? `LKR ${bt(q.revenue)}` : <span className="text-ink-3">LKR 0</span>}</div><LegendText className="mt-2 text-ink-3">{"Revenue · "}{Tr}</LegendText><p className="mt-4 text-[12.5px] leading-relaxed text-ink-2">{q.note}</p></div></article></FadeIn>;
      })}</div><FadeIn delay={.1} className="mt-8"><PanelCard title="Stock ledger" sub="Quantity on hand against units reserved on open orders" action={<FilterRow>{j.map(h => <SecondaryBtn active={i === h} onClick={() => c(h)} key={h}>{h}</SecondaryBtn>)}</FilterRow>} bodyClass="px-5 py-5 sm:px-6"><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[760px] border-collapse"><thead><tr className="border-b border-line">{["SKU", "Product", "Customer price", "On hand", "Reserved", "7-day movement", "Favourites", "State", ""].map((h, f) => <th className={cn("legend py-3 text-ink-3", f >= 2 && f <= 4 ? "text-right" : "text-left", f === 2 && "pr-6", f === 4 && "pr-6")} key={h}>{h}</th>)}</tr></thead><tbody>{x.map(h => {
                const f = h.stock <= 4;
                return <tr className="border-b border-line-soft transition-colors last:border-0 hover:bg-raised/60" key={h.sku}><td className="tnum py-[15px] pr-4 text-[11.5px] text-gold">{h.sku}</td><td className="py-[15px] pr-4"><div className="text-[13.5px] text-ink">{h.name}</div><div className="legend mt-[6px] text-ink-3">{h.category}</div></td><td className="tnum py-[15px] pr-6 text-right text-[12.5px] text-ink-2">{"LKR "}{bt(h.price)}</td><td className="tnum py-[15px] pr-6 text-right text-[13px] font-medium text-ink">{h.stock}</td><td className="tnum py-[15px] pr-6 text-right text-[12.5px] text-ink-2">{h.reserved}</td><td className="py-[15px] pr-6"><div className="w-[110px]"><Sparkline values={h.trend} /></div></td><td className="tnum py-[15px] pr-6 text-right text-[12.5px] text-gold">{Number(h.favoriteCount || 0)}</td><td className="py-[15px]"><StatusBadge tone={f ? "alert" : "ok"}>{f ? "Reorder" : "Healthy"}</StatusBadge></td><td className="py-[15px] pl-3 text-right"><button onClick={() => {
                      m(h), A(!0);
                    }} className="legend min-h-9 text-gold" aria-label={`Edit ${h.name}`}>Edit</button></td></tr>;
              })}</tbody></table></div><ul className="flex flex-col gap-3 lg:hidden">{x.map(h => <li className="rounded-[2px] border border-line bg-surface p-4" key={h.sku}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[14px] leading-snug text-ink">{h.name}</div><div className="legend mt-2 text-gold">{h.sku}{" · "}{h.category}</div></div><StatusBadge tone={h.stock <= 4 ? "alert" : "ok"}>{h.stock <= 4 ? "Reorder" : "Healthy"}</StatusBadge></div><div className="mt-4 flex items-end justify-between gap-4 border-t border-line-soft pt-3"><div><LegendText className="text-ink-3">Customer price</LegendText><div className="font-display tnum mt-1.5 text-[18px] leading-none font-semibold text-ink">{"LKR "}{bt(h.price)}</div></div><div className="flex gap-5 text-right"><div><LegendText className="text-ink-3">On hand</LegendText><div className="tnum mt-1.5 text-[15px] text-ink">{h.stock}</div></div><div><LegendText className="text-ink-3">Reserved</LegendText><div className="tnum mt-1.5 text-[15px] text-ink-2">{h.reserved}</div></div><div><LegendText className="text-ink-3">Saved</LegendText><div className="tnum mt-1.5 text-[15px] text-gold">{Number(h.favoriteCount || 0)}</div></div></div></div><div className="mt-3 h-8"><Sparkline values={h.trend} /></div></li>)}</ul>{x.length === 0 && <div className="mt-6"><EmptyNotice title="No products in this category" body="Nothing is listed here yet. Change the filter above to see the rest of the catalogue." icon="products" /></div>}</PanelCard></FadeIn><ProductEditorSheet open={o} product={p} onClose={() => A(!1)} /></div>;
}
function AdminDealersView() {
  const {
      dealers: a,
      orders: n,
      setDealer: i
    } = qe(),
    c = a.find(m => m.name === "Kurunegala Hourglass"),
    o = c?.status === "Active" ? "approved" : c?.status === "On hold" ? "declined" : "open",
    A = a.map(m => ({
      ...m,
      revenue: n.filter(j => j.dealer === m.name).reduce((j, x) => j + x.amount, 0)
    })),
    p = Math.max(...A.map(m => m.revenue), 1);
  return <div><PageHeader eyebrow="Catalogue" title="Dealers" sub="Seven wholesale accounts across the island. Terms are set per dealer and reviewed every quarter against settlement behaviour." /><FadeIn><PanelCard title="Pending approval" sub="One application waiting on your review" action={<StatusBadge tone={o === "open" ? "alert" : "ok"}>{o === "open" ? "Action required" : o === "approved" ? "Approved" : "Declined"}</StatusBadge>}>{o === "open" ? <div className="flex flex-wrap items-end justify-between gap-6"><div><h3 className="font-display text-[24px] leading-tight font-semibold text-ink">Kurunegala Hourglass</h3><p className="mt-3 max-w-[52ch] text-[13px] leading-relaxed text-ink-2">Applied on 19 Oct with a business registration and two trade references. Requested terms: Net 14, opening order of 20 units across wrist lines.</p><div className="mt-5 flex flex-wrap gap-2"><StatusBadge tone="muted">Kurunegala</StatusBadge><StatusBadge tone="muted">Est. 2025</StatusBadge><StatusBadge tone="gold">Net 14 requested</StatusBadge></div></div><div className="flex flex-wrap gap-3"><SecondaryBtn onClick={() => i("Kurunegala Hourglass", {
              status: "On hold"
            })}>Decline</SecondaryBtn><PrimaryBtn onClick={() => i("Kurunegala Hourglass", {
              status: "Active",
              terms: "Net 14"
            })}><Icon name="check" className="h-[15px] w-[15px]" />Approve dealer</PrimaryBtn></div></div> : <EmptyNotice title={o === "approved" ? "Kurunegala Hourglass approved" : "Application declined"} body={o === "approved" ? "The dealer account is now active in Supabase with Net 14 terms." : "The dealer application has been placed on hold in Supabase."} icon={o === "approved" ? "check" : "close"} />}</PanelCard></FadeIn><FadeIn delay={.08} className="mt-8"><PanelCard title="Dealer ledger" sub="Revenue contribution in the current period" bodyClass="px-5 py-5 sm:px-6"><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[760px] border-collapse"><thead><tr className="border-b border-line">{["Dealer", "Since", "Terms", "Orders", "Revenue", "Share", "Status"].map((m, j) => <th className={cn("legend py-3 text-ink-3", j >= 3 && j <= 4 ? "text-right pr-6" : j === 6 ? "text-right" : "text-left")} key={m}>{m}</th>)}</tr></thead><tbody>{A.map(m => <tr className="border-b border-line-soft transition-colors last:border-0 hover:bg-raised/60" key={m.name}><td className="py-[15px] pr-4"><div className="text-[13.5px] text-ink">{m.name}</div><div className="legend mt-[6px] text-ink-3">{m.city}</div></td><td className="tnum py-[15px] pr-4 text-[12px] text-ink-2">{m.since}</td><td className="py-[15px] pr-4 text-[12px] text-ink-2">{m.terms}</td><td className="tnum py-[15px] pr-6 text-right text-[12.5px] text-ink-2">{n.filter(j => j.dealer === m.name).length}</td><td className="tnum py-[15px] pr-6 text-right text-[13px] font-medium text-ink">{m.revenue > 0 ? `LKR ${bt(m.revenue)}` : <span className="text-ink-3">LKR 0</span>}</td><td className="py-[15px] pr-6"><div className="w-[120px]"><MetricBar label="" value={m.revenue} max={p} sub={`${Math.round(m.revenue / Math.max(1, A.reduce((j, x) => j + x.revenue, 0)) * 100)}%`} /></div></td><td className="py-[15px] text-right"><StatusBadge tone={m.status === "Active" ? "ok" : m.status === "On hold" ? "alert" : "gold"}>{m.status}</StatusBadge></td></tr>)}</tbody></table></div><ul className="flex flex-col gap-3 lg:hidden">{A.map(m => <li className="rounded-[2px] border border-line bg-surface p-4" key={m.name}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[14px] leading-snug text-ink">{m.name}</div><div className="legend mt-2 text-ink-3">{m.city}{" · since "}{m.since}{" · "}{m.terms}</div></div><StatusBadge tone={m.status === "Active" ? "ok" : m.status === "On hold" ? "alert" : "gold"}>{m.status}</StatusBadge></div><div className="mt-4 flex items-end justify-between gap-4 border-t border-line-soft pt-3"><div><LegendText className="text-ink-3">Revenue</LegendText><div className="font-display tnum mt-1.5 text-[18px] leading-none font-semibold text-ink">{m.revenue > 0 ? `LKR ${bt(m.revenue)}` : <span className="text-ink-3">LKR 0</span>}</div></div><span className="legend text-ink-3">{n.filter(j => j.dealer === m.name).length}{" orders"}</span></div><div className="mt-3 h-[2px] w-full bg-line"><div className="h-full bg-gold" style={{
                width: `${Math.round(m.revenue / Math.max(1, A.reduce((j, x) => j + x.revenue, 0)) * 100)}%`
              }} /></div></li>)}</ul></PanelCard></FadeIn></div>;
}
function ReviewStars({
  n: a,
  className: n
}) {
  return <div className={cn("flex gap-[3px]", n)} aria-label={`${a} out of 5`}>{[1, 2, 3, 4, 5].map(i => <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" fill={i <= a ? "var(--gold)" : "none"} stroke="var(--gold)" strokeWidth="1.2" key={i}><path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 9.6l6.3-.9z" /></svg>)}</div>;
}
function AdminAnalyticsView() {
  const a = useReducedMotion(),
    {
      orders: n,
      dealers: i
    } = qe(),
    c = React.useMemo(() => fs(n), [n]),
    [o, A] = React.useState("30 days"),
    p = o === "7 days" ? c.daily.slice(-7) : c.daily,
    m = Math.max(...p.map(N => N.value), 1),
    j = p.reduce((N, k, O, R) => k.value > R[N].value ? O : N, 0),
    [x, h] = React.useState(j),
    f = p[Math.min(x, p.length - 1)],
    q = i.map(N => ({
      ...N,
      revenue: n.filter(k => k.dealer === N.name && k.status === "Completed").reduce((k, O) => k + O.amount, 0)
    })).sort((N, k) => k.revenue - N.revenue),
    y = Math.max(...q.map(N => N.revenue), 1);
  return <div><PageHeader eyebrow="Intelligence" title="Analytics" sub={`Confirmed revenue and dealer concentration from the same ledger as the Overview. Chart period: ${c.periodLabel}.`} action={<FilterRow>{["7 days", "30 days"].map(N => <SecondaryBtn active={o === N} onClick={() => {
        A(N), h(0);
      }} key={N}>{N}</SecondaryBtn>)}</FilterRow>} /><div className="grid grid-cols-2 overflow-hidden rounded-[3px] border-t border-l border-line bg-panel lg:grid-cols-4">{[["Revenue", `LKR ${bt(c.revenue)}`, "All confirmed orders"], ["Confirmed orders", String(c.count), `${n.filter(N => N.status === "Submitted").length} awaiting confirmation`], ["Average order", `LKR ${bt(c.avg)}`, "Per confirmed order"], ["Units", String(c.units), "Across confirmed orders"]].map(([N, k, O]) => <div className="border-r border-b border-line px-5 py-6 sm:px-6" key={N}><LegendText className="text-ink-3">{N}</LegendText><div className="font-display tnum mt-4 text-[clamp(1.15rem,3vw,2rem)] leading-none font-semibold text-ink">{k}</div><div className="mt-3 text-[11px] text-ink-2">{O}</div></div>)}</div><div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]"><FadeIn><PanelCard title="Daily confirmed revenue" sub={`${p[0].label} - ${p[p.length - 1].label} · tap a column to inspect`} action={<StatusBadge tone="gold">{"Peak "}{p[j].label}</StatusBadge>}><div className="mb-5 flex items-end justify-between gap-4 border-b border-line-soft pb-4"><div><LegendText className="text-ink-3">{f.label}</LegendText><div className="font-display tnum mt-2 text-[21px] leading-none font-semibold text-ink">{f.value > 0 ? `LKR ${bt(f.value)}` : "LKR 0"}</div></div><span className="legend text-ink-3">{f.value > 0 ? "Confirmed" : "No orders"}</span></div><div className="flex h-[220px] items-end gap-[3px] sm:h-[260px]">{p.map((N, k) => <button onClick={() => h(k)} aria-label={`${N.label}: LKR ${bt(N.value)}`} className="group relative flex h-full flex-1 items-end" key={N.label + k}><motion.div className={cn("w-full rounded-[1px] transition-colors duration-200", N.value === 0 ? "bg-line" : k === x ? "bg-gold" : "bg-gold/40 group-hover:bg-gold/70")} style={{
                height: 6
              }} initial={a ? !1 : {
                height: 6
              }} animate={{
                height: N.value > 0 ? `${Math.max(3, N.value / m * 100)}%` : 6
              }} transition={{
                duration: .8,
                delay: .1 + k * .012,
                ease: Ft
              }} /><div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 hidden -translate-x-1/2 rounded-[2px] border border-line bg-raised px-2 py-1 whitespace-nowrap sm:block sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"><span className="tnum text-[10px] text-gold">{j5(N.value)}</span></div></button>)}</div><div className="mt-4 flex justify-between">{[p[0], p[Math.floor((p.length - 1) / 3)], p[Math.floor((p.length - 1) * 2 / 3)], p[p.length - 1]].map(N => <span className="legend text-ink-3" key={N.label}>{N.label}</span>)}</div><RuleLine className="my-7" /><div className="grid gap-7 sm:grid-cols-2">{["Wholesale", "Website order", "Counter"].map(N => {
              const k = n.filter(O => O.channel === N && O.status === "Completed").reduce((O, R) => O + R.amount, 0);
              return <MetricBar label={`${N} channel`} value={k} max={c.revenue} sub={`LKR ${bt(k)}`} key={N} />;
            })}</div></PanelCard></FadeIn><FadeIn delay={.08}><PanelCard title="Dealer concentration" sub="Share of confirmed revenue"><div className="flex flex-col gap-6">{q.map(N => <MetricBar label={N.name} value={N.revenue} max={y} sub={N.revenue > 0 ? `LKR ${bt(N.revenue)}` : "LKR 0"} tone={N.revenue === 0 ? "muted" : "gold"} key={N.name} />)}</div><div className="mt-8 rounded-[2px] border border-gold/30 bg-gold/[0.07] px-5 py-5"><LegendText className="text-gold">Concentration risk</LegendText><p className="mt-3 text-[12.5px] leading-relaxed text-ink-2">{"One dealer accounts for "}<span className="tnum text-ink">{(y / Math.max(1, c.revenue) * 100).toFixed(1)}%</span>{" of confirmed revenue. Spreading the December allocation across three accounts would bring exposure under the 45% internal guideline."}</p></div></PanelCard></FadeIn></div><FadeIn delay={.12} className="mt-8"><PanelCard title="Units by order" sub="Every confirmed order in the period"><div className="flex flex-col gap-5">{n.filter(N => N.status === "Completed").map(N => <MetricBar label={`${N.id} · ${N.dealer}`} value={N.units} max={Math.max(1, ...n.map(k => k.units))} sub={`${N.units} units · LKR ${bt(N.amount)}`} key={N.id} />)}</div></PanelCard></FadeIn></div>;
}
function AdminCommentsView() {
  const toast = In(),
    {
      reviews: rList = [],
      setFeedbackStatus: setFbSt,
      deleteFeedback: delFb
    } = qe(),
    [a, n] = React.useState("All"),
    ratedList = rList.filter(o => o.rating > 0),
    ratedTotal = Math.max(1, ratedList.length),
    newCount = rList.filter(o => o.status === "new").length,
    i = rList.filter(o => a === "All" ? !0 : a === "New" ? o.status === "new" : a === "Read" ? o.status === "read" : a === "5" ? o.rating === 5 : o.rating > 0 && o.rating <= 3),
    c = ratedList.length ? ratedList.reduce((o, A) => o + A.rating, 0) / ratedList.length : 0,
    starBuckets = [5, 4, 3, 2, 1].map(star => [star, ratedList.filter(o => o.rating === star).length]);
  return <div><PageHeader eyebrow="Intelligence" title="Comments" sub="What dealers and visitors are saying about R.S.D. Synced live from the Contact us feedback form." /><div className="mb-8 grid grid-cols-3 overflow-hidden rounded-[3px] border-t border-l border-line bg-panel">{[["Average rating", c ? c.toFixed(1) : "–", `${ratedList.length} rated`], ["Total comments", String(rList.length), "From Contact us page"], ["Not read yet", String(newCount), newCount ? "Needs review" : "All caught up"]].map(([label, val, sub]) => <div className="border-r border-b border-line px-4 py-5 sm:px-6" key={label}><LegendText className="text-ink-3">{label}</LegendText><div className="font-display tnum mt-3 text-[clamp(1.6rem,3.4vw,2.35rem)] leading-none font-semibold text-ink">{val}</div><div className="mt-2.5 text-[11px] text-ink-3">{sub}</div></div>)}</div><div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]"><FadeIn><PanelCard title="Rating breakdown" sub={`${ratedList.length} star ${ratedList.length === 1 ? "rating" : "ratings"}`}><div className="font-display tnum text-[clamp(4.2rem,10vw,6.2rem)] leading-[0.82] font-semibold tracking-[-0.03em] text-ink">{c ? c.toFixed(1) : "–"}</div><div className="mt-5 flex items-center gap-3"><ReviewStars n={Math.round(c)} /><span className="legend text-ink-3">out of 5</span></div><RuleLine className="my-7" /><div className="flex flex-col gap-4">{starBuckets.map(([o, A]) => <div className="flex items-center gap-4" key={o}><span className="tnum w-3 text-[11px] text-ink-3">{o}</span><div className="h-[3px] flex-1 bg-line"><motion.div className="h-full bg-gold" initial={{
                  width: 0
                }} animate={{
                  width: `${ratedList.length ? Number(A) / ratedTotal * 100 : 0}%`
                }} transition={{
                  duration: .8,
                  ease: Ft
                }} /></div><span className="tnum w-4 text-right text-[11px] text-ink-2">{A}</span></div>)}</div></PanelCard></FadeIn><div><FilterRow className="mb-5">{["All", "New", "Read", "5", "Critical"].map(o => <SecondaryBtn active={a === o} onClick={() => n(o)} key={o}>{o === "5" ? "5 star only" : o === "New" ? `New (${newCount})` : o}</SecondaryBtn>)}</FilterRow><div className="flex flex-col gap-5">{i.length === 0 ? <PanelCard title="No comments in this view"><p className="text-[13px] leading-relaxed text-ink-2">{rList.length ? `Nothing matches “${a}”.` : "No comments yet. They will appear here live when someone sends feedback from the Contact us page."}</p></PanelCard> : i.map((o, A) => <FadeIn delay={Math.min(A * .05, .3)} key={o.id ?? `${o.author}-${A}`}><PanelCard className={o.status === "new" ? "border-gold/40" : ""}><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex flex-wrap items-center gap-2.5"><h3 className="text-[15px] font-semibold text-ink">{o.author}</h3>{o.status === "new" ? <StatusBadge tone="gold">New</StatusBadge> : <StatusBadge tone="muted">Read</StatusBadge>}</div><div className="legend mt-2 text-ink-3">{o.role}{o.email ? ` · ${o.email}` : ""}{o.phone ? ` · ${o.phone}` : ""}</div></div><div className="text-right">{o.rating > 0 && <ReviewStars n={o.rating} />}<div className="legend mt-2 text-ink-3">{o.time}</div></div></div><p className="mt-5 text-[13.5px] leading-[1.75] text-ink-2">{o.body}</p><div className="mt-6 flex flex-wrap gap-2"><SecondaryBtn active={o.status === "new"} onClick={async () => {
                  const next = o.status === "new" ? "read" : "new";
                  await setFbSt(o.id, next);
                  toast(next === "read" ? "Marked as read" : "Marked as new", "check");
                }}><Icon name="check" className="h-[14px] w-[14px]" />{o.status === "new" ? "Mark as read" : "Mark as new"}</SecondaryBtn>{o.email && <a href={`mailto:${o.email}`} className="legend inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[2px] border border-line px-3 py-[9px] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"><Icon name="comments" className="h-[14px] w-[14px]" />Reply by email</a>}{o.phone && <a href={`tel:${o.phone}`} className="legend inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[2px] border border-line px-3 py-[9px] text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"><Icon name="phone" className="h-[14px] w-[14px]" />Call</a>}<SecondaryBtn onClick={async () => {
                  if (window.confirm("Delete this comment?")) {
                    await delFb(o.id);
                    toast("Comment deleted", "close");
                  }
                }} className="hover:border-alert/50 hover:text-alert"><Icon name="close" className="h-[14px] w-[14px]" />Delete</SecondaryBtn></div></PanelCard></FadeIn>)}</div></div></div></div>;
}
function PrefSwitchRow({
  on: a,
  onChange: n,
  label: i,
  note: c
}) {
  return <div className="flex items-start justify-between gap-6 border-b border-line-soft py-4 last:border-0"><div><div className="text-[13.5px] text-ink">{i}</div><p className="mt-1.5 text-[12px] text-ink-3">{c}</p></div><button role="switch" aria-checked={a} aria-label={i} onClick={() => n(!a)} className={cn("relative mt-1 h-[22px] w-[42px] shrink-0 rounded-full border transition-colors duration-200", a ? "border-gold/50 bg-gold/25" : "border-line bg-line")}><motion.span className={cn("absolute top-[2px] left-[2px] h-[16px] w-[16px] rounded-full", a ? "bg-gold" : "bg-ink-3")} animate={{
        x: a ? 20 : 0
      }} transition={{
        duration: .22,
        ease: Ft
      }} /></button></div>;
}
function AdminAccountView() {
  const {
      reset: a,
      syncStatus
    } = qe(),
    {
      user: currentUser,
      logout: n
    } = Vl(),
    [i, c] = React.useState({
      name: "Admin",
      role: "Administrator",
      email: ADMIN_EMAIL,
      phone: "+94 11 244 8890",
      warehouse: "Colombo 10 — Main"
    }),
    [o, A] = React.useState(i),
    [p, m] = React.useState(!1),
    [j, x] = React.useState({
      orders: !0,
      stock: !0,
      dealers: !1,
      digest: !0
    });
  React.useEffect(() => {
    let active = true;
    requestAdminAction("getProfile")
      .then(({ profile }) => {
        if (!active || !profile) return;
        const loaded = {
          name: profile.name || "Admin",
          role: profile.role || "Administrator",
          email: profile.email || ADMIN_EMAIL,
          phone: profile.phone || "+94 11 244 8890",
          warehouse: profile.warehouse || "Colombo 10 — Main",
        };
        c(loaded);
        A(loaded);
        if (profile.prefs && typeof profile.prefs === "object") {
          x(prev => ({ ...prev, ...profile.prefs }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return <div><PageHeader eyebrow="System" title="My Account" sub="Manage administrator profile, cloud database sync, and console preferences." /><div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]"><FadeIn><PanelCard title="Profile" sub="Details shown on invoices and dealer correspondence"><form className="flex flex-col gap-5" onSubmit={async h => {
            h.preventDefault(), c(o);
            try {
              await requestAdminAction("saveProfile", { profile: { ...o, prefs: j } });
            } catch {}
            m(!0), setTimeout(() => m(!1), 2600);
          }}><div className="grid gap-5 sm:grid-cols-2">{[["Full name", "name", "text"], ["Role", "role", "text"], ["Email", "email", "email"], ["Phone", "phone", "tel"]].map(([h, f, q]) => <label className="block" key={h}><LegendText className="text-ink-3">{h}</LegendText><input type={q} value={o[f]} onChange={y => A({
                  ...o,
                  [f]: y.target.value
                })} className="mt-3 w-full rounded-[2px] border border-line bg-surface px-3 py-[11px] text-[13px] text-ink focus:border-gold/50" /></label>)}</div><label className="block"><LegendText className="text-ink-3">Warehouse</LegendText><select value={o.warehouse} onChange={h => A({
                ...o,
                warehouse: h.target.value
              })} className="mt-3 w-full rounded-[2px] border border-line bg-surface px-3 py-[11px] text-[13px] text-ink focus:border-gold/50"><option>Colombo 10 — Main</option><option>Kandy — Regional</option><option>Galle — Regional</option></select></label><div className="flex flex-wrap items-center gap-4 pt-2"><PrimaryBtn type="submit">{p ? <Icon name="check" className="h-[15px] w-[15px]" /> : null}{p ? "Saved" : "Save changes"}</PrimaryBtn><SecondaryBtn onClick={() => {
                A(i), m(!1);
              }}>Discard</SecondaryBtn>{p && <span className="legend text-ok">Saved to Supabase</span>}</div></form></PanelCard></FadeIn><div className="flex flex-col gap-8"><FadeIn delay={.08}><PanelCard title="Notification preferences" sub="Cloud preferences for this console"><PrefSwitchRow on={j.orders} onChange={h => x({
              ...j,
              orders: h
            })} label="New orders" note="Every confirmed order placed by a dealer." /><PrefSwitchRow on={j.stock} onChange={h => x({
              ...j,
              stock: h
            })} label="Low stock alerts" note="When a SKU drops below its reorder point." /><PrefSwitchRow on={j.dealers} onChange={h => x({
              ...j,
              dealers: h
            })} label="Dealer applications" note="New accounts waiting for approval." /><PrefSwitchRow on={j.digest} onChange={h => x({
              ...j,
              digest: h
            })} label="Weekly digest" note="Monday morning summary of revenue and pipeline." /></PanelCard></FadeIn><FadeIn delay={.14}><PanelCard title="Supabase cloud ledger" sub="Dealer portal and admin console share live cloud data"><p className="text-[13px] leading-relaxed text-ink-2">Orders, inventory, and dealer approvals are stored in Supabase Postgres with live Realtime sync across devices. Resetting restores the baseline sample ledger.</p><SecondaryBtn className="mt-5 w-full justify-center" onClick={() => {
              window.confirm("Reset the Supabase cloud ledger back to the baseline sample data?") && a();
            }}><Icon name="alert" className="h-[14px] w-[14px]" />Reset cloud ledger to sample data</SecondaryBtn></PanelCard></FadeIn><FadeIn delay={.18}><PanelCard title="Session" sub="Security and database connection"><div className="flex flex-col gap-4">{[["Account", currentUser?.email || "admin@rsd.com"], ["Database", syncStatus === "live" ? "Supabase Postgres · Live" : syncStatus === "connecting" ? "Connecting to Supabase…" : "Offline cache"], ["Sign-in mode", "Server session + Supabase sync"]].map(([h, f]) => <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-3 last:border-0" key={h}><span className="legend text-ink-3">{h}</span><span className="text-[12.5px] text-ink">{f}</span></div>)}</div><SecondaryBtn className="mt-6 w-full justify-center" onClick={n}>Sign out</SecondaryBtn></PanelCard></FadeIn></div></div></div>;
}
function RsdPremiumWatchesApp() {
  return <AuthProvider><StoreProvider><ToastProvider><AppRouterShell /></ToastProvider></StoreProvider></AuthProvider>;
}
function AdminLoadingScreen() {
  return <main className="admin-loading-screen"><BrandClockLogo size={52} /><span className="store-eyebrow">R.S.D. PRIVATE ADMINISTRATION</span><p>Verifying your secure session…</p></main>;
}
function AdminRedirect() {
  React.useEffect(() => {
    window.location.replace("/admin");
  }, []);
  return <AdminLoadingScreen />;
}
function AppRouterShell() {
  const { user: a, authReady } = Vl();
  const adminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const adminLoginRoute = typeof window !== "undefined" && /^\/admin\/login\/?$/.test(window.location.pathname);
  const [n, i] = React.useState("overview");
  const [c, o] = React.useState(() => {
    try {
      return localStorage.getItem("rsd-theme") || "dark";
    } catch {
      return "dark";
    }
  });
  const A = D5();
  const p = useReducedMotion();
  React.useEffect(() => {
    try {
      localStorage.setItem("rsd-theme", c);
    } catch {}
  }, [c]);
  React.useEffect(() => {
    if (!a) i("overview");
  }, [a]);
  React.useEffect(() => {
    document.documentElement.classList.toggle("light", c === "light");
    document.documentElement.style.colorScheme = c;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", c === "light" ? "#f6f2e9" : "#0d0d0c");
  }, [c]);
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: p ? "auto" : "smooth" });
  }, [n, p]);

  if (!adminRoute) return <PublicCatalog theme={c} setTheme={o} />;
  if (!authReady) return <AdminLoadingScreen />;
  if (!a) return <LoginScreen />;
  if (adminLoginRoute) return <AdminRedirect />;
  return A ? <div className="min-h-screen overflow-x-hidden bg-surface text-ink"><aside className="fixed top-0 bottom-0 left-0 z-40 hidden w-[268px] border-r border-line lg:block"><DesktopSidebar view={n} onNavigate={i} theme={c} setTheme={o} /></aside><div className="flex min-w-0 flex-col lg:pl-[268px]"><DesktopHeader view={n} onNavigate={i} theme={c} setTheme={o} menuOpen={!1} setMenuOpen={() => {}} /><main className="flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-10"><AnimatePresence mode="wait"><motion.div initial={p ? !1 : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={p ? void 0 : { opacity: 0, y: -10 }} transition={{ duration: .36, ease: Ft }} key={n}>{n === "overview" && <AdminOverviewView onNavigate={i} />}{n === "orders" && <AdminOrdersView onNavigate={i} />}{n === "bills" && <AdminBillsView />}{n === "products" && <AdminProductsView onNavigate={i} />}{n === "new-product" && <AdminAddProductView onNavigate={i} />}{n === "dealers" && <AdminDealersView />}{n === "analytics" && <AdminAnalyticsView />}{n === "comments" && <AdminCommentsView />}{(n === "account" || n === "more") && <AdminAccountView />}</motion.div></AnimatePresence></main><footer className="border-t border-line px-5 py-7 sm:px-8 lg:px-10"><div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3"><p className="legend text-ink-3">R.S.D. Premium Watches · Private administrator console</p><p className="legend text-ink-3">Live Supabase ledger · Secure session</p></div></footer></div></div> : <MobileShellRoot view={n} onNavigate={i} theme={c} setTheme={o} />;
}
export default RsdPremiumWatchesApp;
