import * as React from "react";
import { createRoot } from "react-dom/client";
import { calculateBillTotals, downloadBillPdf, formatBillDate } from "./lib/bills.js";
import "./styles.css";

const CLAIM_PHONE = "0711368623";
const DEFAULT_WARRANTY = "1-year colour warranty, starting from the delivery date.";
const DEFAULT_EXCLUSIONS = "Damage, water, misuse, and normal wear.";

function blankBill(number = "RSD-0001") {
  return {
    billNo: number,
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
    warrantyTerm: DEFAULT_WARRANTY,
    warrantyCovers: "",
    warrantyExclusions: DEFAULT_EXCLUSIONS,
    warrantyClaim: `To claim, message ${CLAIM_PHONE} with this bill and photos.`,
    returnsPolicy: "",
  };
}

function nextBillNumber() {
  try {
    const stored = Number.parseInt(localStorage.getItem("rsd-next-bill-number") || "1", 10);
    const value = Number.isFinite(stored) && stored > 0 ? stored : 1;
    return `RSD-${String(value).padStart(4, "0")}`;
  } catch {
    return "RSD-0001";
  }
}

function rememberBillNumber(value) {
  const match = String(value || "").match(/^RSD-(\d+)$/i);
  if (!match) return;
  try {
    const used = Number.parseInt(match[1], 10);
    const current = Number.parseInt(localStorage.getItem("rsd-next-bill-number") || "1", 10);
    if (Number.isFinite(used) && used >= current) localStorage.setItem("rsd-next-bill-number", String(used + 1));
  } catch {}
}

function numeric(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function money(value) {
  return `LKR ${Math.round(numeric(value)).toLocaleString("en-US")}`;
}

function api(path, options = {}) {
  return fetch(path, {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  }).then(async response => {
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) throw new Error(result.error || "Request failed.");
    return result;
  });
}

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? "brand-compact" : ""}`}><img src="/rsd-logo.png" alt="" /><span><strong>R.S.D.</strong><small>PREMIUM WATCHES</small></span></div>;
}

function Login({ onSignedIn }) {
  const [email, setEmail] = React.useState("admin@rsd.com");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin-login", { method: "POST", body: JSON.stringify({ email, password }) });
      onSignedIn();
    } catch (err) {
      setError(err.message || "Invalid administrator credentials.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-screen"><div className="login-card"><Brand /><p className="eyebrow">PRIVATE BILLING WORKSPACE</p><h1>Create customer and courier bills.</h1><p className="login-copy">This separate workspace uses the same R.S.D. orders and catalogue database without loading billing code on the public shop.</p><form onSubmit={submit} className="login-form"><label><span>Email</span><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" required /></label><label><span>Password</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <div className="error-box">{error}</div>}<button className="button button-primary button-wide" disabled={busy}>{busy ? "Signing in…" : "Open billing workspace"}</button></form><p className="login-foot">Administrator access only · secure server session</p></div></main>;
}

function Field({ label, value, onChange, type = "text", placeholder = "", min, step, className = "" }) {
  return <label className={`field ${className}`}><span>{label}</span><input type={type} value={value ?? ""} onChange={event => onChange(event.target.value)} placeholder={placeholder} min={min} step={step} /></label>;
}

function TextArea({ label, value, onChange, placeholder = "", className = "" }) {
  return <label className={`field ${className}`}><span>{label}</span><textarea value={value ?? ""} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function Value({ value }) {
  return <span className={!value && value !== 0 ? "blank" : ""}>{value || value === 0 ? value : "Blank"}</span>;
}

function Preview({ bill, mode }) {
  const courier = mode === "courier";
  const totals = calculateBillTotals(bill);
  return <article className="preview" aria-label={courier ? "Courier bill preview" : "Customer bill preview"}>
    <header className="preview-header"><div><div className="preview-brand">R.S.D.</div><div className="preview-subbrand">PREMIUM WATCHES</div></div><div className="preview-title"><strong>{courier ? "COURIER COPY" : "BILL / RECEIPT"}</strong><span>Bill No: <Value value={bill.billNo} /></span><span>Date: <Value value={formatBillDate(bill.date)} /></span></div></header>
    <section className="preview-section preview-customer"><div><small>{courier ? "RECEIVER" : "CUSTOMER"}</small><Value value={bill.customerName} /></div><div><small>PHONE</small><Value value={bill.customerPhone} /></div><div className="preview-wide"><small>DELIVERY ADDRESS</small><Value value={bill.deliveryAddress} /></div></section>
    <section className="preview-section"><small className="section-label">ITEMS</small><div className="preview-items"><div className="preview-item preview-item-head"><span>Item</span><span>Colour</span><span>Qty</span>{!courier && <span>Amount</span>}</div>{(bill.items || []).map((item, index) => <div className="preview-item" key={`${item.sku || item.name || "item"}-${index}`}><span>{index + 1}. <Value value={item.name} /></span><span><Value value={item.colour} /></span><span>{item.qty || 1}</span>{!courier && <span>{totals.hasPrice ? money(numeric(item.price) * (numeric(item.qty) || 1)) : "—"}</span>}</div>)}</div></section>
    {!courier && <><section className="preview-totals"><div><span>Subtotal</span><strong>{totals.hasPrice ? money(totals.subtotal) : "—"}</strong></div><div><span>Delivery</span><strong>{bill.deliveryLabel || (totals.deliveryCharge ? money(totals.deliveryCharge) : "FREE")}</strong></div>{totals.deliverySaving > 0 && <div><span>Multi-item saving</span><strong>- {money(totals.deliverySaving)}</strong></div>}<div className="preview-total"><span>TOTAL</span><strong>{totals.hasPrice ? money(totals.total) : "—"}</strong></div></section><section className="preview-grid"><div><small>PAYMENT METHOD</small><Value value={bill.paymentMethod} /></div><div><small>STATUS</small><Value value={bill.paymentStatus} /></div><div><small>PAID ON</small><Value value={formatBillDate(bill.paymentDate)} /></div><div className="preview-wide"><small>REFERENCE</small><Value value={bill.paymentReference} /></div></section></>}
    <section className="preview-section"><small className="section-label">DELIVERY</small><div className="preview-grid"><div><small>COURIER</small><Value value={bill.courier} /></div><div><small>TRACKING</small><Value value={bill.tracking} /></div><div><small>EXPECTED</small><Value value={formatBillDate(bill.expectedDate)} /></div><div><small>PICKUP PLACE</small><Value value={bill.pickupPlace} /></div><div><small>DELIVERY PLACE</small><Value value={bill.deliveryPlace} /></div></div></section>
    {courier ? <section className="preview-grid preview-section"><div><small>AMOUNT / COD</small><Value value={bill.courierAmount} /></div><div><small>PARCEL NOTES</small><Value value={bill.courierNotes} /></div></section> : <><section className="preview-section preview-copy"><small className="section-label">WARRANTY</small><p><b>Term:</b> <Value value={bill.warrantyTerm} /></p><p><b>Covers:</b> <Value value={bill.warrantyCovers} /></p><p><b>Does not cover:</b> <Value value={bill.warrantyExclusions} /></p><p><b>To claim:</b> <Value value={bill.warrantyClaim} /></p></section><section className="preview-section preview-copy"><small className="section-label">RETURNS / REFUND POLICY</small><p><Value value={bill.returnsPolicy} /></p></section></>}
    <footer className="preview-footer"><strong>Thank you for ordering from R.S.D.!</strong><span>R.S.D. Premium Watches · WhatsApp {CLAIM_PHONE}</span></footer>
  </article>;
}

function Workspace({ onSignOut }) {
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [bill, setBill] = React.useState(() => blankBill(nextBillNumber()));
  const [sourceOrder, setSourceOrder] = React.useState("");
  const [mode, setMode] = React.useState("receipt");
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");

  const totals = React.useMemo(() => calculateBillTotals(bill), [bill]);
  const showNotice = React.useCallback(text => {
    setNotice(text);
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(() => setNotice(""), 3400);
  }, []);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api("/api/billing-data");
      setProducts(Array.isArray(result.products) ? result.products : []);
      setOrders(Array.isArray(result.orders) ? result.orders : []);
    } catch (err) {
      setError(err.message || "Could not load live catalogue and orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const update = React.useCallback(patch => setBill(previous => ({ ...previous, ...patch })), []);

  const applyOrder = React.useCallback(order => {
    if (!order) return;
    const lines = Array.isArray(order.lines) ? order.lines.map(line => ({
      sku: line.sku || "",
      name: line.name || "",
      colour: line.colour || line.color || line.colour_name || "",
      qty: Math.max(1, numeric(line.qty) || 1),
      price: line.price ?? "",
    })) : [];
    setSourceOrder(order.id || "");
    setBill(previous => ({
      ...previous,
      customerName: order.customer_name || order.customerName || order.dealer || "",
      customerPhone: order.customer_phone || order.customerPhone || order.phone || "",
      deliveryAddress: order.delivery_address || order.deliveryAddress || order.address || "",
      date: order.date || previous.date,
      deliveryPlace: order.city || "",
      deliveryLabel: order.delivery || "FREE",
      paymentReference: order.reference || "",
      paymentStatus: order.status === "Completed" ? "PAID" : previous.paymentStatus,
      items: lines.length ? lines : previous.items,
    }));
    showNotice(`Loaded details from ${order.id}`);
  }, [showNotice]);

  React.useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("order");
    if (requested && orders.length) applyOrder(orders.find(order => order.id === requested));
  }, [orders, applyOrder]);

  function resetBill() {
    setSourceOrder("");
    setBill(blankBill(nextBillNumber()));
    showNotice("Started a new blank bill");
  }

  function updateItem(index, patch) {
    setBill(previous => ({ ...previous, items: previous.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  }

  function chooseProduct(index, sku) {
    const product = products.find(item => item.sku === sku);
    updateItem(index, product ? { sku, name: product.name, price: product.price, colour: product.colors?.[0] || "" } : { sku: "" });
  }

  function addItem() {
    update({ items: [...bill.items, { sku: "", name: "", colour: "", qty: 1, price: "" }] });
  }

  function removeItem(index) {
    if (bill.items.length === 1) return;
    update({ items: bill.items.filter((_, itemIndex) => itemIndex !== index) });
  }

  async function makePdf(pdfMode) {
    setBusy(true);
    try {
      rememberBillNumber(bill.billNo);
      await downloadBillPdf(bill, pdfMode);
      showNotice(`${pdfMode === "courier" ? "Courier copy" : "Customer receipt"} PDF downloaded`);
    } catch {
      showNotice("The PDF could not be generated in this browser");
    } finally {
      setBusy(false);
    }
  }

  return <div className="workspace"><header className="topbar"><Brand compact /><div className="topbar-right"><span className="live-pill">● LIVE DATABASE</span><button className="button button-quiet" onClick={onSignOut}>Sign out</button></div></header><main className="page"><div className="page-heading"><div><p className="eyebrow">OPERATIONS · SEPARATE WEB</p><h1>Bill / Receipt</h1><p className="lede">Create a customer receipt or a price-free courier copy from the live R.S.D. catalogue and order ledger.</p></div><div className="heading-actions"><button className="button button-secondary" onClick={resetBill}>＋ New bill</button><button className="button button-primary" onClick={() => makePdf(mode)} disabled={busy || loading}>{busy ? "Generating…" : `Download ${mode === "courier" ? "courier" : "receipt"} PDF`}</button></div></div>{notice && <div className="notice">{notice}</div>}{error && <div className="error-box data-error">{error}<button onClick={loadData}>Retry</button></div>}<div className="layout"><section className="editor"><div className="card"><div className="card-heading"><div><h2>Bill details</h2><p>Everything remains editable before you download.</p></div></div><div className="section"><label className="field"><span>Start from an existing order</span><select value={sourceOrder} onChange={event => { setSourceOrder(event.target.value); applyOrder(orders.find(order => order.id === event.target.value)); }}><option value="">Blank bill</option>{orders.map(order => <option value={order.id} key={order.id}>{order.id} · {order.dealer || "Customer"} · {money(order.amount)}</option>)}</select></label><p className="hint">Order and catalogue information is loaded from the same Supabase-backed ledger as the main site. Phone and address stay blank unless stored on the order.</p></div><div className="section"><div className="section-title">Customer and bill</div><div className="form-grid two"><Field label="Bill number" value={bill.billNo} onChange={value => update({ billNo: value })} placeholder="RSD-0001" /><Field label="Date" value={bill.date} onChange={value => update({ date: value })} type="date" /><Field label="Customer name" value={bill.customerName} onChange={value => update({ customerName: value })} /><Field label="Phone" value={bill.customerPhone} onChange={value => update({ customerPhone: value })} type="tel" /><TextArea label="Full delivery address" value={bill.deliveryAddress} onChange={value => update({ deliveryAddress: value })} className="wide" /></div></div><div className="section"><div className="section-title-row"><div className="section-title">Items</div><button className="text-button" onClick={addItem}>＋ Add item</button></div><div className="item-editor">{bill.items.map((item, index) => <div className="item-row" key={`${item.sku}-${index}`}><div className="item-number">{index + 1}</div><div className="item-fields"><label className="field"><span>Catalogue product</span><select value={item.sku} onChange={event => chooseProduct(index, event.target.value)}><option value="">Manual item / choose product</option>{products.map(product => <option value={product.sku} key={product.sku}>{product.sku} · {product.name}</option>)}</select></label><Field label="Watch model" value={item.name} onChange={value => updateItem(index, { name: value })} /><Field label="Colour" value={item.colour} onChange={value => updateItem(index, { colour: value })} /><Field label="Quantity" value={item.qty} onChange={value => updateItem(index, { qty: value })} type="number" min="1" step="1" /><Field label="Public price" value={item.price} onChange={value => updateItem(index, { price: value })} type="number" min="0" step="1" /></div><button className="remove-button" onClick={() => removeItem(index)} disabled={bill.items.length === 1} aria-label={`Remove item ${index + 1}`}>×</button></div>)}</div></div><div className="section"><div className="section-title">Totals and payment</div><div className="form-grid two"><Field label="Delivery line" value={bill.deliveryLabel} onChange={value => update({ deliveryLabel: value })} placeholder="FREE" /><Field label="Delivery charge" value={bill.deliveryCharge} onChange={value => update({ deliveryCharge: value })} type="number" min="0" step="1" placeholder="0" /><Field label="Multi-item saving / discount" value={bill.deliverySaving} onChange={value => update({ deliverySaving: value })} type="number" min="0" step="1" placeholder="0" /><div className="calculated"><span>Calculated total</span><strong>{totals.hasPrice ? money(totals.total) : "Add public prices"}</strong></div><Field label="Payment method" value={bill.paymentMethod} onChange={value => update({ paymentMethod: value })} /><Field label="Payment status" value={bill.paymentStatus} onChange={value => update({ paymentStatus: value })} /><Field label="Paid date" value={bill.paymentDate} onChange={value => update({ paymentDate: value })} type="date" /><Field label="Payment reference" value={bill.paymentReference} onChange={value => update({ paymentReference: value })} /></div></div><div className="section"><div className="section-title">Delivery and courier</div><div className="form-grid two"><Field label="Courier name" value={bill.courier} onChange={value => update({ courier: value })} placeholder="Leave blank until entered" /><Field label="Tracking number" value={bill.tracking} onChange={value => update({ tracking: value })} placeholder="Leave blank until entered" /><Field label="Expected delivery date" value={bill.expectedDate} onChange={value => update({ expectedDate: value })} type="date" /><Field label="Courier amount / COD" value={bill.courierAmount} onChange={value => update({ courierAmount: value })} type="number" min="0" step="1" placeholder="Leave blank until entered" /><Field label="Pickup place" value={bill.pickupPlace} onChange={value => update({ pickupPlace: value })} placeholder="Leave blank until entered" /><Field label="Delivery place" value={bill.deliveryPlace} onChange={value => update({ deliveryPlace: value })} placeholder="Leave blank until entered" /><TextArea label="Courier notes" value={bill.courierNotes} onChange={value => update({ courierNotes: value })} placeholder="Parcel notes" className="wide" /></div><p className="hint">Courier price, dates, and places are intentionally blank until you supply them. The courier PDF hides customer prices and payment details.</p></div><div className="section"><div className="section-title">Warranty, returns, and closing</div><div className="form-grid two"><TextArea label="Warranty start and term" value={bill.warrantyTerm} onChange={value => update({ warrantyTerm: value })} /><TextArea label="Warranty coverage" value={bill.warrantyCovers} onChange={value => update({ warrantyCovers: value })} placeholder="What is covered" /><TextArea label="Warranty exclusions" value={bill.warrantyExclusions} onChange={value => update({ warrantyExclusions: value })} /><TextArea label="WhatsApp warranty claim instructions" value={bill.warrantyClaim} onChange={value => update({ warrantyClaim: value })} /><TextArea label="Returns and refund policy" value={bill.returnsPolicy} onChange={value => update({ returnsPolicy: value })} className="wide" /></div><p className="hint">Default WhatsApp claim number: {CLAIM_PHONE}. You can change it in the claim text above.</p></div></div></section><aside className="preview-column"><div className="card preview-card"><div className="card-heading preview-heading"><div><h2>Live preview</h2><p>Customer and courier output</p></div><div className="mode-switch"><button className={mode === "receipt" ? "active" : ""} onClick={() => setMode("receipt")}>Receipt</button><button className={mode === "courier" ? "active" : ""} onClick={() => setMode("courier")}>Courier</button></div></div><Preview bill={bill} mode={mode} /></div><div className="card download-card"><h2>Download documents</h2><p>PDF generation runs only in this separate workspace, so the main public shop stays lighter.</p><div className="download-buttons"><button className="button button-primary" onClick={() => makePdf("receipt")} disabled={busy}>{busy ? "Generating…" : "Customer receipt PDF"}</button><button className="button button-secondary" onClick={() => makePdf("courier")} disabled={busy}>Courier copy PDF</button></div></div></aside></div></main></div>;
}

function App() {
  const [auth, setAuth] = React.useState("checking");
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    api("/api/admin-session").then(result => setAuth(result.authenticated ? "signed-in" : "signed-out")).catch(() => setAuth("signed-out"));
  }, [version]);

  async function signOut() {
    await api("/api/admin-logout", { method: "POST" }).catch(() => {});
    setAuth("signed-out");
  }

  if (auth === "checking") return <main className="loading-screen"><Brand /><p>Checking secure session…</p></main>;
  if (auth === "signed-out") return <Login onSignedIn={() => { setAuth("checking"); setVersion(value => value + 1); }} />;
  return <Workspace onSignOut={signOut} />;
}

createRoot(document.getElementById("root")).render(<App />);
