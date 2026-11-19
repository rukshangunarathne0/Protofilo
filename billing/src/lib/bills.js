const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function plain(value, fallback = "") {
  return String(value ?? fallback)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00D7/g, "x")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .trim();
}

function number(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function hasNumber(value) {
  return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
}

function money(value, blankWhenZero = false) {
  if (blankWhenZero && !number(value)) return "LKR -";
  return `LKR ${Math.round(number(value)).toLocaleString("en-US")}`;
}

function displayDate(value) {
  if (!value) return "";
  const raw = String(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return raw;
}

function itemAmount(item) {
  return number(item?.price) * Math.max(1, number(item?.qty) || 1);
}

function totals(bill) {
  const items = Array.isArray(bill?.items) ? bill.items : [];
  const subtotal = items.reduce((sum, item) => sum + itemAmount(item), 0);
  const deliveryCharge = number(bill?.deliveryCharge);
  const deliverySaving = number(bill?.deliverySaving);
  return {
    subtotal,
    deliveryCharge,
    deliverySaving,
    total: Math.max(0, subtotal + deliveryCharge - deliverySaving),
    hasPrice: items.some(item => hasNumber(item?.price) && number(item.price) > 0),
  };
}

function drawText(doc, value, x, y, width, size = 9, lineHeight = 4.6, color = [35, 35, 35]) {
  const text = plain(value);
  if (!text) return y;
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function drawRule(doc, y, color = [218, 214, 205]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.25);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
}

function sectionTitle(doc, title, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(157, 119, 28);
  doc.text(plain(title).toUpperCase(), MARGIN, y);
  return y + 5;
}

function field(doc, label, value, x, y, width, height = 12) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(122, 119, 113);
  doc.text(plain(label).toUpperCase(), x, y);
  doc.setFontSize(9.2);
  doc.setTextColor(35, 35, 35);
  const lines = doc.splitTextToSize(plain(value), width - 2);
  if (lines.length) doc.text(lines.slice(0, 2), x, y + 5);
  doc.setDrawColor(218, 214, 205);
  doc.setLineWidth(0.25);
  doc.line(x, y + height, x + width, y + height);
}

function lineBlock(doc, label, value, y, width = CONTENT_WIDTH) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(70, 68, 64);
  doc.text(`${plain(label)}:`, MARGIN, y);
  return drawText(doc, value, MARGIN + 28, y, width - 28, 8.2, 4.3);
}

function addHeader(doc, bill, mode) {
  doc.setFillColor(18, 18, 17);
  doc.rect(0, 0, PAGE_WIDTH, 11, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 19);
  doc.text("R.S.D.", MARGIN, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(118, 114, 106);
  doc.text("PREMIUM WATCHES", MARGIN, 29);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 19);
  doc.text(mode === "courier" ? "COURIER COPY" : "BILL / RECEIPT", PAGE_WIDTH - MARGIN, 23, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(105, 101, 94);
  doc.text(`Bill No: ${plain(bill.billNo)}`, PAGE_WIDTH - MARGIN, 29, { align: "right" });
  doc.text(`Date: ${displayDate(bill.date)}`, PAGE_WIDTH - MARGIN, 34, { align: "right" });
  drawRule(doc, 42);
  return 52;
}

function saveName(bill, mode) {
  const base = plain(bill.billNo, "RSD-bill").replace(/[^A-Za-z0-9_-]+/g, "-") || "RSD-bill";
  return `${base}-${mode === "courier" ? "courier" : "receipt"}.pdf`;
}

export async function downloadBillPdf(bill, mode = "receipt") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  let y = addHeader(doc, bill, mode);
  const customerName = bill.customerName || "";
  const customerPhone = bill.customerPhone || "";
  const address = bill.deliveryAddress || "";
  const t = totals(bill);
  const items = Array.isArray(bill.items) ? bill.items : [];

  y = sectionTitle(doc, mode === "courier" ? "Receiver" : "Customer", y);
  field(doc, "Name", customerName, MARGIN, y, 108);
  field(doc, "Phone", customerPhone, 132, y, 60);
  y += 18;
  field(doc, "Delivery address", address, MARGIN, y, CONTENT_WIDTH, 17);
  y += 24;

  y = sectionTitle(doc, "Items", y);
  doc.setFillColor(243, 240, 233);
  doc.rect(MARGIN, y - 3, CONTENT_WIDTH, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(105, 101, 94);
  doc.text("ITEM", MARGIN + 2, y + 2);
  doc.text("COLOUR", MARGIN + 96, y + 2);
  doc.text("QTY", MARGIN + 135, y + 2);
  if (mode !== "courier") doc.text("AMOUNT", PAGE_WIDTH - MARGIN - 2, y + 2, { align: "right" });
  y += 10;
  doc.setFont("helvetica", "normal");
  items.forEach((item, index) => {
    const name = `${index + 1}. ${plain(item?.name)}`;
    const colour = plain(item?.colour || item?.color);
    const qty = Math.max(1, number(item?.qty) || 1);
    const nameLines = doc.splitTextToSize(name, 88);
    const rowHeight = Math.max(8, nameLines.length * 4.2 + 3);
    doc.setFontSize(8.4);
    doc.setTextColor(35, 35, 35);
    doc.text(nameLines, MARGIN + 2, y);
    doc.text(doc.splitTextToSize(colour, 34), MARGIN + 96, y);
    doc.text(String(qty), MARGIN + 137, y);
    if (mode !== "courier") doc.text(t.hasPrice ? money(itemAmount(item)) : "", PAGE_WIDTH - MARGIN - 2, y, { align: "right" });
    doc.setDrawColor(232, 228, 220);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y + rowHeight - 3, PAGE_WIDTH - MARGIN, y + rowHeight - 3);
    y += rowHeight;
  });
  if (!items.length) {
    doc.setFontSize(8.4);
    doc.setTextColor(120, 116, 109);
    doc.text("", MARGIN + 2, y);
    y += 8;
  }

  if (mode !== "courier") {
    y += 4;
    y = lineBlock(doc, "Subtotal", t.hasPrice ? money(t.subtotal) : "", y);
    y = lineBlock(doc, "Delivery", bill.deliveryLabel || (t.deliveryCharge ? money(t.deliveryCharge) : "FREE"), y + 1);
    if (t.deliverySaving > 0) y = lineBlock(doc, "Saving", `- ${money(t.deliverySaving)}`, y + 1);
    doc.setFillColor(18, 18, 17);
    doc.rect(MARGIN, y + 1, CONTENT_WIDTH, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL", MARGIN + 3, y + 9);
    doc.text(t.hasPrice ? money(t.total) : "", PAGE_WIDTH - MARGIN - 3, y + 9, { align: "right" });
    y += 21;

    y = sectionTitle(doc, "Payment", y);
    field(doc, "Method", bill.paymentMethod, MARGIN, y, 55);
    field(doc, "Status", bill.paymentStatus, 78, y, 44);
    field(doc, "Paid on", displayDate(bill.paymentDate), 132, y, 60);
    y += 18;
    field(doc, "Reference", bill.paymentReference, MARGIN, y, CONTENT_WIDTH);
    y += 22;
  }

  y = sectionTitle(doc, "Delivery", y);
  field(doc, "Courier", bill.courier, MARGIN, y, 55);
  field(doc, "Tracking", bill.tracking, 78, y, 55);
  field(doc, "Expected", displayDate(bill.expectedDate), 138, y, 54);
  y += 18;
  field(doc, "Pickup place", bill.pickupPlace, MARGIN, y, 84);
  field(doc, "Delivery place", bill.deliveryPlace, 108, y, 84);
  y += 22;

  if (mode === "courier") {
    y = sectionTitle(doc, "Parcel", y);
    field(doc, "Amount / COD", bill.courierAmount || "", MARGIN, y, 84);
    field(doc, "Notes", bill.courierNotes || "", 108, y, 84, 17);
    y += 24;
  } else {
    y = sectionTitle(doc, "Warranty", y);
    y = lineBlock(doc, "Term", bill.warrantyTerm, y);
    y = lineBlock(doc, "Covers", bill.warrantyCovers, y + 1);
    y = lineBlock(doc, "Does not cover", bill.warrantyExclusions, y + 1);
    y = lineBlock(doc, "Claim", bill.warrantyClaim, y + 1);
    y += 5;
    y = sectionTitle(doc, "Returns", y);
    y = drawText(doc, bill.returnsPolicy, MARGIN, y, CONTENT_WIDTH, 8.2, 4.4, [70, 68, 64]);
    y += 8;
  }

  if (y > PAGE_HEIGHT - 28) {
    doc.addPage();
    y = 24;
  }
  drawRule(doc, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(157, 119, 28);
  doc.text("Thank you for ordering from R.S.D.!", MARGIN, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 116, 109);
  doc.text("R.S.D. Premium Watches · WhatsApp 0711368623", MARGIN, y + 15);
  doc.save(saveName(bill, mode));
}

export { totals as calculateBillTotals, displayDate as formatBillDate };
