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
 * Generate official PDF ID Card buffer for Volunteer or Member
 * @param {Object} data - {
 *   isVolunteer: boolean,
 *   idNumber: string,
 *   name: string,
 *   email: string,
 *   phone: string,
 *   roleTitle: string,
 *   bloodGroup: string,
 *   city: string,
 *   state: string,
 *   photoUrl: string,
 *   issueDate: Date,
 *   validUntil: Date,
 *   emergencyContact: string
 * }
 * @returns {Promise<Buffer>}
 */
async function generateIdCardPdf(data = {}) {
  const ngoSetting = await NgoSetting.findOne().lean().catch(() => null);

  const orgName = ngoSetting?.ngoName || 'Shiv Gorakh Welfare Foundation';
  const orgTagline = 'Dedicated to Community Animal Relief & Social Welfare';
  const orgReg = ngoSetting?.registrationNumber || 'Govt. Reg. Act 1882 · 80G & 12A Certified';
  const orgAddress = [ngoSetting?.city, ngoSetting?.state].filter(Boolean).join(', ') || 'Rampur, Uttar Pradesh';
  const orgHotline = ngoSetting?.phone || '+91 93369 50578';
  const orgEmail = ngoSetting?.email || 'info@shivgorakh.org.in';

  const presidentSigPath = resolveDiskPath(ngoSetting?.presidentSignature || ngoSetting?.authorizedSignature);
  const stampPath = resolveDiskPath(ngoSetting?.stampImage);
  const logoDiskPath = resolveDiskPath(ngoSetting?.logo);
  const memberPhotoPath = resolveDiskPath(data.photoUrl);

  const isVolunteer = Boolean(data.isVolunteer);
  const idNumber = data.idNumber || (isVolunteer ? 'SG-VOL-OFFICIAL' : 'SG-MEM-OFFICIAL');
  const personName = (data.name || data.personName || 'Honored Member').toUpperCase();
  const roleTitle = data.roleTitle || (isVolunteer ? 'Authorized Field Volunteer' : 'Official Foundation Member');
  const phone = data.phone || data.personPhone || 'Registered';
  const bloodGroup = data.bloodGroup || 'O+';
  const cityState = [data.city, data.state].filter(Boolean).join(', ') || orgAddress;
  const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();
  const issueDateStr = issueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const validUntilStr = new Date(issueDate.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Dimensions: Standard portrait badge (280pt x 440pt)
  const cardWidth = 280;
  const cardHeight = 440;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [cardWidth, cardHeight],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // 1. Background base
      doc.rect(0, 0, cardWidth, cardHeight).fill('#ffffff');

      // 2. Card Header Banner (Deep Green for Volunteer, Vibrant Orange/Navy for Member)
      const primaryColor = isVolunteer ? '#1e3a2f' : '#ea580c';
      const accentColor = isVolunteer ? '#ea580c' : '#1e3a2f';

      doc.rect(0, 0, cardWidth, 80).fill(primaryColor);

      // Gold top accent bar
      doc.rect(0, 0, cardWidth, 4).fill('#f59e0b');

      // Organization Logo (or stylized initials)
      if (logoDiskPath) {
        try {
          doc.image(logoDiskPath, 14, 16, { fit: [46, 46] });
        } catch (e) {
          // fallback icon
          drawLogoFallback(doc, 14, 16);
        }
      } else {
        drawLogoFallback(doc, 14, 16);
      }

      // Organization Name & Subtitle
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(orgName, 68, 18, {
        width: 198,
        align: 'left',
      });

      doc.fillColor('#fed7aa').font('Helvetica').fontSize(7).text(orgTagline, 68, 34, {
        width: 198,
        align: 'left',
      });

      doc.fillColor('#e2e8f0').font('Helvetica-Bold').fontSize(6.5).text(orgReg, 68, 46, {
        width: 198,
        align: 'left',
      });

      // Ribbon / Badge Type
      const ribbonTitle = isVolunteer ? 'OFFICIAL VOLUNTEER IDENTITY CARD' : 'OFFICIAL FOUNDATION MEMBER CARD';
      doc.rect(0, 80, cardWidth, 22).fill(accentColor);
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8).text(ribbonTitle, 0, 86, {
        width: cardWidth,
        align: 'center',
        characterSpacing: 0.5,
      });

      // 3. Photo Box / Avatar
      const photoX = cardWidth / 2 - 38;
      const photoY = 112;
      const photoSize = 76;

      // Outer glow / border
      doc.roundedRect(photoX - 3, photoY - 3, photoSize + 6, photoSize + 6, 8).lineWidth(1.5).stroke('#f59e0b');
      doc.roundedRect(photoX, photoY, photoSize, photoSize, 6).fill('#f8fafc');

      if (memberPhotoPath) {
        try {
          doc.save();
          doc.roundedRect(photoX, photoY, photoSize, photoSize, 6).clip();
          doc.image(memberPhotoPath, photoX, photoY, {
            fit: [photoSize, photoSize],
            align: 'center',
            valign: 'center',
          });
          doc.restore();
        } catch (e) {
          drawAvatarFallback(doc, photoX, photoY, photoSize, personName);
        }
      } else {
        drawAvatarFallback(doc, photoX, photoY, photoSize, personName);
      }

      // 4. Member / Volunteer Name
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(13).text(personName, 12, 196, {
        width: cardWidth - 24,
        align: 'center',
      });

      // Role title
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5).text(roleTitle, 12, 213, {
        width: cardWidth - 24,
        align: 'center',
      });

      // ID Number Pill
      const idPillY = 227;
      doc.roundedRect(cardWidth / 2 - 65, idPillY, 130, 18, 9).fill('#f1f5f9');
      doc.roundedRect(cardWidth / 2 - 65, idPillY, 130, 18, 9).lineWidth(0.8).stroke('#cbd5e1');
      doc.fillColor('#0f172a').font('Courier-Bold').fontSize(9).text(idNumber, cardWidth / 2 - 65, idPillY + 4, {
        width: 130,
        align: 'center',
      });

      // 5. Details Section
      const detailsY = 254;
      const leftCol = 22;
      const rightCol = 145;
      const labelColor = '#64748b';
      const valColor = '#1e293b';

      function renderField(label, val, x, y) {
        doc.fillColor(labelColor).font('Helvetica-Bold').fontSize(6.5).text(label.toUpperCase(), x, y);
        doc.fillColor(valColor).font('Helvetica-Bold').fontSize(8).text(val, x, y + 8, { width: 115, ellipsis: true });
      }

      renderField('Phone Number', phone, leftCol, detailsY);
      renderField('Blood Group', bloodGroup, rightCol, detailsY);

      renderField('Issue Date', issueDateStr, leftCol, detailsY + 24);
      renderField('Valid Through', validUntilStr, rightCol, detailsY + 24);

      renderField('Operational Zone', cityState, leftCol, detailsY + 48);
      renderField('Emergency Contact', orgHotline, rightCol, detailsY + 48);

      // Separator line
      doc.moveTo(leftCol, 335).lineTo(cardWidth - leftCol, 335).lineWidth(0.5).stroke('#e2e8f0');

      // 6. Signatures and Official Seals
      if (stampPath) {
        try {
          doc.image(stampPath, 45, 340, { fit: [35, 35] });
        } catch (e) {}
      }
      if (presidentSigPath) {
        try {
          doc.image(presidentSigPath, 175, 340, { fit: [55, 24] });
        } catch (e) {}
      }

      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(6).text('OFFICIAL SEAL', 30, 372, {
        width: 65,
        align: 'center',
      });
      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(6).text('PRESIDENT / SECRETARY', 165, 372, {
        width: 90,
        align: 'center',
      });

      // 7. Footer Helpline Banner
      doc.rect(0, 390, cardWidth, 50).fill('#0f172a');
      doc.fillColor('#f59e0b').font('Helvetica-Bold').fontSize(7).text(`24/7 ANIMAL RESCUE HOTLINE: ${orgHotline}`, 0, 398, {
        width: cardWidth,
        align: 'center',
      });
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(5.8).text(
        `Issued by ${orgName} · Non-transferable identity credential · ${orgEmail}`,
        12,
        410,
        { width: cardWidth - 24, align: 'center' }
      );
      doc.fillColor('#64748b').font('Helvetica').fontSize(5.2).text(
        'Verify credential authenticity directly with foundation administrative board.',
        12,
        424,
        { width: cardWidth - 24, align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function drawLogoFallback(doc, x, y) {
  doc.roundedRect(x, y, 46, 46, 6).fill('#f97316');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(16).text('SG', x, y + 13, {
    width: 46,
    align: 'center',
  });
}

function drawAvatarFallback(doc, x, y, size, name) {
  doc.roundedRect(x, y, size, size, 6).fill('#e2e8f0');
  const initials = (name || 'SG')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  doc.fillColor('#475569').font('Helvetica-Bold').fontSize(22).text(initials || 'ID', x, y + 25, {
    width: size,
    align: 'center',
  });
}

module.exports = {
  generateIdCardPdf,
};
