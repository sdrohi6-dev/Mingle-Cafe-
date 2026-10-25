import { jsPDF } from 'jspdf';
import { MenuItem, Category, CafeSettings, Order } from '../types';

/**
 * Universal helper to trigger a direct file download to desktop/device
 */
export function triggerDirectDownload(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);
  } catch (err) {
    console.error('Direct download error:', err);
    // Fallback: window.open as data URI if anchor fails
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const fallbackLink = document.createElement('a');
      fallbackLink.href = dataUrl;
      fallbackLink.download = filename;
      fallbackLink.click();
    };
    reader.readAsDataURL(blob);
  }
}

/**
 * Directly downloads the CafeFlow Bistro Brochure PDF to the desktop/downloads
 */
export async function downloadBrochurePdf(): Promise<boolean> {
  try {
    const response = await fetch('/brochure.pdf', {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch brochure PDF: status ${response.status}`);
    }

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    triggerDirectDownload(pdfBlob, 'CafeFlow_Bistro_Brochure.pdf');
    return true;
  } catch (err) {
    console.warn('Could not fetch static brochure.pdf, falling back to dynamic PDF generation:', err);
    return false;
  }
}

/**
 * Generates and directly downloads a comprehensive, publication-grade Live Menu PDF to the desktop
 */
export function downloadLiveMenuPdf(
  items: MenuItem[],
  categories: Category[],
  settings: CafeSettings,
  activeCategory: string = 'all'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Filter items
  let displayCategories = categories;
  if (activeCategory !== 'all') {
    displayCategories = categories.filter((c) => c.id === activeCategory);
  }

  // Draw Header Banner
  const drawHeader = (pageNumber: number, totalPages: number) => {
    // Header background bar
    doc.setFillColor(142, 27, 27); // #8E1B1B CafeFlow deep crimson
    doc.rect(margin, margin, contentWidth, 22, 'F');

    // Cafe Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(settings.name.toUpperCase(), margin + 6, margin + 9);

    // Tagline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(245, 166, 35); // Amber gold accent
    doc.text(settings.tagline || 'Modern All-Day Brunch & Specialty Roastery', margin + 6, margin + 15);

    // Contact & Location on right
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.text(`${settings.phone} | ${settings.email}`, pageWidth - margin - 6, margin + 9, { align: 'right' });
    doc.text(settings.address, pageWidth - margin - 6, margin + 15, { align: 'right' });

    cursorY = margin + 28;
  };

  const drawFooter = (pageNumber: number) => {
    const footerY = pageHeight - margin + 4;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Guest Wi-Fi: CafeFlow_Guest (Pass: brewgreat2025) • Table QR Instant Ordering • WhatsApp: +91 98765 43210`,
      margin,
      footerY
    );
    doc.text(`Page ${pageNumber}`, pageWidth - margin, footerY, { align: 'right' });
  };

  let currentPage = 1;
  drawHeader(currentPage, 1);

  // Subheader Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(46, 28, 18);
  doc.text('OFFICIAL BISTRO & CAFE MENU', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Freshly prepared daily • All prices in INR (₹) • Taxes as applicable • Generated on ${dateStr}`, margin, cursorY + 4.5);
  cursorY += 10;

  // Render each category
  displayCategories.forEach((cat) => {
    const catItems = items.filter((it) => it.categoryId === cat.id);
    if (catItems.length === 0) return;

    // Check if we need a new page for category header + at least 2 items
    if (cursorY + 30 > pageHeight - margin - 10) {
      drawFooter(currentPage);
      doc.addPage();
      currentPage++;
      drawHeader(currentPage, 1);
    }

    // Category title pill/bar
    doc.setFillColor(255, 246, 229); // #FFF6E5 Warm cream
    doc.roundedRect(margin, cursorY, contentWidth, 7.5, 1.5, 1.5, 'F');

    doc.setDrawColor(230, 215, 195);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, cursorY, contentWidth, 7.5, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(142, 27, 27);
    doc.text(cat.name.toUpperCase(), margin + 3, cursorY + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 110, 95);
    doc.text(`${catItems.length} items`, pageWidth - margin - 3, cursorY + 5.2, { align: 'right' });

    cursorY += 11;

    // Items list
    catItems.forEach((item) => {
      // Height calculation for description wrapping
      const descLines = item.description
        ? doc.splitTextToSize(item.description, contentWidth - 35)
        : [];
      const itemBlockHeight = 9 + descLines.length * 3.5;

      if (cursorY + itemBlockHeight > pageHeight - margin - 10) {
        drawFooter(currentPage);
        doc.addPage();
        currentPage++;
        drawHeader(currentPage, 1);
      }

      // Dietary tag prefix
      let dietaryBadge = '[VEG]';
      if (item.dietaryFlags.includes('vegan')) dietaryBadge = '[VEGAN]';
      else if (!item.dietaryFlags.includes('veg')) dietaryBadge = '[NON-VEG]';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      const titleText = `${item.title} ${item.isChefSpecial ? '★ (Chef Special)' : ''}`;
      doc.text(titleText, margin + 2, cursorY);

      // Price right aligned
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(142, 27, 27);
      doc.text(`Rs. ${item.price}`, pageWidth - margin - 2, cursorY, { align: 'right' });

      // Dietary badges & prep time
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      const isSpicy = item.dietaryFlags.includes('spicy');
      const meta = `${dietaryBadge} • ~${item.prepTimeMinutes || 12} mins prep${
        isSpicy ? ' • SPICY' : ''
      }`;
      doc.text(meta, margin + 2, cursorY + 3.8);

      // Description
      if (descLines.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(90, 85, 80);
        doc.text(descLines, margin + 2, cursorY + 7.2);
      }

      // Dotted separator line
      doc.setDrawColor(235, 230, 225);
      doc.setLineWidth(0.15);
      doc.line(margin + 2, cursorY + itemBlockHeight - 1.5, pageWidth - margin - 2, cursorY + itemBlockHeight - 1.5);

      cursorY += itemBlockHeight + 1.5;
    });

    cursorY += 3;
  });

  drawFooter(currentPage);

  // Directly save and download PDF to desktop
  const fileName = `CafeFlow_Menu_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

/**
 * Triggers printing of the restaurant menu
 */
export function printMenuDirectly(): void {
  // Add print mode flag to document body so print stylesheets format cleanly
  document.body.classList.add('is-printing-menu');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('is-printing-menu');
  }, 1000);
}

/**
 * Generates and directly downloads a standard A4 Tax Invoice PDF directly to desktop
 */
export function downloadOrderInvoicePdf(order: Order, settings: CafeSettings): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm
  let cursorY = margin;

  const orderDate = new Date(order.createdAt || Date.now());
  const dateStr = orderDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Top Crimson Header
  doc.setFillColor(142, 27, 27); // #8E1B1B
  doc.rect(margin, cursorY, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(settings.name.toUpperCase(), margin + 6, cursorY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(245, 166, 35); // Gold
  doc.text(settings.tagline || 'Modern All-Day Brunch & Specialty Roastery', margin + 6, cursorY + 14);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text(`${settings.address} | Ph: ${settings.phone}`, margin + 6, cursorY + 19.5);

  // Right Side Header Badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 58, cursorY + 3.5, 52, 16.5, 1.5, 1.5, 'F');

  doc.setTextColor(142, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TAX INVOICE & BILL', pageWidth - margin - 32, cursorY + 8.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text(`GSTIN: ${settings.gstin || '29AABCC1234F1Z5'}`, pageWidth - margin - 32, cursorY + 13.5, { align: 'center' });
  doc.text(`FSSAI: ${settings.fssaiLicNo || '11223344000123'}`, pageWidth - margin - 32, cursorY + 17.5, { align: 'center' });

  cursorY += 28;

  // Metadata Strip: Bill No, Date, Guest, Table
  doc.setFillColor(250, 247, 242); // Warm light beige
  doc.roundedRect(margin, cursorY, contentWidth, 18, 1, 1, 'F');
  doc.setDrawColor(230, 224, 215);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, cursorY, contentWidth, 18, 1, 1, 'S');

  // Col 1: Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(140, 120, 100);
  doc.text('BILLED TO (GUEST):', margin + 4, cursorY + 5);
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(order.customerName || 'Valued Guest', margin + 4, cursorY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 90);
  doc.text(order.customerPhone || 'Contact on file', margin + 4, cursorY + 14.5);

  // Col 2: Service & Order Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(140, 120, 100);
  doc.text('SERVICE TYPE:', margin + 65, cursorY + 5);
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  const serviceTypeStr = order.orderType.toUpperCase() + (order.tableNumber ? ` - TABLE #${order.tableNumber}` : '');
  doc.text(serviceTypeStr, margin + 65, cursorY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 90);
  doc.text(`Estimated Ready: ${order.overallEstimatedTime || 'In ~15 min'}`, margin + 65, cursorY + 14.5);

  // Col 3: Invoice Numbers & Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(140, 120, 100);
  doc.text('INVOICE DETAILS:', pageWidth - margin - 4, cursorY + 5, { align: 'right' });
  doc.setFontSize(9);
  doc.setTextColor(142, 27, 27);
  doc.text(`Bill #${order.billNumber || order.orderNumber}`, pageWidth - margin - 4, cursorY + 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 90, 90);
  doc.text(`${dateStr} • ${timeStr}`, pageWidth - margin - 4, cursorY + 14.5, { align: 'right' });

  cursorY += 22;

  // Itemized Table Header
  doc.setFillColor(46, 28, 18); // Dark Coffee Brown
  doc.rect(margin, cursorY, contentWidth, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('#', margin + 3, cursorY + 4.8);
  doc.text('ITEM DESCRIPTION', margin + 12, cursorY + 4.8);
  doc.text('DIET', margin + 98, cursorY + 4.8);
  doc.text('QTY', margin + 122, cursorY + 4.8, { align: 'center' });
  doc.text('RATE (Rs.)', margin + 152, cursorY + 4.8, { align: 'right' });
  doc.text('AMOUNT (Rs.)', pageWidth - margin - 4, cursorY + 4.8, { align: 'right' });

  cursorY += 7;

  // Table Rows
  order.items.forEach((item, index) => {
    const isVeg = item.item.dietaryFlags?.includes('veg');
    const isVegan = item.item.dietaryFlags?.includes('vegan');
    const dietText = isVegan ? 'Vegan' : isVeg ? 'Veg' : 'Non-Veg';

    const rowBg = index % 2 === 0 ? 255 : 250;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, cursorY, contentWidth, 8, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text((index + 1).toString(), margin + 3, cursorY + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(item.item.title, margin + 12, cursorY + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(dietText, margin + 98, cursorY + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(item.quantity.toString(), margin + 122, cursorY + 5.2, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(item.totalUnitPrice.toFixed(2), margin + 152, cursorY + 5.2, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    const lineTotal = (item.totalUnitPrice * item.quantity).toFixed(2);
    doc.text(lineTotal, pageWidth - margin - 4, cursorY + 5.2, { align: 'right' });

    doc.setDrawColor(235, 230, 225);
    doc.setLineWidth(0.15);
    doc.line(margin, cursorY + 8, pageWidth - margin, cursorY + 8);

    cursorY += 8;
  });

  cursorY += 4;

  // Bottom Two-Column Block: Preparation Schedule on Left, Financial Breakdown on Right
  const bottomBoxY = cursorY;

  // Left Box: Kitchen Timetable
  const leftBoxWidth = 88;
  doc.setFillColor(252, 250, 247);
  doc.roundedRect(margin, bottomBoxY, leftBoxWidth, 54, 1.5, 1.5, 'F');
  doc.setDrawColor(230, 224, 215);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, bottomBoxY, leftBoxWidth, 54, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(142, 27, 27);
  doc.text('KITCHEN PREPARATION SCHEDULE', margin + 4, bottomBoxY + 6);

  let prepY = bottomBoxY + 12;
  const timingsToRender = order.dishTimings && order.dishTimings.length > 0
    ? order.dishTimings.slice(0, 4)
    : order.items.slice(0, 4).map((it) => ({
        title: it.item.title,
        quantity: it.quantity,
        readyAtTime: order.overallEstimatedTime || 'In ~15 min',
      }));

  timingsToRender.forEach((dt) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    const truncatedTitle = dt.title.length > 22 ? dt.title.slice(0, 22) + '...' : dt.title;
    doc.text(`${dt.quantity}x ${truncatedTitle}`, margin + 4, prepY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 79); // Green
    doc.text(dt.readyAtTime, margin + leftBoxWidth - 4, prepY, { align: 'right' });
    prepY += 5.5;
  });

  doc.setDrawColor(220, 220, 220);
  doc.line(margin + 4, bottomBoxY + 36, margin + leftBoxWidth - 4, bottomBoxY + 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);
  doc.text('All Dishes Served By:', margin + 4, bottomBoxY + 41);
  doc.setTextColor(142, 27, 27);
  doc.text(order.overallEstimatedTime || 'In ~15-20 min', margin + leftBoxWidth - 4, bottomBoxY + 41, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`Wi-Fi: CafeFlow_Guest (Key: brewgreat2025)`, margin + 4, bottomBoxY + 47);
  doc.text(`Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus === 'paid' ? 'PAID' : 'AT COUNTER'})`, margin + 4, bottomBoxY + 51);

  // Right Box: Financial Breakdown
  const rightBoxX = margin + leftBoxWidth + 4;
  const rightBoxWidth = contentWidth - leftBoxWidth - 4; // ~94mm

  let finY = bottomBoxY + 4;
  const renderFinLine = (label: string, value: string, isBold: boolean = false, isGreen: boolean = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(isGreen ? 46 : 60, isGreen ? 125 : 60, isGreen ? 79 : 60);
    doc.text(label, rightBoxX + 2, finY);
    doc.text(value, pageWidth - margin - 2, finY, { align: 'right' });
    finY += 4.8;
  };

  renderFinLine('Subtotal (Items Total):', `Rs. ${order.subtotal.toFixed(2)}`);
  if (order.discount > 0) renderFinLine(`Discount (${order.couponCode || 'PROMO'}):`, `-Rs. ${order.discount.toFixed(2)}`, false, true);
  if (order.loyaltyDiscount > 0) renderFinLine('Loyalty Points Discount:', `-Rs. ${order.loyaltyDiscount.toFixed(2)}`, false, true);
  renderFinLine('CGST (2.5%):', `Rs. ${(order.cgst || Math.round(order.tax / 2)).toFixed(2)}`);
  renderFinLine('SGST (2.5%):', `Rs. ${(order.sgst || Math.round(order.tax / 2)).toFixed(2)}`);
  if (order.serviceCharge > 0) renderFinLine('Service Charge (5%):', `Rs. ${order.serviceCharge.toFixed(2)}`);
  if (order.deliveryFee > 0) renderFinLine('Delivery Fee:', `Rs. ${order.deliveryFee.toFixed(2)}`);

  // Grand Total Banner
  finY += 1.5;
  doc.setFillColor(142, 27, 27);
  doc.roundedRect(rightBoxX, finY, rightBoxWidth, 12, 1.5, 1.5, 'F');

  doc.setTextColor(245, 166, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TOTAL AMOUNT DUE', rightBoxX + 4, finY + 4.5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text('GRAND TOTAL', rightBoxX + 4, finY + 9.5);

  doc.setFontSize(13);
  doc.text(`Rs. ${order.total.toFixed(2)}`, pageWidth - margin - 4, finY + 8, { align: 'right' });

  // Page Footer
  const footerY = pageHeight - margin - 6;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text('Thank You for Dining at CafeFlow!', pageWidth / 2, footerY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text(
    'This is a computer-generated Tax Invoice and Dining Bill formatted for standard A4 printing. • www.cafeflow.app',
    pageWidth / 2,
    footerY + 4.5,
    { align: 'center' }
  );

  const fileName = `${order.billNumber || order.orderNumber}_A4_Invoice.pdf`;
  doc.save(fileName);
}

