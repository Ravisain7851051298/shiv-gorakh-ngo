const nodemailer = require('nodemailer');
const EmailSetting = require('../models/email-setting.model');
const { generateReceiptPdf } = require('../utils/pdf-receipt.util');
const { generateCertificatePdf } = require('../utils/pdf-certificate.util');
const { generateAppointmentLetterPdf } = require('../utils/pdf-appointment-letter.util');
const { generateIdCardPdf } = require('../utils/pdf-id-card.util');

function createTransporter(setting) {
  const isSecure = setting.secure === true || Number(setting.port) === 465;

  return nodemailer.createTransport({
    host: setting.host || 'smtp.gmail.com',
    port: Number(setting.port) || (isSecure ? 465 : 587),
    secure: isSecure,
    auth: {
      user: setting.user,
      pass: setting.pass,
    },
    // Useful timeout settings
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Verify SMTP connection with given settings
 */
async function verifySmtpConnection(setting) {
  if (!setting.user || !setting.pass) {
    throw new Error('Email username and app password are required');
  }
  const transporter = createTransporter(setting);
  await transporter.verify();
  return true;
}

/**
 * Send a test email to verify credentials
 */
async function sendTestEmail(setting, testRecipient) {
  const recipient = testRecipient || setting.user;
  if (!recipient) {
    throw new Error('Test recipient email address is required');
  }

  const transporter = createTransporter(setting);

  const senderName = setting.senderName || 'Shiv Gorakh Welfare Foundation';
  const senderEmail = setting.senderEmail || setting.user;

  const mailOptions = {
    from: `"${senderName}" <${senderEmail}>`,
    to: recipient,
    subject: 'Test Email — Shiv Gorakh Welfare Foundation Mailer',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 12px; background-color: #fffaf4;">
        <h2 style="color: #e96a2c; margin-top: 0;">SMTP Configuration Successful!</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          This is a confirmation email sent from your <strong>Shiv Gorakh Welfare Foundation</strong> administration dashboard.
        </p>
        <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>SMTP Host:</strong> ${setting.host}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Sender:</strong> ${senderName} &lt;${senderEmail}&gt;</p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Status:</strong> Connected and ready to send donation receipts</p>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
          When you approve a donor contribution, an official PDF receipt will be automatically generated and emailed to the donor.
        </p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

/**
 * Send donation receipt email with attached PDF to the donor
 */
async function sendDonationReceiptEmail(donation) {
  try {
    const setting = await EmailSetting.findOne();
    if (!setting || !setting.isConfigured || !setting.user || !setting.pass) {
      return {
        sent: false,
        error: 'Email settings (Nodemailer) not configured. Please configure in the admin panel.',
      };
    }

    if (!donation.donorEmail) {
      return {
        sent: false,
        error: 'Donor does not have a valid email address.',
      };
    }

    // Generate receipt number if not present
    if (!donation.receiptNumber) {
      const prefix = setting.receiptPrefix || 'SG-REC-';
      const year = new Date().getFullYear();
      const uniqueSuffix = String(donation._id).slice(-6).toUpperCase();
      donation.receiptNumber = `${prefix}${year}-${uniqueSuffix}`;
    }

    // Generate PDF Buffer
    const pdfBuffer = await generateReceiptPdf(donation, setting);

    const transporter = createTransporter(setting);
    const senderName = setting.senderName || 'Shiv Gorakh Welfare Foundation';
    const senderEmail = setting.senderEmail || setting.user;

    const formattedAmount = Number(donation.amount).toLocaleString('en-IN');
    const subject = donation.campaignTitle
      ? `Donation Approved — ${donation.campaignTitle} [${donation.receiptNumber}]`
      : `${setting.emailSubject || 'Donation Approved & Official Receipt'} [${donation.receiptNumber}]`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0; }
          .header { background-color: #172d3a; color: #ffffff; padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background-color: #e96a2c; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .header p { margin: 8px 0 0; font-size: 13px; color: #94a3b8; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
          .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .receipt-card { background-color: #fffaf4; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .amount-box { text-align: center; padding: 12px 0 16px; border-bottom: 1px dashed #fdba74; margin-bottom: 16px; }
          .amount-label { font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.05em; }
          .amount-val { font-size: 28px; font-weight: 800; color: #c2410c; margin-top: 4px; }
          .details-row { display: flex; justify-content: space-between; font-size: 13px; margin: 8px 0; }
          .details-label { color: #64748b; font-weight: 500; }
          .details-val { color: #0f172a; font-weight: 600; }
          .status-tag { display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
          .attachment-note { background-color: #f1f5f9; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #334155; margin-bottom: 24px; border-left: 4px solid #e96a2c; }
          .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Verified Contribution</span>
            <h1>Shiv Gorakh Welfare Foundation</h1>
            <p>Animal Welfare, Emergency Rescue & Medical Care</p>
          </div>

          <div class="content">
            <div class="greeting">Dear ${donation.donorName},</div>
            <div class="message">
              We are pleased to inform you that your donation has been <strong>officially verified and approved</strong>.
              ${
                donation.campaignTitle
                  ? `Your generous contribution of <strong>₹${formattedAmount}</strong> has been allocated directly to the <strong>${donation.campaignTitle}</strong> campaign fund.`
                  : 'Because of caring supporters like you, our team can continue rescuing distressed animals, providing critical treatments, and running daily community feeding drives.'
              }
            </div>

            <div class="receipt-card">
              <div class="amount-box">
                <div class="amount-label">Verified Donation Amount</div>
                <div class="amount-val">₹${formattedAmount}</div>
              </div>
              ${
                donation.campaignTitle
                  ? `
              <div class="details-row">
                <span class="details-label">Campaign / Cause:</span>
                <span class="details-val" style="color: #ea580c; font-weight: 700;">${donation.campaignTitle}</span>
              </div>
              `
                  : ''
              }
              <div class="details-row">
                <span class="details-label">Receipt Number:</span>
                <span class="details-val">${donation.receiptNumber}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Payment Mode:</span>
                <span class="details-val">${donation.paymentMethod || 'UPI'}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Transaction / UTR ID:</span>
                <span class="details-val">${donation.transactionId || 'Direct Bank Credit'}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Verification Status:</span>
                <span class="details-val"><span class="status-tag">Approved & Verified</span></span>
              </div>
            </div>

            <div class="attachment-note">
              <strong>Official Receipt Attached:</strong> A formal PDF receipt (<strong>Donation_Receipt_${donation.receiptNumber}.pdf</strong>) is attached to this email for your tax exemption (80G) and accounting records.
            </div>

            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 0;">
              On behalf of all the voiceless animals we serve, thank you for your compassion and generosity.
            </p>
          </div>

          <div class="footer">
            <strong>Shiv Gorakh Welfare Foundation</strong><br>
            Mohammad Pur Jadied, Keorar, Milak, Rampur, Uttar Pradesh 244701<br>
            Email: info@shivgorakh.org.in | Helpline: +91 93369 50578 | Web: www.shivgorakh.org.in
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: donation.donorEmail,
      replyTo: setting.replyTo || senderEmail,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Donation_Receipt_${donation.receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      sent: true,
      receiptNumber: donation.receiptNumber,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending donation receipt email:', error);
    return {
      sent: false,
      error: error.message || 'Failed to send donation receipt email.',
    };
  }
}

/**
 * Send password reset email with secure reset link to the user
 */
async function sendPasswordResetEmail(user, resetUrl) {
  try {
    const setting = await EmailSetting.findOne();
    if (!setting || !setting.isConfigured || !setting.user || !setting.pass) {
      console.warn('Email settings not fully configured in admin settings. Reset link:', resetUrl);
      return {
        sent: false,
        resetUrl,
        error: 'Email settings (SMTP) not configured. Please configure in the admin panel.',
      };
    }

    if (!user.email) {
      return {
        sent: false,
        resetUrl,
        error: 'User does not have a valid email address.',
      };
    }

    const transporter = createTransporter(setting);
    const senderName = setting.senderName || 'Shiv Gorakh Welfare Foundation';
    const senderEmail = setting.senderEmail || setting.user;
    const recipientName = user.name || 'Supporter';

    const subject = 'Password Reset Request — Shiv Gorakh Welfare Foundation';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
          .header { background-color: #172d3a; color: #ffffff; padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background-color: #e96a2c; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; }
          .header p { margin: 8px 0 0; font-size: 13px; color: #94a3b8; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
          .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .reset-btn { display: inline-block; background-color: #e96a2c; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(233, 106, 44, 0.2); }
          .url-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #64748b; word-break: break-all; margin: 20px 0; }
          .security-note { font-size: 12px; color: #64748b; line-height: 1.6; border-left: 3px solid #cbd5e1; padding-left: 12px; margin-top: 24px; }
          .footer { background-color: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Security Notification</span>
            <h1>Shiv Gorakh Welfare Foundation</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${recipientName},</div>
            <div class="message">
              We received a request to reset your password for your account associated with <strong>${user.email}</strong>.
            </div>
            <div class="message">
              Click the button below to reset your password. This link is valid for <strong>1 hour</strong>.
            </div>
            <div class="btn-container">
              <a href="${resetUrl}" class="reset-btn" target="_blank" style="color: #ffffff;">Reset Password</a>
            </div>
            <div class="message" style="font-size: 13px; margin-bottom: 8px;">
              If the button does not work, copy and paste this URL into your browser:
            </div>
            <div class="url-box">
              ${resetUrl}
            </div>
            <div class="security-note">
              If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <strong>Shiv Gorakh Welfare Foundation</strong><br>
            Email: info@shivgorakh.org.in | Helpline: +91 93369 50578<br>
            Mohammad Pur Jadied, Keorar, Milak, Rampur, Uttar Pradesh 244701
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: user.email,
      replyTo: setting.replyTo || senderEmail,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      sent: false,
      resetUrl,
      error: error.message || 'Failed to send password reset email.',
    };
  }
}

/**
 * Send membership approval email with official Certificate PDF attachment
 */
async function sendMembershipApprovedEmail(membership) {
  try {
    const setting = await EmailSetting.findOne();
    const recipientEmail = membership.user?.email || membership.email;
    const recipientName = membership.user?.name || membership.name || 'Member';

    if (!recipientEmail) {
      return { sent: false, error: 'Member does not have a valid email address.' };
    }

    if (!membership.certificateNumber) {
      const year = new Date().getFullYear();
      const uniqueSuffix = String(membership._id).slice(-6).toUpperCase();
      membership.certificateNumber = `SG-MEM-${year}-${uniqueSuffix}`;
      if (typeof membership.save === 'function') {
        await membership.save();
      }
    }

    const pdfBuffer = await generateCertificatePdf(membership, setting);

    if (!setting || !setting.isConfigured || !setting.user || !setting.pass) {
      console.warn('SMTP email credentials not configured in admin settings. Skipping email dispatch.');
      return {
        sent: false,
        certificateNumber: membership.certificateNumber,
        pdfBuffer,
        error: 'Email settings (SMTP) not configured. Certificate generated locally.',
      };
    }

    const transporter = createTransporter(setting);
    const senderName = setting.senderName || 'Shiv Gorakh Welfare Foundation';
    const senderEmail = setting.senderEmail || setting.user;

    const subject = `Official Membership Certificate & Welcome — Shiv Gorakh Welfare Foundation [${membership.certificateNumber}]`;
    const tierName = membership.membershipType || 'Annual';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background-color: #1e3a8a; color: #ffffff; padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background-color: #f59e0b; color: #0f172a; font-size: 11px; font-weight: bold; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; }
          .header p { margin: 8px 0 0; font-size: 13px; color: #cbd5e1; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
          .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .cert-card { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
          .cert-box { text-align: center; padding: 10px 0 14px; border-bottom: 1px dashed #93c5fd; margin-bottom: 14px; }
          .cert-label { font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; }
          .cert-val { font-size: 22px; font-weight: 800; color: #1e3a8a; margin-top: 4px; }
          .details-row { display: flex; justify-content: space-between; font-size: 13px; margin: 8px 0; }
          .details-label { color: #64748b; font-weight: 500; }
          .details-val { color: #0f172a; font-weight: 600; }
          .attachment-note { background-color: #f8fafc; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #1e3a8a; margin-bottom: 24px; border-left: 4px solid #3b82f6; }
          .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Official Induction</span>
            <h1>Shiv Gorakh Welfare Foundation</h1>
            <p>Animal Welfare, Emergency Rescue & Community Care</p>
          </div>
          <div class="content">
            <div class="greeting">Dear ${recipientName},</div>
            <div class="message">
              Congratulations! Your application and membership contribution for <strong>Shiv Gorakh Welfare Foundation</strong> have been verified and approved by the administration.
            </div>
            <div class="cert-card">
              <div class="cert-box">
                <div class="cert-label">Official Membership Inducted</div>
                <div class="cert-val">${tierName} Member</div>
              </div>
              <div class="details-row">
                <span class="details-label">Certificate Number:</span>
                <span class="details-val">${membership.certificateNumber}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Member Name:</span>
                <span class="details-val">${recipientName}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Verification Standing:</span>
                <span class="details-val" style="color: #16a34a;">Active & Inducted</span>
              </div>
            </div>
            <div class="attachment-note">
              <strong>Official PDF Certificate Attached:</strong> Your high-resolution certificate (<strong>Membership_Certificate_${membership.certificateNumber}.pdf</strong>) is attached to this email. You can save, print, or frame your official credential.
            </div>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              As an accredited member, you hold voting rights in our General Body assembly and direct advisory standing for local animal welfare projects.
            </p>
          </div>
          <div class="footer">
            <strong>Shiv Gorakh Welfare Foundation</strong><br>
            Mohammad Pur Jadied, Keorar, Milak, Rampur, Uttar Pradesh 244701<br>
            Email: info@shivgorakh.org.in | Helpline: +91 93369 50578
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      replyTo: setting.replyTo || senderEmail,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Membership_Certificate_${membership.certificateNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    membership.certificateSentAt = new Date();
    if (typeof membership.save === 'function') {
      await membership.save();
    }

    return {
      sent: true,
      certificateNumber: membership.certificateNumber,
      messageId: info.messageId,
      pdfBuffer,
    };
  } catch (error) {
    console.error('Error sending membership certificate email:', error);
    return {
      sent: false,
      error: error.message || 'Failed to send membership certificate email.',
    };
  }
}

/**
 * Send official Appointment Letter PDF & ID Card PDF via email to an accredited Member
 */
async function sendMemberAppointmentLetterEmail(membership) {
  try {
    const setting = await EmailSetting.findOne();
    const recipientEmail = membership.user?.email || membership.email;
    const recipientName = membership.user?.name || membership.name || 'Member';

    if (!recipientEmail) {
      return { sent: false, error: 'Member does not have a valid email address.' };
    }

    const memberId = membership.memberId || membership.certificateNumber || `SG-MEM-${new Date().getFullYear()}-${String(membership._id).slice(-6).toUpperCase()}`;
    const fullAddress = [membership.address, membership.city, membership.state, membership.zipCode].filter(Boolean).join(', ') || 'Rampur, Uttar Pradesh';

    const pdfBuffer = await generateAppointmentLetterPdf({
      personName: recipientName,
      personEmail: recipientEmail,
      personPhone: membership.user?.phone || membership.phone || 'Not Provided',
      personAddress: fullAddress,
      roleTitle: `Official Foundation Member (${membership.membershipType || 'Annual'} Tier)`,
      idNumber: memberId,
      issueDate: membership.approvedAt || membership.startDate || new Date(),
    });

    const idCardBuffer = await generateIdCardPdf({
      isVolunteer: false,
      idNumber: memberId,
      name: recipientName,
      phone: membership.user?.phone || membership.phone || 'Registered',
      roleTitle: `Official Member (${membership.membershipType || 'Annual'})`,
      bloodGroup: membership.bloodGroup || 'O+',
      city: membership.city || 'Rampur',
      state: membership.state || 'Uttar Pradesh',
      photoUrl: membership.user?.profilePicture || membership.profilePicture || '',
      issueDate: membership.approvedAt || membership.startDate || new Date(),
    });

    if (!setting || !setting.isConfigured || !setting.user || !setting.pass) {
      return {
        sent: false,
        memberId,
        pdfBuffer,
        idCardBuffer,
        error: 'Email settings (SMTP) not configured. Documents generated locally.',
      };
    }

    const transporter = createTransporter(setting);
    const senderName = setting.senderName || 'Shiv Gorakh Welfare Foundation';
    const senderEmail = setting.senderEmail || setting.user;

    const subject = `Official Appointment Letter & Digital ID Card — Shiv Gorakh Welfare Foundation [${memberId}]`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #e96a2c; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="background-color: #e96a2c; color: #ffffff; font-size: 10px; font-weight: bold; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">Official Induction</span>
          <h2 style="color: #0f172a; margin: 8px 0 4px;">Shiv Gorakh Welfare Foundation</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Letter of Appointment & Official Identity Card</p>
        </div>
        <p style="font-size: 15px; color: #1e293b;">Dear <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Congratulations! Your membership application has been approved by the Foundation Board.
          We are pleased to present your formal <strong>Letter of Appointment</strong> and your <strong>Official Digital ID Card</strong> as an accredited <strong>${membership.membershipType || 'Annual'} Member</strong> of Shiv Gorakh Welfare Foundation.
        </p>
        <div style="background-color: #fffaf4; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Member ID:</strong> <span style="font-family: monospace; color: #e96a2c; font-weight: bold;">${memberId}</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Appointee:</strong> ${recipientName}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;"><strong>Standing:</strong> Active & Inducted Member</p>
        </div>
        <p style="font-size: 13px; color: #475569;">
          Both your official credentials are attached to this email:
        </p>
        <ul style="font-size: 13px; color: #475569; line-height: 1.6;">
          <li><strong>ID_Card_${memberId}.pdf</strong> — Your official printable foundation identity badge</li>
          <li><strong>Appointment_Letter_${memberId}.pdf</strong> — Your formal letter of appointment signed by the Board</li>
        </ul>
        <p style="font-size: 12px; color: #64748b; margin-top: 14px;">
          <em>Note: Official recognition certificates are issued by foundation administrators upon completion of tenure/special initiatives.</em>
        </p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          Shiv Gorakh Welfare Foundation • Rampur, Uttar Pradesh • info@shivgorakh.org.in
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      replyTo: setting.replyTo || senderEmail,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Appointment_Letter_${memberId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
        {
          filename: `ID_Card_${memberId}.pdf`,
          content: idCardBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    membership.appointmentLetterSentAt = new Date();
    membership.idCardSentAt = new Date();
    if (typeof membership.save === 'function') await membership.save();

    return { sent: true, memberId, messageId: info.messageId, pdfBuffer, idCardBuffer };
  } catch (error) {
    console.error('Error sending member appointment letter and ID card email:', error);
    return { sent: false, error: error.message || 'Failed to send appointment letter and ID card email.' };
  }
}

/**
 * Send official Offer & Appointment Letter PDF & ID Card PDF via email to an authorized Volunteer
 */
async function sendVolunteerOfferLetterEmail(volunteer) {
  try {
    const setting = await EmailSetting.findOne();
    const recipientEmail = volunteer.user?.email || volunteer.email;
    const recipientName = volunteer.user?.name || volunteer.name || 'Volunteer';

    if (!recipientEmail) {
      return { sent: false, error: 'Volunteer does not have a valid email address.' };
    }

    const volunteerId = volunteer.volunteerId || `SG-VOL-${new Date().getFullYear()}-${String(volunteer._id).slice(-6).toUpperCase()}`;
    const fullAddress = [volunteer.address?.addressLine, volunteer.address?.city, volunteer.address?.state, volunteer.address?.pincode].filter(Boolean).join(', ') || 'Rampur, Uttar Pradesh';

    const pdfBuffer = await generateAppointmentLetterPdf({
      personName: recipientName,
      personEmail: recipientEmail,
      personPhone: volunteer.user?.phone || volunteer.emergencyContact?.phone || 'Not Provided',
      personAddress: fullAddress,
      roleTitle: 'Authorized Field Volunteer & Animal Rescue Corps',
      idNumber: volunteerId,
      issueDate: volunteer.approvedAt || volunteer.createdAt || new Date(),
    });

    const idCardBuffer = await generateIdCardPdf({
      isVolunteer: true,
      idNumber: volunteerId,
      name: recipientName,
      phone: volunteer.user?.phone || volunteer.emergencyContact?.phone || 'Registered',
      roleTitle: 'Authorized Field Volunteer',
      bloodGroup: volunteer.bloodGroup || 'O+',
      city: volunteer.address?.city || 'Rampur',
      state: volunteer.address?.state || 'Uttar Pradesh',
      photoUrl: volunteer.user?.profilePicture || volunteer.profilePicture || '',
      issueDate: volunteer.approvedAt || volunteer.createdAt || new Date(),
    });

    if (!setting || !setting.isConfigured || !setting.user || !setting.pass) {
      return {
        sent: false,
        volunteerId,
        pdfBuffer,
        idCardBuffer,
        error: 'Email settings (SMTP) not configured. Documents generated locally.',
      };
    }

    const transporter = createTransporter(setting);
    const senderName = setting.senderName || 'Shiv Gorakh Welfare Foundation';
    const senderEmail = setting.senderEmail || setting.user;

    const subject = `Official Offer Letter & Volunteer ID Card — Shiv Gorakh Volunteer Corps [${volunteerId}]`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #e96a2c; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="background-color: #244b3d; color: #ffffff; font-size: 10px; font-weight: bold; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">Official Appointment</span>
          <h2 style="color: #0f172a; margin: 8px 0 4px;">Shiv Gorakh Welfare Foundation</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Offer & Letter of Appointment — Animal Rescue Corps</p>
        </div>
        <p style="font-size: 15px; color: #1e293b;">Dear <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Congratulations! Your application to serve on the frontlines of compassion has been approved by the Foundation Board.
          We are proud to issue your formal <strong>Offer & Appointment Letter</strong> along with your official <strong>Volunteer Identity Card</strong>.
        </p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #166534;"><strong>Volunteer ID:</strong> <span style="font-family: monospace; font-weight: bold;">${volunteerId}</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #166534;"><strong>Field Status:</strong> Active & Authorized Volunteer</p>
          <p style="margin: 4px 0; font-size: 13px; color: #166534;"><strong>Emergency Helpline Dispatch:</strong> Authorized</p>
        </div>
        <p style="font-size: 13px; color: #475569;">
          Both your official credentials are attached as PDFs to this email:
        </p>
        <ul style="font-size: 13px; color: #475569; line-height: 1.6;">
          <li><strong>ID_Card_${volunteerId}.pdf</strong> — Your official Field Volunteer Identity Card badge</li>
          <li><strong>Offer_Letter_${volunteerId}.pdf</strong> — Your signed Letter of Appointment & Code of Conduct</li>
        </ul>
        <p style="font-size: 12px; color: #64748b; margin-top: 14px;">
          <em>Note: Certificate of Volunteer Service will be awarded by the admin upon exemplary field missions.</em>
        </p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          Shiv Gorakh Welfare Foundation • Rampur, Uttar Pradesh • info@shivgorakh.org.in
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      replyTo: setting.replyTo || senderEmail,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Offer_Letter_${volunteerId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
        {
          filename: `ID_Card_${volunteerId}.pdf`,
          content: idCardBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    volunteer.offerLetterSentAt = new Date();
    volunteer.appointmentLetterSentAt = new Date();
    volunteer.idCardSentAt = new Date();
    if (typeof volunteer.save === 'function') await volunteer.save();

    return { sent: true, volunteerId, messageId: info.messageId, pdfBuffer, idCardBuffer };
  } catch (error) {
    console.error('Error sending volunteer offer letter and ID card email:', error);
    return { sent: false, error: error.message || 'Failed to send offer letter and ID card email.' };
  }
}

/**
 * Send official Certificate of Volunteer Service PDF via email to a Volunteer
 */
async function sendVolunteerCertificateEmail(volunteer) {
  try {
    const setting = await EmailSetting.findOne();
    const recipientEmail = volunteer.user?.email || volunteer.email;
    const recipientName = volunteer.user?.name || volunteer.name || 'Volunteer';

    if (!recipientEmail) {
      return { sent: false, error: 'Volunteer does not have a valid email address.' };
    }

    if (!volunteer.certificateNumber) {
      const year = new Date().getFullYear();
      const uniqueSuffix = String(volunteer._id).slice(-6).toUpperCase();
      volunteer.certificateNumber = `SG-VOL-CERT-${year}-${uniqueSuffix}`;
      if (typeof volunteer.save === 'function') await volunteer.save();
    }

    const pdfBuffer = await generateCertificatePdf({
      ...(typeof volunteer.toObject === 'function' ? volunteer.toObject() : volunteer),
      isVolunteer: true,
      name: recipientName,
      certificateNumber: volunteer.certificateNumber,
    }, setting);

    if (!setting || !setting.isConfigured || !setting.user || !setting.pass) {
      return {
        sent: false,
        certificateNumber: volunteer.certificateNumber,
        pdfBuffer,
        error: 'Email settings (SMTP) not configured. Certificate generated locally.',
      };
    }

    const transporter = createTransporter(setting);
    const senderName = setting.senderName || 'Shiv Gorakh Welfare Foundation';
    const senderEmail = setting.senderEmail || setting.user;

    const subject = `Official Certificate of Volunteer Service — Shiv Gorakh Welfare Foundation [${volunteer.certificateNumber}]`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #e96a2c; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="background-color: #e96a2c; color: #ffffff; font-size: 10px; font-weight: bold; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">Official Recognition</span>
          <h2 style="color: #0f172a; margin: 8px 0 4px;">Shiv Gorakh Welfare Foundation</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Certificate of Volunteer Service & Exemplary Dedication</p>
        </div>
        <p style="font-size: 15px; color: #1e293b;">Dear <strong>${recipientName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          In recognition of your exceptional service, courage, and compassion for community animals,
          the Board of Trustees is honored to present your official <strong>Certificate of Volunteer Service</strong>.
        </p>
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #1e40af;"><strong>Certificate Number:</strong> <span style="font-family: monospace; font-weight: bold;">${volunteer.certificateNumber}</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e40af;"><strong>Honoree:</strong> ${recipientName}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e40af;"><strong>Recognition:</strong> Exemplary Animal Rescue & Field Service</p>
        </div>
        <p style="font-size: 13px; color: #475569;">
          Your high-resolution certificate is attached as a PDF (<strong>Volunteer_Certificate_${volunteer.certificateNumber}.pdf</strong>).
        </p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          Shiv Gorakh Welfare Foundation • Rampur, Uttar Pradesh • info@shivgorakh.org.in
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      replyTo: setting.replyTo || senderEmail,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Volunteer_Certificate_${volunteer.certificateNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    volunteer.certificateSentAt = new Date();
    if (typeof volunteer.save === 'function') await volunteer.save();

    return { sent: true, certificateNumber: volunteer.certificateNumber, messageId: info.messageId, pdfBuffer };
  } catch (error) {
    console.error('Error sending volunteer certificate email:', error);
    return { sent: false, error: error.message || 'Failed to send volunteer certificate email.' };
  }
}

module.exports = {
  createTransporter,
  verifySmtpConnection,
  sendTestEmail,
  sendDonationReceiptEmail,
  sendPasswordResetEmail,
  sendMembershipApprovedEmail,
  sendMemberAppointmentLetterEmail,
  sendVolunteerOfferLetterEmail,
  sendVolunteerCertificateEmail,
};
