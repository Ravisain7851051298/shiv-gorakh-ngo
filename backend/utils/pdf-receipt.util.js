const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { numberToWords } = require('./number-to-words.util');
const NgoSetting = require('../models/ngo-setting.model');

function resolveDiskPath(relativeUrl) {
  if (!relativeUrl || typeof relativeUrl !== 'string') return null;
  const clean = relativeUrl.replace(/^\/uploads\//, '');
  const fullPath = path.resolve(__dirname, '..', 'Upload', clean);
  return fs.existsSync(fullPath) ? fullPath : null;
}

/**
 * Generate a PDF buffer for a verified donation receipt.
 * @param {Object} donation - The donation document.
 * @param {Object} emailSetting - The email settings (contains prefix).
 * @returns {Promise<Buffer>}
 */
async function generateReceiptPdf(donation, emailSetting = {}) {
  const ngoSetting = await NgoSetting.findOne().lean().catch(() => null);
  const signatureUrl = emailSetting.authorizedSignature || ngoSetting?.authorizedSignature || ngoSetting?.presidentSignature || '';
  const stampUrl = ngoSetting?.stampImage || '';
  const logoUrl = ngoSetting?.logo || '';
  const sigDiskPath = resolveDiskPath(signatureUrl);
  const stampDiskPath = resolveDiskPath(stampUrl);
  const logoDiskPath = resolveDiskPath(logoUrl);
  const signatoryName = emailSetting.signatoryName || ngoSetting?.signatoryName || 'Hari Om';
  const signatoryRole = emailSetting.signatoryRole || ngoSetting?.signatoryRole || 'Authorized Signatory';

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
        info: {
          Title: `Donation Receipt - ${donation.receiptNumber || 'Official'}`,
          Author: ngoSetting?.ngoName || 'Shiv Gorakh Welfare Foundation',
          Subject: 'Donation Acknowledgement & Tax Exemption Receipt',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      // ==========================================
      // Decorative Outer & Inner Border
      // ==========================================
      doc
        .lineWidth(2)
        .strokeColor('#e96a2c')
        .rect(margin - 8, margin - 8, contentWidth + 16, pageHeight - margin * 2 + 16)
        .stroke();

      doc
        .lineWidth(0.5)
        .strokeColor('#172d3a')
        .rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - margin * 2 + 8)
        .stroke();

      // ==========================================
      // Foundation Header & Logo
      // ==========================================
      const headerTop = margin + 4;
      const logoSize = 48;
      if (logoDiskPath) {
        try {
          doc.image(logoDiskPath, margin + 8, headerTop, { width: logoSize, height: logoSize });
        } catch {
          // graceful fallback
        }
      }

      const orgName = (ngoSetting?.ngoName || 'SHIV GORAKH WELFARE FOUNDATION').toUpperCase();
      const orgTagline = (ngoSetting?.tagline || 'REGISTERED ANIMAL WELFARE & RESCUE NON-GOVERNMENTAL ORGANIZATION').toUpperCase();
      const orgAddress = [ngoSetting?.addressLine, ngoSetting?.city, ngoSetting?.state, ngoSetting?.pincode].filter(Boolean).join(', ') || 'Mohammad Pur Jadied, Keorar, Milak, Rampur, Uttar Pradesh 244701';
      const regLine = `Registered under Society Registration Act • Reg. No: ${ngoSetting?.registrationNumber || '244701/SG-2022'} • ${ngoSetting?.taxExemption80G || '80G Tax Exemption Eligible'}`;
      const contactLine = `Email: ${ngoSetting?.email || 'info@shivgorakh.org.in'} | Helpline: ${ngoSetting?.phone || '+91 93369 50578'} | Rampur, U.P.`;

      doc
        .fillColor('#e96a2c')
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(orgName, margin, headerTop, {
          align: 'center',
          width: contentWidth,
        });

      doc
        .fillColor('#244b3d')
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text(orgTagline, {
          align: 'center',
          width: contentWidth,
        });

      doc
        .moveDown(0.2)
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(8)
        .text(
          `${regLine}\n${orgAddress}\n${contactLine}`,
          { align: 'center', width: contentWidth, lineGap: 2 }
        );

      // Horizontal decorative line
      const currentY = doc.y + 10;
      doc
        .lineWidth(1)
        .strokeColor('#cbd5e1')
        .moveTo(margin, currentY)
        .lineTo(pageWidth - margin, currentY)
        .stroke();

      // ==========================================
      // Receipt Title Banner
      // ==========================================
      const bannerY = currentY + 10;
      const bannerHeight = 26;

      doc
        .rect(margin, bannerY, contentWidth, bannerHeight)
        .fill('#172d3a');

      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('OFFICIAL DONATION RECEIPT & ACKNOWLEDGEMENT', margin, bannerY + 7, {
          align: 'center',
          width: contentWidth,
        });

      // ==========================================
      // Metadata (Receipt No, Date, Payment Mode)
      // ==========================================
      const metaY = bannerY + bannerHeight + 12;

      doc
        .rect(margin, metaY, contentWidth, 50)
        .fillAndStroke('#f8fafc', '#e2e8f0');

      const receiptNumber = donation.receiptNumber || 'SG-REC-TEMP';
      const formattedDate = new Date(donation.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const approvalDate = new Date(donation.reviewedAt || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Left Column
      doc
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('RECEIPT NUMBER:', margin + 14, metaY + 10)
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(receiptNumber, margin + 14, metaY + 22);

      doc
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('RECEIPT DATE:', margin + 14, metaY + 36)
        .fillColor('#334155')
        .font('Helvetica')
        .fontSize(9)
        .text(formattedDate, margin + 85, metaY + 36);

      // Right Column
      const rightColX = margin + contentWidth / 2 + 10;
      doc
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('PAYMENT METHOD:', rightColX, metaY + 10)
        .fillColor('#0f172a')
        .font('Helvetica')
        .fontSize(9)
        .text(donation.paymentMethod || 'UPI', rightColX + 95, metaY + 10);

      doc
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('TRANSACTION / UTR ID:', rightColX, metaY + 24)
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(donation.transactionId || 'Direct Bank Credit', rightColX + 115, metaY + 24);

      doc
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('VERIFICATION DATE:', rightColX, metaY + 38)
        .fillColor('#334155')
        .font('Helvetica')
        .fontSize(9)
        .text(approvalDate, rightColX + 105, metaY + 38);

      // ==========================================
      // Donor Information Box
      // ==========================================
      const donorY = metaY + 62;

      doc
        .rect(margin, donorY, contentWidth, 70)
        .fillAndStroke('#ffffff', '#e2e8f0');

      doc
        .fillColor('#e96a2c')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('DONOR DETAILS', margin + 14, donorY + 8);

      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(8.5)
        .text('Received with deep gratitude from:', margin + 14, donorY + 22);

      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(donation.donorName, margin + 14, donorY + 33);

      doc
        .fillColor('#334155')
        .font('Helvetica')
        .fontSize(8.5)
        .text(`Email: ${donation.donorEmail}  |  Phone: ${donation.donorPhone || 'Not provided'}`, margin + 14, donorY + 50);

      // ==========================================
      // Contribution Details Table
      // ==========================================
      const tableY = donorY + 80;

      // Table Header
      doc
        .rect(margin, tableY, contentWidth, 22)
        .fill('#f1f5f9');

      doc
        .fillColor('#475569')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('DESCRIPTION / PURPOSE', margin + 14, tableY + 6)
        .text('STATUS', margin + contentWidth - 190, tableY + 6)
        .text('AMOUNT (INR)', margin + contentWidth - 100, tableY + 6, {
          align: 'right',
          width: 85,
        });

      // Table Row
      const rowY = tableY + 22;
      doc
        .rect(margin, rowY, contentWidth, 54)
        .fillAndStroke('#ffffff', '#cbd5e1');

      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text(
          donation.campaignTitle
            ? `Voluntary Contribution: ${donation.campaignTitle}`
            : 'Voluntary Contribution for Animal Welfare & Medical Care',
          margin + 14,
          rowY + 10
        );

      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(8)
        .text(
          donation.notes
            ? `Special Donor Dedication: "${donation.notes}"`
            : donation.campaignTitle
            ? `Funds allocated directly to support the "${donation.campaignTitle}" initiative & care.`
            : 'Funds utilized for rescue vehicles, sterilization, medicines & shelter feeding.',
          margin + 14,
          rowY + 25,
          { width: contentWidth - 210 }
        );

      // Status Badge (Verified)
      doc
        .rect(margin + contentWidth - 195, rowY + 12, 75, 18)
        .fill('#dcfce7');

      doc
        .fillColor('#15803d')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('VERIFIED', margin + contentWidth - 195, rowY + 16, {
          width: 75,
          align: 'center',
        });

      // Amount
      doc
        .fillColor('#b84712')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(`₹${Number(donation.amount).toLocaleString('en-IN')}`, margin + contentWidth - 100, rowY + 14, {
          align: 'right',
          width: 85,
        });

      // Amount in Words
      const wordsY = rowY + 62;
      const amountInWords = numberToWords(Math.round(donation.amount));

      doc
        .rect(margin, wordsY, contentWidth, 30)
        .fillAndStroke('#fffaf4', '#fed7aa');

      doc
        .fillColor('#9a3412')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('AMOUNT IN WORDS:', margin + 14, wordsY + 6)
        .fillColor('#431407')
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text(`Indian Rupees ${amountInWords} Only`, margin + 14, wordsY + 16);

      // ==========================================
      // Foundation Mission & Tax Note
      // ==========================================
      const noteY = wordsY + 40;

      doc
        .rect(margin, noteY, contentWidth, 68)
        .fillAndStroke('#f8fafc', '#e2e8f0');

      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('TERMS & TAX EXEMPTION DETAILS', margin + 14, noteY + 8);

      doc
        .fillColor('#475569')
        .font('Helvetica')
        .fontSize(7.5)
        .text(
          '1. Donations to Shiv Gorakh Welfare Foundation qualify for tax deductions under Section 80G of the Indian Income Tax Act.\n' +
            '2. This receipt is digitally generated and validated against real-time bank account credit and payment reference records.\n' +
            '3. All donations are non-refundable and strictly dedicated to charitable animal welfare, rescue missions, feeding, and medical interventions.\n' +
            '4. Keep this document safe for your tax filing and accounting records.',
          margin + 14,
          noteY + 20,
          { width: contentWidth - 28, lineGap: 2.5 }
        );

      // ==========================================
      // Signatures & Official Seal
      // ==========================================
      const signY = noteY + 82;

      // Left: Verification Stamp Box
      doc
        .rect(margin, signY, 190, 75)
        .fillAndStroke('#f0fdf4', '#86efac');

      doc
        .fillColor('#166534')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('OFFICIAL VERIFICATION SEAL', margin + 10, signY + 8);

      doc
        .fillColor('#15803d')
        .font('Helvetica')
        .fontSize(7.5)
        .text(
          'Digitally Authenticated by\nShiv Gorakh Welfare Foundation\nAdministration Portal\nStatus: CREDIT CONFIRMED',
          margin + 10,
          signY + 22,
          { lineGap: 2, width: stampDiskPath ? 115 : 170 }
        );

      if (stampDiskPath) {
        try {
          doc.image(stampDiskPath, margin + 130, signY + 14, { fit: [48, 48], align: 'center' });
        } catch (stampErr) {
          console.error('Failed to draw stamp in receipt:', stampErr.message);
        }
      }

      // Right: Authorized Signatory
      const signColX = margin + contentWidth - 200;
      doc
        .rect(signColX, signY, 200, 75)
        .fillAndStroke('#ffffff', '#e2e8f0');

      if (sigDiskPath) {
        try {
          doc.image(sigDiskPath, signColX + 20, signY + 6, { fit: [160, 34], align: 'center' });
        } catch (sigErr) {
          console.error('Failed to draw signature in receipt:', sigErr.message);
          doc
            .fillColor('#e96a2c')
            .font('Helvetica-Bold')
            .fontSize(11)
            .text('Shiv Gorakh Foundation', signColX + 10, signY + 16, { align: 'center', width: 180 });
        }
      } else {
        doc
          .fillColor('#e96a2c')
          .font('Helvetica-Bold')
          .fontSize(11)
          .text('Shiv Gorakh Foundation', signColX + 10, signY + 16, { align: 'center', width: 180 });
      }

      doc
        .lineWidth(0.5)
        .strokeColor('#94a3b8')
        .moveTo(signColX + 20, signY + 44)
        .lineTo(signColX + 180, signY + 44)
        .stroke();

      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(signatoryName, signColX + 10, signY + 48, { align: 'center', width: 180 });

      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(7)
        .text(signatoryRole, signColX + 10, signY + 58, { align: 'center', width: 180 });

      // ==========================================
      // Footer
      // ==========================================
      doc
        .fillColor('#94a3b8')
        .font('Helvetica')
        .fontSize(7)
        .text(
          'Shiv Gorakh Welfare Foundation • Thank you for saving lives! • info@shivgorakh.org.in • www.shivgorakh.org.in',
          margin,
          pageHeight - margin - 4,
          { align: 'center', width: contentWidth }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateReceiptPdf };
