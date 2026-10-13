const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const NgoSetting = require('../models/ngo-setting.model');

function resolveDiskPath(relativeUrl) {
  if (!relativeUrl || typeof relativeUrl !== 'string') return null;
  const clean = relativeUrl.replace(/^\/uploads\//, '');
  const fullPath = path.resolve(__dirname, '..', 'Upload', clean);
  return fs.existsSync(fullPath) ? fullPath : null;
}

/**
 * Generate a PDF buffer for an official Letter of Appointment / Offer Letter.
 * @param {Object} data - Letter data: { personName, personEmail, personPhone, personAddress, roleTitle, idNumber, issueDate, membershipTier }
 * @returns {Promise<Buffer>}
 */
async function generateAppointmentLetterPdf(data) {
  const ngoSetting = await NgoSetting.findOne().lean().catch(() => null);

  const presidentSigUrl = ngoSetting?.presidentSignature || ngoSetting?.authorizedSignature || '';
  const secretarySigUrl = ngoSetting?.secretarySignature || '';
  const stampUrl = ngoSetting?.stampImage || '';
  const logoUrl = ngoSetting?.logo || '';

  const presidentSigPath = resolveDiskPath(presidentSigUrl);
  const secretarySigPath = resolveDiskPath(secretarySigUrl);
  const stampPath = resolveDiskPath(stampUrl);
  const logoDiskPath = resolveDiskPath(logoUrl);

  const founderName = ngoSetting?.founderName || 'Hari Om';
  const founderRole = ngoSetting?.founderRole || 'Founder & President';
  const coFounderName = ngoSetting?.coFounderName || 'Ankit Pandey';
  const coFounderRole = ngoSetting?.coFounderRole || 'Co-Founder & Secretary';

  const orgName = ngoSetting?.ngoName || 'Shiv Gorakh Welfare Foundation';
  const orgAddress = [ngoSetting?.addressLine, ngoSetting?.city, ngoSetting?.state, ngoSetting?.pincode].filter(Boolean).join(', ') || 'Milak, Rampur, Uttar Pradesh - 244701';
  const orgPhone = ngoSetting?.phone || '+91 93369 50578';
  const orgEmail = ngoSetting?.email || 'info@shivgorakh.org.in';

  const personName = data.personName || 'Esteemed Member';
  const personEmail = data.personEmail || 'Not Provided';
  const personPhone = data.personPhone || 'Not Provided';
  const personAddress = data.personAddress || 'Uttar Pradesh, India';
  const roleTitle = data.roleTitle || 'Official Foundation Member';
  const idNumber = data.idNumber || 'SGWF-OFFICIAL';
  const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();
  const formattedDate = issueDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const refNumber = `SGWF/APPT/${issueDate.getFullYear()}/${idNumber.replace(/[^A-Z0-9]/gi, '')}`;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margin: 40,
        info: {
          Title: `Letter of Appointment - ${personName} [${idNumber}]`,
          Author: orgName,
          Subject: 'Official Offer & Letter of Appointment',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      // ==========================================
      // Background & Framing
      // ==========================================
      doc.rect(0, 0, pageWidth, pageHeight).fill('#faf9f6');

      // Outer accent border
      doc.lineWidth(1.5).strokeColor('#0f766e').rect(margin - 10, margin - 10, contentWidth + 20, pageHeight - margin * 2 + 20).stroke();
      doc.lineWidth(0.5).strokeColor('#d97706').rect(margin - 6, margin - 6, contentWidth + 12, pageHeight - margin * 2 + 12).stroke();

      // ==========================================
      // Foundation Header (Letterhead)
      // ==========================================
      let y = margin + 10;

      // Header top bar
      doc.rect(margin, y, contentWidth, 5).fill('#0f766e');
      y += 12;

      if (logoDiskPath) {
        try {
          doc.image(logoDiskPath, margin + 4, y, { width: 44, height: 44 });
        } catch {
          // graceful fallback
        }
      }

      doc
        .fillColor('#0f766e')
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(orgName.toUpperCase(), margin, y, {
          align: 'center',
          width: contentWidth,
          characterSpacing: 1.5,
        });

      y += 22;
      doc
        .fillColor('#d97706')
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(
          (ngoSetting?.tagline || 'REGISTERED PUBLIC CHARITABLE TRUST • ANIMAL RESCUE & HUMANE CARE CORPS').toUpperCase(),
          margin,
          y,
          {
            align: 'center',
            width: contentWidth,
            characterSpacing: 1,
          }
        );

      y += 14;
      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(7.5)
        .text(
          `Govt. Reg. No: ${ngoSetting?.registrationNumber || '244701/SG-2022'} • ${ngoSetting?.taxExemption80G || '80G Tax Exemption Certified'} • Head Office: ${orgAddress}\nHelpline: ${orgPhone} | Official Email: ${orgEmail}`,
          margin,
          y,
          {
            align: 'center',
            width: contentWidth,
            lineGap: 1.5,
          }
        );

      // Gold divider
      y += 16;
      doc.lineWidth(1).strokeColor('#d97706').moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
      doc.lineWidth(0.5).strokeColor('#0f766e').moveTo(margin, y + 2).lineTo(pageWidth - margin, y + 2).stroke();

      // ==========================================
      // Ref No and Date Row
      // ==========================================
      y += 14;
      doc
        .fillColor('#334155')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(`Ref. No: ${refNumber}`, margin, y);

      doc
        .fillColor('#334155')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(`Date: ${formattedDate}`, margin, y, { align: 'right', width: contentWidth });

      // ==========================================
      // Addressee Block
      // ==========================================
      y += 24;
      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text('TO,', margin, y);

      y += 14;
      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(personName, margin, y);

      y += 15;
      doc
        .fillColor('#475569')
        .font('Helvetica')
        .fontSize(9)
        .text(`Official ID Assigned : ${idNumber}`, margin, y);

      y += 13;
      doc
        .fillColor('#475569')
        .font('Helvetica')
        .fontSize(9)
        .text(`Contact Email      : ${personEmail}`, margin, y);

      if (personPhone && personPhone !== 'Not Provided') {
        y += 13;
        doc
          .fillColor('#475569')
          .font('Helvetica')
          .fontSize(9)
          .text(`Contact Phone      : ${personPhone}`, margin, y);
      }

      if (personAddress && personAddress !== 'Not Provided') {
        y += 13;
        doc
          .fillColor('#475569')
          .font('Helvetica')
          .fontSize(9)
          .text(`Address            : ${personAddress}`, margin, y);
      }

      // ==========================================
      // Subject Banner
      // ==========================================
      y += 22;
      const subBoxHeight = 24;
      doc.rect(margin, y, contentWidth, subBoxHeight).fill('#f1f5f9');
      doc.rect(margin, y, 4, subBoxHeight).fill('#0f766e');

      doc
        .fillColor('#0f766e')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(
          `SUBJECT: OFFICIAL LETTER OF APPOINTMENT AS ${roleTitle.toUpperCase()}`,
          margin + 12,
          y + 7,
          { width: contentWidth - 20 }
        );

      // ==========================================
      // Formal Appointment Body
      // ==========================================
      y += 36;
      doc
        .fillColor('#0f172a')
        .font('Helvetica')
        .fontSize(9.5)
        .text(`Dear ${personName},`, margin, y);

      y += 18;
      const body1 =
        `On behalf of the Board of Trustees, Executive Council, and volunteer fraternity of Shiv Gorakh Welfare Foundation, we are proud to formally induct and appoint you as an official ${roleTitle} with effect from ${formattedDate}.`;

      doc
        .fillColor('#334155')
        .font('Helvetica')
        .fontSize(9.5)
        .text(body1, margin, y, {
          width: contentWidth,
          lineGap: 4,
          align: 'justify',
        });

      y += 42;
      const body2 =
        `Your application and credentials have been verified and inducted into the Foundation Official Roster under ID: ${idNumber}. In this capacity, you represent our humane mission of delivering emergency distress rescue, street animal medical aid, anti-rabies vaccination, and community feeding operations.`;

      doc
        .fillColor('#334155')
        .font('Helvetica')
        .fontSize(9.5)
        .text(body2, margin, y, {
          width: contentWidth,
          lineGap: 4,
          align: 'justify',
        });

      // Terms Box
      y += 44;
      doc.rect(margin, y, contentWidth, 126).fill('#ffffff');
      doc.lineWidth(1).strokeColor('#e2e8f0').rect(margin, y, contentWidth, 126).stroke();

      let termsY = y + 10;
      doc
        .fillColor('#0f766e')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('OFFICIAL TERMS OF APPOINTMENT & SERVICE CHARTER:', margin + 12, termsY);

      const terms = [
        `1. Digital Identity Card: You are issued an official Digital QR ID Card (${idNumber}) confirming your authorization and status.`,
        '2. Code of Humane Ethics: All animal welfare, rescue, and rehabilitation actions must adhere strictly to non-violence charters.',
        '3. Community Representation: You are authorized to coordinate with local emergency animal clinics, ambulances, and police desks.',
        '4. Voluntary & Non-Commercial: Your service is driven by empathy, public benevolence, and philanthropic mission.',
      ];

      terms.forEach((t) => {
        termsY += 19;
        doc
          .fillColor('#475569')
          .font('Helvetica')
          .fontSize(8.5)
          .text(t, margin + 12, termsY, { width: contentWidth - 24 });
      });

      y += 138;
      const closing =
        'We welcome you to our mission. May your compassion and active dedication bring relief, dignity, and life-saving care to countless animal companions in need.';

      doc
        .fillColor('#334155')
        .font('Helvetica-Oblique')
        .fontSize(9.5)
        .text(closing, margin, y, {
          width: contentWidth,
          lineGap: 4,
        });

      // ==========================================
      // Signatures & Official Stamp Footer
      // ==========================================
      y = pageHeight - margin - 100;

      // Divider line
      doc.lineWidth(0.5).strokeColor('#cbd5e1').moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
      y += 14;

      const colWidth = contentWidth / 3;

      // Left: President
      if (presidentSigPath) {
        try {
          doc.image(presidentSigPath, margin + 10, y, { fit: [90, 36], align: 'center' });
        } catch (e) {
          console.error('Failed to draw president sig in appointment letter:', e.message);
        }
      }
      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(founderName, margin, y + 40, { width: colWidth, align: 'left' });
      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(7.5)
        .text(founderRole, margin, y + 52, { width: colWidth, align: 'left' });
      doc
        .fillColor('#94a3b8')
        .font('Helvetica')
        .fontSize(7)
        .text('Shiv Gorakh Foundation', margin, y + 63, { width: colWidth, align: 'left' });

      // Center: Official Stamp
      const stampCenterX = margin + colWidth;
      if (stampPath) {
        try {
          doc.image(stampPath, stampCenterX + 35, y - 5, { fit: [70, 70], align: 'center' });
        } catch (e) {
          console.error('Failed to draw stamp in appointment letter:', e.message);
        }
      } else {
        // Vector seal fallback
        doc.circle(stampCenterX + 65, y + 25, 26).lineWidth(1.5).strokeColor('#d97706').stroke();
        doc
          .fillColor('#d97706')
          .font('Helvetica-Bold')
          .fontSize(6)
          .text('SEAL & STAMP', stampCenterX + 40, y + 20, { width: 50, align: 'center' });
        doc
          .fillColor('#0f766e')
          .font('Helvetica')
          .fontSize(5)
          .text('GOVT. REG. 124', stampCenterX + 40, y + 28, { width: 50, align: 'center' });
      }

      // Right: Secretary
      const secX = margin + colWidth * 2;
      if (secretarySigPath) {
        try {
          doc.image(secretarySigPath, secX + 20, y, { fit: [90, 36], align: 'right' });
        } catch (e) {
          console.error('Failed to draw secretary sig in appointment letter:', e.message);
        }
      }
      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(coFounderName, secX, y + 40, { width: colWidth, align: 'right' });
      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(7.5)
        .text(coFounderRole, secX, y + 52, { width: colWidth, align: 'right' });
      doc
        .fillColor('#94a3b8')
        .font('Helvetica')
        .fontSize(7)
        .text('Shiv Gorakh Foundation', secX, y + 63, { width: colWidth, align: 'right' });

      // End doc
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateAppointmentLetterPdf };
