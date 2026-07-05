import { jsPDF } from 'jspdf';

/**
 * Company Metadata for Zanzibar Trip & Relax
 */
const COMPANY_INFO = {
  name: 'Zanzibar Trip & Relax Ltd.',
  address: 'Kenyatta Road, Stone Town, Zanzibar, Tanzania',
  phone: '+255 629 506 063',
  email: 'info@zanzibartripandrelax.com',
  web: 'www.zanzibartripandrelax.com',
  emergency: '+255 629 506 063 (WhatsApp / Call 24/7)',
  licence: 'Tanzania Tourism Registry (TALA No. 98112-ZRT)'
};

/**
 * Helper to draw a sleek, modern, color-themed executive header
 */
function drawPageHeader(doc: jsPDF, title: string) {
  // Dark blue primary color band
  doc.setFillColor(11, 59, 140); // Hex #0B3B8C
  doc.rect(0, 0, 220, 32, 'F');

  // Gold accent accent bar
  doc.setFillColor(212, 160, 23); // Hex #D4A017
  doc.rect(0, 32, 220, 3, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ZANZIBAR TRIP & RELAX', 15, 14);

  // Brand Slogan
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Your Ethical Swahili Paradise & Safari Specialists', 15, 24);

  // Document Title Badge
  doc.setFillColor(212, 160, 23); // Gold background for title
  doc.rect(130, 8, 70, 16, 'F');
  doc.setTextColor(11, 59, 140); // Dark text on gold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title.toUpperCase(), 165, 18, { align: 'center' });

  // Company contact text on private margins
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${COMPANY_INFO.address}`, 15, 43);
  doc.text(`Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email} | Web: ${COMPANY_INFO.web}`, 15, 48);
  doc.text(`Licence: ${COMPANY_INFO.licence}`, 15, 53);

  // Horizontal separating line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, 58, 195, 58);
}

/**
 * Drawing footer
 */
function drawPageFooter(doc: jsPDF, pageNum = 1, pageCount = 1) {
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, 275, 195, 275);

  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text(`24/7 Helpline: ${COMPANY_INFO.emergency}`, 15, 281);
  doc.text('Thank you for exploring Zanzibar ethically with us. Swahili hospitality at its finest.', 15, 285);
  doc.text(`Page ${pageNum} of ${pageCount}`, 195, 281, { align: 'right' });
}

/**
 * Draw a structured table row helper
 */
function drawTableRow(doc: jsPDF, y: number, label: string, value: string, isHeader = false) {
  if (isHeader) {
    doc.setFillColor(240, 243, 248);
    doc.rect(15, y, 180, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 59, 140);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
  }
  doc.setFontSize(8.5);
  doc.text(label, 18, y + 5);
  doc.text(value, 110, y + 5);
}

/**
 * 1. Generate downloadable Booking Confirmation PDF
 */
export function generateBookingPDF(booking: any, pricing: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawPageHeader(doc, 'Booking Confirmation');

  // Customer block
  let y = 65;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('GUEST & TRAVEL RESERVATION DETAILS', 15, y);
  
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(15, y, 195, y);

  y += 3;
  drawTableRow(doc, y, 'Booking Reference ID', booking.reference || 'ZTR-CONFIRMED', true); y += 8;
  drawTableRow(doc, y, 'Lead Guest Name', booking.full_name); y += 6;
  drawTableRow(doc, y, 'Email Address', booking.email || 'N/A'); y += 6;
  drawTableRow(doc, y, 'WhatsApp Primary Contact', booking.whatsapp_number); y += 6;
  drawTableRow(doc, y, 'Tour/Package Name', booking.tour_name); y += 6;
  drawTableRow(doc, y, 'Preferred Travel Date', booking.preferred_date); y += 6;
  drawTableRow(doc, y, 'Total Travelers Registered', `${booking.number_of_guests} Person(s)`); y += 6;
  drawTableRow(doc, y, 'Pickup Resort / Location', booking.pickup_location || 'Stone Town Area'); y += 6;
  drawTableRow(doc, y, 'Estimated Pickup Window', '07:00 AM - 08:30 AM (Zone Dependent)');

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('PRICING BREAKDOWN & FINANCIALS', 15, y);

  y += 4;
  doc.line(15, y, 195, y);

  const curSym = pricing?.currencySymbol || '$';
  const totalVal = pricing?.displayTotal || (booking.total_price || 0);
  const paidVal = pricing?.displayDeposit || 0;
  const remVal = pricing?.displayRemaining || (totalVal - paidVal);

  y += 3;
  drawTableRow(doc, y, 'Item Description', 'Financial Summary Metric', true); y += 8;
  drawTableRow(doc, y, 'Total Aggregate Base Price', `${curSym}${totalVal}.00 USD`); y += 6;
  drawTableRow(doc, y, 'Advanced Prepayment / Security Deposit Paid', `${curSym}${paidVal}.00 USD`); y += 6;
  drawTableRow(doc, y, 'Pending Balance Status', `${curSym}${remVal}.00 USD`); y += 6;
  drawTableRow(doc, y, 'Calculated Payment Status', remVal === 0 ? 'PAID IN FULL' : 'PARTIALLY PAID / DEPOSIT RECEIVED');

  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('STANDARD TERMS & CONDITIONS NOTES', 15, y);

  y += 4;
  doc.line(15, y, 195, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7.5);
  doc.text('1. CANCELLATION: Bookings cancelled up to 48 hours prior to start time are eligible for a full 100% refund of any deposit.', 15, y); y += 4.5;
  doc.text('2. DELAYS: Weather & sea-tide conditions might limit entry to Mnemba Atoll or certain beach zones. Alternatives will be supplied.', 15, y); y += 4.5;
  doc.text('3. PORTER SAFETY: Kilimanjaro climbs are executed fully in line with ethical KPAP guidelines (fair porter wages paid).', 15, y); y += 4.5;
  doc.text('4. ACCEPTANCE: Proceeding with payment or boarding vehicles signifies complete agreement to local Zanzibar safety directives.', 15, y);

  // Render official stamp area
  y += 10;
  doc.setDrawColor(11, 59, 140);
  doc.setLineWidth(1);
  doc.rect(130, y, 55, 23);
  doc.setTextColor(11, 59, 140);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('ZANZIBAR TRIP & RELAX', 157, y + 5, { align: 'center' });
  doc.setTextColor(212, 160, 23);
  doc.text('OFFICIAL VERIFIED VOUCHER', 157, y + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Signed digitally on server', 157, y + 15, { align: 'center' });
  doc.text(`Ref: ${booking.reference || 'ZTR-LOG'}`, 157, y + 19, { align: 'center' });

  drawPageFooter(doc, 1, 1);
  doc.save(`ZTR-Booking-${booking.reference || 'Confirmation'}.pdf`);
}

/**
 * 2. Generate Official Receipt PDF
 */
export function generateReceiptPDF(booking: any, payment: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawPageHeader(doc, 'Payment Receipt');

  let y = 65;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('PAYMENT & TRANSACTION REFERENCE', 15, y);

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);

  y += 3;
  drawTableRow(doc, y, 'Metric Label', 'Transaction Registry Details', true); y += 8;
  drawTableRow(doc, y, 'Official Receipt Number', `ZTR-REC-${payment.transactionId || Math.floor(Math.random() * 1000000)}`); y += 6;
  drawTableRow(doc, y, 'Associated Booking ID', booking.reference || 'ZTR-LOG'); y += 6;
  drawTableRow(doc, y, 'Guest Full Name', booking.full_name); y += 6;
  drawTableRow(doc, y, 'Tour Package Booked', booking.tour_name || 'Zanzibar Adventure Expedition'); y += 6;
  drawTableRow(doc, y, 'Travel Date Scheduled', booking.preferred_date || 'N/A'); y += 6;
  drawTableRow(doc, y, 'Pickup Resort / Location', booking.pickup_location || 'Stone Town Area'); y += 6;
  drawTableRow(doc, y, 'Estimated Pickup Window', '07:00 AM - 08:30 AM (Zone Dependent)'); y += 6;
  drawTableRow(doc, y, 'Payment Gateway / Channel', payment.method || 'Online Secure Card Processing'); y += 6;
  drawTableRow(doc, y, 'Authorized Transaction ID', payment.gatewayId || `TX-${Date.now()}`); y += 6;
  drawTableRow(doc, y, 'Amount Transferred', `${payment.currencySymbol || '$'}${payment.amount}.00`); y += 6;
  drawTableRow(doc, y, 'Payment Date / Local Time', payment.date || new Date().toLocaleString()); y += 6;
  drawTableRow(doc, y, 'Outstanding Net Balance', `${payment.currencySymbol || '$'}${payment.balanceRemaining || 0}.00`);

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('OFFICIAL STAMP & AUTHORIZATION', 15, y);

  y += 4;
  doc.line(15, y, 195, y);

  y += 8;
  // Box for stamp
  doc.setDrawColor(11, 59, 140);
  doc.setLineWidth(0.8);
  doc.rect(15, y, 65, 30);
  doc.setTextColor(11, 59, 140);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CORPORATE SECURITY STAMP', 47.5, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.text('Zanzibar Trip & Relax Ltd', 47.5, y + 14, { align: 'center' });
  doc.text('SECURE PAYMENT CLEARED', 47.5, y + 19, { align: 'center' });
  doc.text('SULTANATE ROAD, STONE TOWN', 47.5, y + 24, { align: 'center' });

  // Right box for signature
  doc.setDrawColor(212, 160, 23);
  doc.rect(125, y, 70, 30);
  doc.setTextColor(212, 160, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ACCOUNTING AUDITOR DEPT', 160, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(12);
  doc.text('G. P. Mtaki', 160, y + 17, { align: 'center' }); // Simulated signature
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7.5);
  doc.text('Finance Operations Officer', 160, y + 24, { align: 'center' });

  y += 38;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('This receipt serves as temporary legal proof of local sales transaction in the United Republic of Tanzania.', 15, y); y += 4;
  doc.text('Any payment queries should refer specifically to the Associated Booking ID above.', 15, y);

  drawPageFooter(doc, 1, 1);
  doc.save(`ZTR-Receipt-${payment.transactionId || 'Payment'}.pdf`);
}

/**
 * 3. Generate detailed Tour / Package Itinerary PDF
 */
export function generateItineraryPDF(pkg: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawPageHeader(doc, 'Tour Itinerary Brochure');

  let y = 65;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(13);
  doc.text(pkg.title.toUpperCase(), 15, y);

  y += 5;
  doc.setFont('helvetica', 'medium');
  doc.setTextColor(212, 160, 23);
  doc.setFontSize(9);
  doc.text(`Duration: ${pkg.duration} | Base Price Rate: ${pkg.price} | Target Hubs: ${pkg.destinations || 'Zanzibar Central'}`, 15, y);

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(9.5);
  const splitSummary = doc.splitTextToSize(pkg.summary || pkg.desc || 'Enjoy an ethically guided Swahili adventure with Zanzibar Trip & Relax.', 175);
  doc.text(splitSummary, 15, y);

  y += splitSummary.length * 5 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('DAY-BY-DAY EXCURSION TIMELINES', 15, y);

  y += 4;
  doc.line(15, y, 195, y);

  // Print day itinerary lines
  y += 6;
  const itineraryDays = pkg.itinerary || [
    { day: 1, title: 'Morning Arrival Check-in', desc: 'Welcome at terminal, custom airport transfers, Stone Town riad hotel room allocations, and local rooftop hibiscus spice tea.' },
    { day: 2, title: 'Prison Island Tortoise Snorkeling Combo', desc: 'Charter boat transfer to Prison Island. Feed giant 150kg Aldabra tortoises. Snorkel beautiful reef and white sandbank.' },
    { day: 3, title: 'Tangy Spice Farm walk & Swahili Lunch', desc: 'Smell vanilla pod trees, peel organic cinnamon branches, and eat traditional spiced pilau lunch prepared locally.' }
  ];

  itineraryDays.forEach((step: any) => {
    if (y > 230) {
      drawPageFooter(doc, 1, 2);
      doc.addPage();
      drawPageHeader(doc, 'Tour Itinerary Brochure');
      y = 65;
    }

    doc.setFillColor(245, 247, 251);
    doc.rect(15, y, 180, 20, 'F');
    doc.setDrawColor(11, 59, 140);
    doc.setLineWidth(1);
    doc.line(15, y, 15, y + 20); // vertical blue stripe

    doc.setTextColor(11, 59, 140);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`DAY ${step.day || step.id || 'P'}: ${step.title}`, 18, y + 5);

    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const splitDesc = doc.splitTextToSize(step.desc || step.activity || 'Custom daily excursion guided by our certifed island staff.', 170);
    doc.text(splitDesc, 18, y + 10);

    y += 24;
  });

  // What to bring checklist at base of document
  if (y > 220) {
    drawPageFooter(doc, 1, 2);
    doc.addPage();
    drawPageHeader(doc, 'Tour Itinerary Brochure');
    y = 65;
  }

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('ESSENTIAL TRAVEL & PACK CHECKLIST', 15, y);
  
  y += 4;
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  const items = pkg.whatToBring || [
    'Shoulders & knees covered clothing for Stone Town cultural respect walks',
    'High SPF reef-safe sunscreen lotions to safeguard local corals',
    'Waterproof camera (eg GoPro) with floating handle straps',
    'Cash in small USD denominations (printed 2013 or newer per Tanzanian bank regulations)'
  ];

  items.slice(0, 4).forEach((item: string, idx: number) => {
    doc.text(`[x] ${item}`, 18, y);
    y += 5.5;
  });

  drawPageFooter(doc, 1, 1);
  doc.save(`ZTR-Itinerary-${pkg.id || 'Package'}.pdf`);
}

/**
 * 4. Generate travel packing / info instructions flyer (eg. Kilimanjaro packing booklet or safari info)
 */
export function generatePackingListPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawPageHeader(doc, 'Kilimanjaro Packing Checklist');

  let y = 65;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(12);
  doc.text('ESSENTIAL KILIMANJARO MOUNTAINEERING GEAR', 15, y);

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(8.5);
  doc.text('Hiking Mount Kilimanjaro (Uhuru Peak 5,895m) crosses 5 distinct ecological zones.', 15, y); y += 4.5;
  doc.text('Temperatures at the summit drop to -15°C. This certified list helps you pack appropriately.', 15, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.text('1. UPPER CORP & LOWER CORP SYSTEM ARRAYS (LAYERS ENGINES)', 15, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('- Dry-Wicking Base Layers (Synthetics/merino wool, absolutely NO cotton)', 18, y); y += 4.5;
  doc.text('- Warm fleece jacket Mid-layers (Comfort insulation levels)', 18, y); y += 4.5;
  doc.text('- heavy insulated Down Parka jacket with weather hood (Certified for extreme sub-zero)', 18, y); y += 4.5;
  doc.text('- Waterproof Gore-Tex rain jacket shell + waterproof rain pants', 18, y); 

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.text('2. EXTREMITY APPAREL & SAFETY FOOTWEAR', 15, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('- Broken-in, waterproof, supportive leather ankle-high hiking boots', 18, y); y += 4.5;
  doc.text('- Thick heavy merino wool hiking socks (4 pairs suggested minimum)', 18, y); y += 4.5;
  doc.text('- Windproof thermal ski-gloves and lightweight glove liners', 18, y); y += 4.5;
  doc.text('- Polarized ski sunglasses or alpine snow goggles (protect from snow-blindness)', 18, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.text('3. SLEEP SHELTER CAMP SYSTEMS & HARDWARE GEAR', 15, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('- 4-Season Rated down sleeping bag (Comfort status of -10°C to -15°C or lower)', 18, y); y += 4.5;
  doc.text('- Powerful LED headlamp with extra lithium batteries (Crucial for midnight sumit push)', 18, y); y += 4.5;
  doc.text('- Supportive trekking poles with robust rubber tips (Helpful for knee support on descents)', 18, y); y += 4.5;
  doc.text('- 80L Duffel bag for porters to carry + 30L Waterproof daypack for yourself', 18, y);

  y += 12;
  doc.setFillColor(254, 243, 199); // light orange background warning
  doc.rect(15, y, 180, 20, 'F');
  doc.setDrawColor(212, 160, 23);
  doc.rect(15, y, 180, 20);

  doc.setTextColor(11, 59, 140);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('IMPORTANT CLIMB NOTE', 18, y + 6);
  doc.setTextColor(120, 80, 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('If you lack certified down jackets, sleeping bags, or poles, DO NOT WORRY. You can rent professional', 18, y + 11);
  doc.text('mountaineering gear on-site in Stone Town or Moshi base camp directories at fair local operator rates.', 18, y + 15);

  drawPageFooter(doc, 1, 1);
  doc.save('ZTR-Mount-Kilimanjaro-Packing-Checklist.pdf');
}

/**
 * 5. Generate Official Invoice PDF
 */
export function generateInvoicePDF(booking: any, pricing: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawPageHeader(doc, 'Booking Invoice');

  let y = 65;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('INVOICE & BILLING DETAILS', 15, y);

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(15, y, 195, y);

  y += 3;
  drawTableRow(doc, y, 'Invoice Reference Code', `ZTR-INV-${booking.reference || booking.id || 'PROFORMA'}`, true); y += 8;
  drawTableRow(doc, y, 'Recipient Customer', booking.full_name || booking.name); y += 6;
  drawTableRow(doc, y, 'Email Address', booking.email || 'N/A'); y += 6;
  drawTableRow(doc, y, 'Contact WhatsApp', booking.whatsapp_number || booking.whatsapp || 'N/A'); y += 6;
  drawTableRow(doc, y, 'Reserved Expedition', booking.tour_name || booking.experience); y += 6;
  drawTableRow(doc, y, 'Scheduled Departure', booking.preferred_date || booking.preferredDate || booking.date); y += 6;
  drawTableRow(doc, y, 'Registered Party Size', `${booking.number_of_guests || booking.guests || 1} Person(s)`); y += 6;
  drawTableRow(doc, y, 'Pickup Region', booking.pickup_location || booking.pickup || 'Stone Town Area');

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('STATEMENT OF ACCOUNT COST SUMMARY', 15, y);

  y += 4;
  doc.line(15, y, 195, y);

  const curSym = pricing?.currencySymbol || '$';
  const totalVal = pricing?.displayTotal || booking.total_price || 0;
  const paidVal = pricing?.displayDeposit || booking.deposit_paid || 0;
  const remVal = pricing?.displayRemaining || booking.remaining_balance || (totalVal - paidVal);

  y += 3;
  drawTableRow(doc, y, 'Cost Component', 'Amount Detailed', true); y += 8;
  drawTableRow(doc, y, 'Base Tour Package Cost', `${curSym}${totalVal}`); y += 6;
  drawTableRow(doc, y, 'Advanced Prepayment Deposited', `${curSym}${paidVal}`); y += 6;
  drawTableRow(doc, y, 'Outstanding Remainder Due', `${curSym}${remVal}`); y += 6;
  drawTableRow(doc, y, 'Invoice Payment Status', remVal === 0 ? 'PARTIALLY TO FULLY SETTLED' : 'DUE ON ARRIVAL / DEPARTURE');

  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 59, 140);
  doc.setFontSize(11);
  doc.text('INVOICE PAYMENT INSTRUCTIONS', 15, y);

  y += 4;
  doc.line(15, y, 195, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7.5);
  doc.text('1. DEPOSIT REQUIREMENT: A minimum deposit (as configured) or full prepayment must be authorized to fully secure reservations.', 15, y); y += 4.5;
  doc.text('2. ARRIVAL BALANCE: Any remaining balance can be handled on the morning of departure via cash (USD/TZS/EUR) or credit card (+3.5% fee).', 15, y); y += 4.5;
  doc.text('3. FLIGHTS & WILDLIFE SAFARIS: Fly-in packages require 100% full upfront prepayments to register flights & park authorities.', 15, y);

  // Render official stamp area
  y += 10;
  doc.setDrawColor(11, 59, 140);
  doc.setLineWidth(1);
  doc.rect(130, y, 55, 23);
  doc.setTextColor(11, 59, 140);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('ZANZIBAR TRIP & RELAX', 157, y + 5, { align: 'center' });
  doc.setTextColor(212, 160, 23);
  doc.text('OFFICIAL PRINTABLE INVOICE', 157, y + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Pre-authorized copy', 157, y + 15, { align: 'center' });
  doc.text(`Ref: ${booking.reference || booking.id || 'ZTR-INV'}`, 157, y + 19, { align: 'center' });

  drawPageFooter(doc, 1, 1);
  doc.save(`ZTR-Invoice-${booking.reference || booking.id || 'Proforma'}.pdf`);
}

/**
 * 6. Generate Bookings Ledger Summary Report PDF
 */
export function generateBookingsSummaryPDF(bookings: any[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let pageNum = 1;
  const totalPages = Math.ceil(bookings.length / 18) || 1; // approx 18 items per page

  const initPage = (title: string) => {
    drawPageHeader(doc, title);
    // Draw table column headers
    let colY = 62;
    doc.setFillColor(240, 243, 248);
    doc.rect(15, colY, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 59, 140);
    doc.setFontSize(8);
    
    doc.text('Ref ID', 18, colY + 5.5);
    doc.text('Lead Traveler', 42, colY + 5.5);
    doc.text('Excursion / Tour', 82, colY + 5.5);
    doc.text('Date', 135, colY + 5.5);
    doc.text('Guests', 160, colY + 5.5);
    doc.text('Status', 178, colY + 5.5);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(15, colY + 8, 195, colY + 8);
  };

  initPage('Bookings Report');

  let y = 73;
  bookings.forEach((b, index) => {
    // Page overflow handler
    if (y > 260) {
      drawPageFooter(doc, pageNum, totalPages);
      doc.addPage();
      pageNum++;
      initPage('Bookings Report');
      y = 73;
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(7.5);

    // Zebra striping for premium look
    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 252);
      doc.rect(15, y - 3.5, 180, 8.5, 'F');
    }

    doc.text(String(b.id || b.reference || `ZTR-${1000 + index}`).substring(0, 10), 18, y + 2);
    doc.text(String(b.full_name || 'N/A').substring(0, 22), 42, y + 2);
    doc.text(String(b.tour_name || 'N/A').substring(0, 28), 82, y + 2);
    doc.text(String(b.preferred_date || 'N/A'), 135, y + 2);
    doc.text(`${b.number_of_guests || 1} pax`, 160, y + 2);

    // Color-coded status
    const status = (b.status || 'pending').toLowerCase();
    if (status === 'confirmed' || status === 'approved') {
      doc.setTextColor(21, 128, 61); // Green
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIRMED', 178, y + 2);
    } else if (status === 'cancelled' || status === 'rejected') {
      doc.setTextColor(185, 28, 28); // Red
      doc.setFont('helvetica', 'bold');
      doc.text('CANCELLED', 178, y + 2);
    } else {
      doc.setTextColor(217, 119, 6); // Orange/Amber
      doc.setFont('helvetica', 'bold');
      doc.text('PENDING', 178, y + 2);
    }

    // separator line
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.15);
    doc.line(15, y + 5, 195, y + 5);

    y += 9.5;
  });

  // Overview report box at the bottom if space permits, or on a new summary page
  if (y > 220) {
    drawPageFooter(doc, pageNum, totalPages + 1);
    doc.addPage();
    pageNum++;
    drawPageHeader(doc, 'Bookings Report');
    y = 65;
  } else {
    y += 5;
  }

  // Summary Card Box
  doc.setFillColor(243, 246, 252);
  doc.rect(15, y, 180, 25, 'F');
  doc.setDrawColor(11, 59, 140);
  doc.setLineWidth(0.5);
  doc.rect(15, y, 180, 25);

  doc.setTextColor(11, 59, 140);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('OFFICIAL REPORT SUMMARY METRICS', 20, y + 6);

  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'approved').length;
  const pendingCount = bookings.filter((b: any) => b.status === 'pending').length;
  const totalTravelers = bookings.reduce((acc: number, b: any) => acc + (b.number_of_guests || 1), 0);

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Total Lodged Orders: ${totalBookings}`, 20, y + 13);
  doc.text(`Confirmed / Authorized Excursions: ${confirmedCount}`, 20, y + 19);
  doc.text(`Pending Action Inquiries: ${pendingCount}`, 110, y + 13);
  doc.text(`Total Traveling Passengers: ${totalTravelers}`, 110, y + 19);

  drawPageFooter(doc, pageNum, pageNum);
  doc.save(`ZTR_Bookings_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * 7. Generate Visitor Logs & Security Audit Ledger PDF
 */
export function generateVisitorLogsPDF(logs: any[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let pageNum = 1;
  const totalPages = Math.ceil(logs.length / 22) || 1; // approx 22 logs per page

  const initPage = (title: string) => {
    drawPageHeader(doc, title);
    // Draw table column headers
    let colY = 62;
    doc.setFillColor(240, 243, 248);
    doc.rect(15, colY, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 59, 140);
    doc.setFontSize(8);
    
    doc.text('Date & Time', 18, colY + 5.5);
    doc.text('Operator', 55, colY + 5.5);
    doc.text('Clearance / Role', 85, colY + 5.5);
    doc.text('Administrative Activity Description', 115, colY + 5.5);
    doc.text('IP Location', 172, colY + 5.5);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(15, colY + 8, 195, colY + 8);
  };

  initPage('Security Audit Logs');

  let y = 73;
  logs.forEach((log, index) => {
    // Page overflow handler
    if (y > 260) {
      drawPageFooter(doc, pageNum, totalPages);
      doc.addPage();
      pageNum++;
      initPage('Security Audit Logs');
      y = 73;
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(7);

    // Zebra striping for premium look
    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 252);
      doc.rect(15, y - 3.5, 180, 8.5, 'F');
    }

    // Date & Time formatting
    const rawDate = log.timestamp || '';
    let formattedDate = rawDate;
    try {
      if (rawDate) {
        const d = new Date(rawDate);
        formattedDate = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch(e) {}

    doc.text(formattedDate, 18, y + 2);
    doc.text(String(log.user || 'N/A').substring(0, 18), 55, y + 2);
    
    // Role styling
    const role = (log.role || 'Operator').toUpperCase();
    doc.setFont('helvetica', 'bold');
    if (role === 'OWNER' || role === 'ADMINISTRATOR') {
      doc.setTextColor(11, 59, 140);
    } else {
      doc.setTextColor(110, 110, 110);
    }
    doc.text(role.substring(0, 16), 85, y + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    // Truncate action to fit neatly
    const actionDesc = String(log.action || 'N/A');
    doc.text(actionDesc.length > 38 ? actionDesc.substring(0, 35) + '...' : actionDesc, 115, y + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(String(log.ipAddress || '127.0.0.1'), 172, y + 2);

    // separator line
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.15);
    doc.line(15, y + 5, 195, y + 5);

    y += 8.5;
  });

  // Summary box
  if (y > 230) {
    drawPageFooter(doc, pageNum, totalPages + 1);
    doc.addPage();
    pageNum++;
    drawPageHeader(doc, 'Security Audit Logs');
    y = 65;
  } else {
    y += 5;
  }

  // Summary Card Box
  doc.setFillColor(243, 246, 252);
  doc.rect(15, y, 180, 20, 'F');
  doc.setDrawColor(11, 59, 140);
  doc.setLineWidth(0.5);
  doc.rect(15, y, 180, 20);

  doc.setTextColor(11, 59, 140);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('COMPLIANCE & TRACEABILITY AUDIT STAMP', 20, y + 6);

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Total Audit Operations Logged: ${logs.length} operations. All administrative actions are permanently cryptographically archived.`, 20, y + 13);

  drawPageFooter(doc, pageNum, pageNum);
  doc.save(`ZTR_Security_Audit_Logs_${new Date().toISOString().split('T')[0]}.pdf`);
}

