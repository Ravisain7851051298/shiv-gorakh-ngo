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
 * Generate a PDF buffer for an official Membership Certificate.
 * @param {Object} membership - The populated membership document (with user populated).
 * @param {Object} setting - The membership settings or NGO settings.
 * @returns {Promise<Buffer>}
 */
async function generateCertificatePdf(membership, setting = {}) {
  const ngoSetting = await NgoSetting.findOne().lean().catch(() => null);
  const presidentSigUrl = ngoSetting?.presidentSignature || ngoSetting?.authorizedSignature || setting?.presidentSignature || '';
  const secretarySigUrl = ngoSetting?.secretarySignature || setting?.secretarySignature || '';
  const stampUrl = ngoSetting?.stampImage || setting?.stampImage || '';
  const logoUrl = ngoSetting?.logo || '';

  const presidentSigPath = resolveDiskPath(presidentSigUrl);
  const secretarySigPath = resolveDiskPath(secretarySigUrl);
  const stampPath = resolveDiskPath(stampUrl);
  const logoDiskPath = resolveDiskPath(logoUrl);

  const founderName = ngoSetting?.founderName || 'Hari Om';
  const founderRole = ngoSetting?.founderRole || 'Founder & President';
  const coFounderName = ngoSetting?.coFounderName || 'Ankit Pandey';
  const coFounderRole = ngoSetting?.coFounderRole || 'Co-Founder & Secretary';

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 36,
        info: {
          Title: `Membership Certificate - ${membership.certificateNumber || 'Shiv Gorakh Foundation'}`,
          Author: ngoSetting?.ngoName || 'Shiv Gorakh Welfare Foundation',
          Subject: 'Official Certificate of Membership',
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
      // Background & Outer Gold Border
      // ==========================================
      doc
        .rect(0, 0, pageWidth, pageHeight)
        .fill('#fffdfa');

      // Outer gold border
      doc
        .lineWidth(4)
        .strokeColor('#d97706')
        .rect(margin - 12, margin - 12, contentWidth + 24, pageHeight - margin * 2 + 24)
        .stroke();

      // Inner forest green border
      doc
        .lineWidth(1.5)
        .strokeColor('#244b3d')
        .rect(margin - 6, margin - 6, contentWidth + 12, pageHeight - margin * 2 + 12)
        .stroke();

      // Thin inner gold frame
      doc
        .lineWidth(0.75)
        .strokeColor('#f59e0b')
        .rect(margin + 2, margin + 2, contentWidth - 4, pageHeight - margin * 2 - 4)
        .stroke();

      // Corner decorative accents
      const cornerSize = 16;
      [
        [margin - 10, margin - 10],
        [pageWidth - margin - 6, margin - 10],
        [margin - 10, pageHeight - margin - 6],
        [pageWidth - margin - 6, pageHeight - margin - 6],
      ].forEach(([x, y]) => {
        doc.rect(x, y, cornerSize, cornerSize).fill('#244b3d');
      });

      // ==========================================
      // Foundation Header & Logo Emblem
      // ==========================================
      let y = margin + 10;

      if (logoDiskPath) {
        try {
          const logoSize = 34;
          doc.image(logoDiskPath, (pageWidth - logoSize) / 2, y, { width: logoSize, height: logoSize });
          y += logoSize + 4;
        } catch {
          // graceful fallback
        }
      }

      const certOrgName = (ngoSetting?.ngoName || 'SHIV GORAKH WELFARE FOUNDATION').toUpperCase();
      const certRegLine = `REGISTERED UNDER SOCIETY REGISTRATION ACT • REG: ${ngoSetting?.registrationNumber || '244701/SG-2022'} • ${ngoSetting?.taxExemption80G || '80G TAX EXEMPTION COMPLIANT'} • RAMPUR, U.P.`;

      doc
        .fillColor('#d97706')
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(certOrgName, margin, y, {
          align: 'center',
          width: contentWidth,
          characterSpacing: 2,
        });

      y += 16;
      doc
        .fillColor('#244b3d')
        .font('Helvetica')
        .fontSize(8)
        .text(
          certRegLine,
          margin,
          y,
          { align: 'center', width: contentWidth, characterSpacing: 1 }
        );

      // Divider line
      y += 16;
      doc
        .lineWidth(1)
        .strokeColor('#e5e7eb')
        .moveTo(margin + 60, y)
        .lineTo(pageWidth - margin - 60, y)
        .stroke();

      // ==========================================
      // Certificate Title
      // ==========================================
      const isVol = Boolean(membership.isVolunteer || membership.role === 'volunteer' || membership.volunteerId);
      const certTitle = isVol
        ? 'CERTIFICATE OF VOLUNTEER SERVICE'
        : 'CERTIFICATE OF MEMBERSHIP';

      y += 14;
      doc
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .fontSize(isVol ? 24 : 28)
        .text(certTitle, margin, y, {
          align: 'center',
          width: contentWidth,
          characterSpacing: 2.5,
        });

      y += 34;
      doc
        .fillColor('#64748b')
        .font('Helvetica-Oblique')
        .fontSize(11)
        .text('THIS IS PROUDLY CONFERRED UPON', margin, y, {
          align: 'center',
          width: contentWidth,
          characterSpacing: 1.5,
        });

      // ==========================================
      // Member / Volunteer Name
      // ==========================================
      y += 20;
      const memberName =
        (membership.user && membership.user.name) || membership.name || membership.donorName || 'Distinguished Supporter';

      doc
        .fillColor('#244b3d')
        .font('Helvetica-Bold')
        .fontSize(24)
        .text(memberName.toUpperCase(), margin, y, {
          align: 'center',
          width: contentWidth,
        });

      // Name underline
      y += 30;
      doc
        .lineWidth(1.5)
        .strokeColor('#d97706')
        .moveTo(margin + 120, y)
        .lineTo(pageWidth - margin - 120, y)
        .stroke();

      // ==========================================
      // Body Statement
      // ==========================================
      y += 14;
      const tierName = isVol ? 'Field Volunteer' : (membership.membershipType || 'Annual');
      const bodyText = isVol
        ? `in formal recognition of selfless commitment, heroic dedication, and distinguished field rescue service with Shiv Gorakh Welfare Foundation. This credential certifies exemplary animal distress relief, street feeding, emergency medical care, and community leadership across Rampur.`
        : `in formal recognition of induction as an accredited ${tierName} Member of Shiv Gorakh Welfare Foundation. This credential certifies active participation in civic governance, animal rescue initiatives, and humane community welfare.`;

      doc
        .fillColor('#475569')
        .font('Helvetica')
        .fontSize(10)
        .text(bodyText, margin + 40, y, {
          align: 'center',
          width: contentWidth - 80,
          lineGap: 4,
        });

      // ==========================================
      // Credentials Strip (4 Columns)
      // ==========================================
      y += 42;
      const boxWidth = (contentWidth - 60) / 4;
      const certNum = isVol
        ? membership.certificateNumber || membership.volunteerId || 'SG-VOL-OFFICIAL'
        : membership.certificateNumber || 'SG-MEM-OFFICIAL';
      const startDateStr = membership.startDate || membership.approvedAt || membership.createdAt
        ? new Date(membership.startDate || membership.approvedAt || membership.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : new Date().toLocaleDateString('en-IN');
      const endDateStr = membership.endDate
        ? new Date(membership.endDate).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'Lifetime Standing';

      const credentials = isVol
        ? [
            { label: 'CERTIFICATE NO.', val: certNum },
            { label: 'SERVICE ROLE', val: 'Field Volunteer' },
            { label: 'INDUCTION DATE', val: startDateStr },
            { label: 'VERIFICATION', val: 'Verified Active' },
          ]
        : [
            { label: 'CERTIFICATE NO.', val: certNum },
            { label: 'MEMBERSHIP TIER', val: `${tierName} Member` },
            { label: 'ISSUED DATE', val: startDateStr },
            { label: 'VALIDITY', val: endDateStr },
          ];

      credentials.forEach((item, index) => {
        const boxX = margin + 30 + index * boxWidth;
        doc
          .rect(boxX + 2, y, boxWidth - 4, 34)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        doc
          .fillColor('#94a3b8')
          .font('Helvetica-Bold')
          .fontSize(7.5)
          .text(item.label, boxX + 6, y + 5, {
            width: boxWidth - 12,
            align: 'center',
          });

        doc
          .fillColor('#0f172a')
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(item.val, boxX + 6, y + 18, {
            width: boxWidth - 12,
            align: 'center',
          });
      });

      // ==========================================
      // Signatures & Official Seal
      // ==========================================
      const sigY = pageHeight - margin - 55;

      // Left Signature: President
      if (presidentSigPath) {
        try {
          doc.image(presidentSigPath, margin + 50, sigY - 34, { fit: [150, 32], align: 'center' });
        } catch (e) {
          console.error('Failed to draw president signature in certificate:', e.message);
        }
      }

      doc
        .lineWidth(1)
        .strokeColor('#0f172a')
        .moveTo(margin + 50, sigY)
        .lineTo(margin + 200, sigY)
        .stroke();

      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text(founderName, margin + 50, sigY + 5, { width: 150, align: 'center' });

      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(8)
        .text(founderRole, margin + 50, sigY + 18, { width: 150, align: 'center' });

      // Center: Official Digital Seal or Stamp
      const sealX = pageWidth / 2;
      if (stampPath) {
        try {
          doc.image(stampPath, sealX - 25, sigY - 14, { fit: [50, 50], align: 'center' });
        } catch (stampErr) {
          console.error('Failed to draw stamp in certificate:', stampErr.message);
        }
      } else {
        doc
          .circle(sealX, sigY + 8, 22)
          .lineWidth(1.5)
          .strokeColor('#d97706')
          .stroke();

        doc
          .circle(sealX, sigY + 8, 19)
          .lineWidth(0.5)
          .strokeColor('#244b3d')
          .stroke();

        doc
          .fillColor('#b45309')
          .font('Helvetica-Bold')
          .fontSize(7)
          .text('OFFICIAL', sealX - 25, sigY + 1, { width: 50, align: 'center' });
        doc
          .fontSize(6)
          .text('SEAL', sealX - 25, sigY + 9, { width: 50, align: 'center' });
      }

      // Right Signature: Secretary
      if (secretarySigPath) {
        try {
          doc.image(secretarySigPath, pageWidth - margin - 200, sigY - 34, { fit: [150, 32], align: 'center' });
        } catch (e) {
          console.error('Failed to draw secretary signature in certificate:', e.message);
        }
      }

      doc
        .lineWidth(1)
        .strokeColor('#0f172a')
        .moveTo(pageWidth - margin - 200, sigY)
        .lineTo(pageWidth - margin - 50, sigY)
        .stroke();

      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text(coFounderName, pageWidth - margin - 200, sigY + 5, { width: 150, align: 'center' });

      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(8)
        .text(coFounderRole, pageWidth - margin - 200, sigY + 18, {
          width: 150,
          align: 'center',
        });

      // Bottom disclaimer
      doc
        .fillColor('#94a3b8')
        .font('Helvetica')
        .fontSize(7)
        .text(
          'Shiv Gorakh Welfare Foundation • Mohammad Pur Jadied, Keorar, Milak, Rampur, U.P. 244701 • Web: www.shivgorakh.org.in',
          margin,
          pageHeight - margin + 2,
          { align: 'center', width: contentWidth }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateCertificatePdf };
