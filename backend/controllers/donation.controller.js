const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const DonationSetting = require('../models/donation-setting.model');
const Donation = require('../models/donation.model');
const Campaign = require('../models/campaign.model');
const EmailSetting = require('../models/email-setting.model');
const NgoSetting = require('../models/ngo-setting.model');
const { createError } = require('../utils/error.util');
const { uploadRoot } = require('../middlewares/image-upload.middleware');
const { UserRole } = require('../constants/app.constants');
const { generateReceiptPdf } = require('../utils/pdf-receipt.util');
const {
  verifySmtpConnection,
  sendTestEmail,
  sendDonationReceiptEmail,
} = require('../services/email.services');

async function removeFileFromDisk(relativeUrl) {
  if (!relativeUrl || typeof relativeUrl !== 'string') return;
  try {
    const cleanPath = relativeUrl.replace(/^\/uploads\//, '');
    const absolutePath = path.resolve(uploadRoot, cleanPath);
    if (absolutePath.startsWith(uploadRoot)) {
      await fs.unlink(absolutePath).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to unlink file:', err.message);
  }
}

// ==========================================
// Donation Settings (Credentials & QR Code)
// ==========================================

const getDonationSettings = async (req, res, next) => {
  try {
    let settings = await DonationSetting.findOne();
    if (!settings) {
      settings = {
        upiId: '',
        qrCode: '',
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branchName: '',
        accountType: 'Savings',
        instructions: 'Please mention your transaction reference or share screenshot after completing payment.',
        isActive: true,
      };
    }
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const saveDonationSettings = async (req, res, next) => {
  try {
    const {
      upiId,
      accountHolderName,
      accountNumber,
      bankName,
      ifscCode,
      branchName,
      accountType,
      instructions,
      isActive,
      removeQrCode,
    } = req.body;

    let settings = await DonationSetting.findOne();
    const isNew = !settings;
    if (!settings) {
      settings = new DonationSetting();
    }

    if (upiId !== undefined) settings.upiId = upiId.trim();
    if (accountHolderName !== undefined) settings.accountHolderName = accountHolderName.trim();
    if (accountNumber !== undefined) settings.accountNumber = accountNumber.trim();
    if (bankName !== undefined) settings.bankName = bankName.trim();
    if (ifscCode !== undefined) settings.ifscCode = ifscCode.trim().toUpperCase();
    if (branchName !== undefined) settings.branchName = branchName.trim();
    if (accountType !== undefined) settings.accountType = accountType.trim();
    if (instructions !== undefined) settings.instructions = instructions.trim();
    if (isActive !== undefined) {
      settings.isActive = isActive === true || isActive === 'true';
    }

    if (req.file) {
      if (settings.qrCode) {
        await removeFileFromDisk(settings.qrCode);
      }
      settings.qrCode = `/uploads/donation-settings/${req.file.filename}`;
    } else if (removeQrCode === 'true' || removeQrCode === true) {
      if (settings.qrCode) {
        await removeFileFromDisk(settings.qrCode);
      }
      settings.qrCode = '';
    }

    await settings.save();

    return res.status(isNew ? 201 : 200).json({
      success: true,
      message: 'Donation credentials updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDonationSettings = async (req, res, next) => {
  try {
    const settings = await DonationSetting.findOne();
    if (settings) {
      if (settings.qrCode) {
        await removeFileFromDisk(settings.qrCode);
      }
      await DonationSetting.deleteOne({ _id: settings._id });
    }

    return res.status(200).json({
      success: true,
      message: 'Donation credentials deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Email & Nodemailer Settings (Admin Only)
// ==========================================

const getEmailSettings = async (req, res, next) => {
  try {
    let setting = await EmailSetting.findOne();
    if (!setting) {
      setting = new EmailSetting();
    }
    const ngoSetting = await NgoSetting.findOne().lean();
    const signature = setting.authorizedSignature || ngoSetting?.authorizedSignature || '';
    const signatoryName = setting.signatoryName || ngoSetting?.signatoryName || 'Hari Om';
    const signatoryRole = setting.signatoryRole || ngoSetting?.signatoryRole || 'Authorized Signatory';

    return res.status(200).json({
      success: true,
      data: {
        host: setting.host,
        port: setting.port,
        secure: setting.secure,
        user: setting.user,
        senderName: setting.senderName,
        senderEmail: setting.senderEmail,
        replyTo: setting.replyTo,
        receiptPrefix: setting.receiptPrefix,
        emailSubject: setting.emailSubject,
        emailBodyTemplate: setting.emailBodyTemplate,
        isConfigured: setting.isConfigured,
        isPasswordSet: Boolean(setting.pass),
        authorizedSignature: signature,
        signatoryName,
        signatoryRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

const saveEmailSettings = async (req, res, next) => {
  try {
    const {
      host,
      port,
      secure,
      user,
      pass,
      senderName,
      senderEmail,
      replyTo,
      receiptPrefix,
      emailSubject,
      emailBodyTemplate,
      signatoryName,
      signatoryRole,
      removeAuthorizedSignature,
    } = req.body;

    let setting = await EmailSetting.findOne();
    if (!setting) {
      setting = new EmailSetting();
    }

    if (host !== undefined) setting.host = host.trim();
    if (port !== undefined) setting.port = Number(port) || 465;
    if (secure !== undefined) setting.secure = secure === true || secure === 'true';
    if (user !== undefined) setting.user = user.trim();
    if (pass !== undefined && pass.trim() && !pass.includes('••••')) {
      setting.pass = pass.trim();
    }
    if (senderName !== undefined) setting.senderName = senderName.trim();
    if (senderEmail !== undefined) setting.senderEmail = senderEmail.trim();
    if (replyTo !== undefined) setting.replyTo = replyTo.trim();
    if (receiptPrefix !== undefined) setting.receiptPrefix = receiptPrefix.trim();
    if (emailSubject !== undefined) setting.emailSubject = emailSubject.trim();
    if (emailBodyTemplate !== undefined) setting.emailBodyTemplate = emailBodyTemplate.trim();

    if (signatoryName !== undefined) setting.signatoryName = signatoryName.trim();
    if (signatoryRole !== undefined) setting.signatoryRole = signatoryRole.trim();

    if (req.file) {
      if (setting.authorizedSignature && setting.authorizedSignature.startsWith('/uploads/')) {
        await removeFileFromDisk(setting.authorizedSignature);
      }
      setting.authorizedSignature = `/uploads/signatures/${req.file.filename}`;
    }

    if (removeAuthorizedSignature === 'true' || removeAuthorizedSignature === true) {
      if (setting.authorizedSignature && setting.authorizedSignature.startsWith('/uploads/')) {
        await removeFileFromDisk(setting.authorizedSignature);
      }
      setting.authorizedSignature = '';
    }

    // Verify SMTP connection if user and pass exist
    if (setting.user && setting.pass) {
      try {
        await verifySmtpConnection(setting);
        setting.isConfigured = true;
      } catch (smtpErr) {
        return next(
          createError(
            `SMTP authentication failed: ${smtpErr.message}. For Gmail, please use a 16-character App Password.`,
            400
          )
        );
      }
    } else {
      setting.isConfigured = false;
    }

    await setting.save();

    // Sync signature to NgoSetting if present
    if (setting.authorizedSignature || removeAuthorizedSignature) {
      await NgoSetting.updateOne({}, {
        $set: {
          authorizedSignature: setting.authorizedSignature,
          signatoryName: setting.signatoryName,
          signatoryRole: setting.signatoryRole,
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email & receipt signature credentials successfully updated!',
      data: {
        host: setting.host,
        port: setting.port,
        secure: setting.secure,
        user: setting.user,
        senderName: setting.senderName,
        senderEmail: setting.senderEmail,
        receiptPrefix: setting.receiptPrefix,
        isConfigured: setting.isConfigured,
        isPasswordSet: Boolean(setting.pass),
        authorizedSignature: setting.authorizedSignature,
        signatoryName: setting.signatoryName,
        signatoryRole: setting.signatoryRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

const testEmailSettings = async (req, res, next) => {
  try {
    const { testRecipient } = req.body;
    const setting = await EmailSetting.findOne();
    if (!setting || !setting.user || !setting.pass) {
      return next(createError('Please configure and save your email credentials first', 400));
    }

    const recipient = testRecipient?.trim() || setting.user;
    await sendTestEmail(setting, recipient);

    return res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${recipient}!`,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// User Donation Submissions
// ==========================================

const submitDonation = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(createError('Authentication is required to submit a donation', 401));
    }

    const {
      amount,
      paymentMethod,
      transactionId,
      notes,
      donorName,
      donorEmail,
      donorPhone,
      campaignId,
      campaign,
    } = req.body;

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return next(createError('A valid donation amount greater than 0 is required', 400));
    }

    const resolvedDonorName = donorName?.trim() || req.user.name;
    const resolvedDonorEmail = donorEmail?.trim() || req.user.email;
    const resolvedDonorPhone = donorPhone?.trim() || req.user.phone || '';

    if (!resolvedDonorName) {
      return next(createError('Donor name is required', 400));
    }
    if (!resolvedDonorEmail) {
      return next(createError('Donor email is required', 400));
    }

    let targetCampaign = null;
    const targetCampaignId = campaignId || campaign;
    if (targetCampaignId && mongoose.isValidObjectId(targetCampaignId)) {
      targetCampaign = await Campaign.findById(targetCampaignId);
    }

    let screenshotUrl = '';
    if (req.file) {
      screenshotUrl = `/uploads/donations/${req.file.filename}`;
    }

    const donation = await Donation.create({
      user: req.user._id,
      donorName: resolvedDonorName,
      donorEmail: resolvedDonorEmail,
      donorPhone: resolvedDonorPhone,
      amount: parsedAmount,
      paymentMethod: paymentMethod || 'UPI',
      transactionId: transactionId ? transactionId.trim() : '',
      screenshot: screenshotUrl,
      notes: notes ? notes.trim() : '',
      campaign: targetCampaign ? targetCampaign._id : null,
      campaignTitle: targetCampaign ? targetCampaign.title : '',
      campaignFunded: false,
      status: 'Pending',
    });

    const populatedDonation = await Donation.findById(donation._id)
      .populate('campaign', 'title category targetAmount raisedAmount');

    return res.status(201).json({
      success: true,
      message: targetCampaign
        ? `Thank you! Your donation proof for campaign "${targetCampaign.title}" has been submitted and is pending verification.`
        : 'Thank you! Your donation proof has been submitted and is pending verification.',
      data: populatedDonation,
    });
  } catch (error) {
    next(error);
  }
};

const getUserDonations = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(createError('Authentication is required', 401));
    }

    const donations = await Donation.find({ user: req.user._id })
      .populate('campaign', 'title category targetAmount raisedAmount')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: donations,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Admin Donation Management
// ==========================================

const getAdminDonations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};
    const { status, search } = req.query;

    if (status && status !== 'All' && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { donorName: searchRegex },
        { donorEmail: searchRegex },
        { donorPhone: searchRegex },
        { transactionId: searchRegex },
        { campaignTitle: searchRegex },
      ];
    }

    const [donations, total, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Donation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email phone')
        .populate('reviewedBy', 'name email')
        .populate('campaign', 'title category targetAmount raisedAmount')
        .lean(),
      Donation.countDocuments(filter),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'Pending' }),
      Donation.countDocuments({ status: 'Approved' }),
      Donation.countDocuments({ status: 'Rejected' }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        donations,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit) || 1,
          totalItems: total,
          limit,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        counts: {
          total: totalCount,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateDonationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return next(createError('Invalid status. Allowed values: Pending, Approved, Rejected', 400));
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return next(createError('Donation record not found', 404));
    }

    donation.status = status;
    if (reviewNotes !== undefined) {
      donation.reviewNotes = reviewNotes.trim();
    }
    donation.reviewedBy = req.user ? req.user._id : null;
    donation.reviewedAt = new Date();

    // 1. Credit campaign fund if approved and not previously funded
    if (status === 'Approved') {
      if (donation.campaign && !donation.campaignFunded) {
        await Campaign.findByIdAndUpdate(donation.campaign, {
          $inc: { raisedAmount: donation.amount },
        });
        donation.campaignFunded = true;
      }
    } else if (status !== 'Approved' && donation.campaign && donation.campaignFunded) {
      // Reverting from approved to rejected/pending: deduct previously credited funds
      await Campaign.findByIdAndUpdate(donation.campaign, {
        $inc: { raisedAmount: -donation.amount },
      });
      donation.campaignFunded = false;
    }

    let emailSentResult = null;

    // 2. When admin approves, automatically generate PDF receipt and email to donor notifying of approval
    if (status === 'Approved') {
      emailSentResult = await sendDonationReceiptEmail(donation);
      if (emailSentResult.sent) {
        donation.receiptSent = true;
        donation.receiptSentAt = new Date();
        donation.receiptNumber = emailSentResult.receiptNumber;
        donation.receiptError = '';
      } else {
        donation.receiptSent = false;
        donation.receiptError = emailSentResult.error || 'Failed to send email';
      }
    }

    await donation.save();
    await donation.populate('user', 'name email phone');
    await donation.populate('reviewedBy', 'name email');
    await donation.populate('campaign', 'title category targetAmount raisedAmount');

    let responseMessage = `Donation status updated to ${status}`;
    if (status === 'Approved') {
      const campaignNotice = donation.campaignTitle ? ` and added to "${donation.campaignTitle}" fund` : '';
      if (donation.receiptSent) {
        responseMessage = `Donation approved${campaignNotice}! Official PDF receipt (${donation.receiptNumber}) emailed to ${donation.donorEmail}.`;
      } else {
        responseMessage = `Donation approved${campaignNotice}. (Note: Email receipt not sent: ${donation.receiptError})`;
      }
    }

    return res.status(200).json({
      success: true,
      message: responseMessage,
      data: donation,
      emailSent: Boolean(donation.receiptSent),
    });
  } catch (error) {
    next(error);
  }
};

const resendReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id);
    if (!donation) {
      return next(createError('Donation not found', 404));
    }

    if (donation.status !== 'Approved') {
      return next(createError('Receipt can only be sent for approved donations', 400));
    }

    const emailResult = await sendDonationReceiptEmail(donation);
    if (emailResult.sent) {
      donation.receiptSent = true;
      donation.receiptSentAt = new Date();
      donation.receiptNumber = emailResult.receiptNumber;
      donation.receiptError = '';
      await donation.save();

      return res.status(200).json({
        success: true,
        message: `Official PDF receipt successfully emailed to ${donation.donorEmail}!`,
        data: donation,
      });
    } else {
      donation.receiptError = emailResult.error || 'Failed to send';
      await donation.save();

      return res.status(400).json({
        success: false,
        message: `Failed to send email receipt: ${emailResult.error}`,
        data: donation,
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteDonation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findById(id);
    if (!donation) {
      return next(createError('Donation record not found', 404));
    }

    // 1. If donation was approved and campaign fund was credited, reverse the campaign fund
    if (donation.status === 'Approved' && donation.campaign && donation.campaignFunded) {
      await Campaign.findByIdAndUpdate(donation.campaign, {
        $inc: { raisedAmount: -donation.amount },
      });
    }

    // 2. Delete screenshot file on disk first
    if (donation.screenshot) {
      await removeFileFromDisk(donation.screenshot);
    }

    // 3. Delete donation record from database
    await Donation.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: 'Donation record deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

const downloadReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id);
    if (!donation) {
      return next(createError('Donation record not found', 404));
    }

    if (req.user?.role !== UserRole.ADMIN) {
      if (!donation.user || donation.user.toString() !== req.user._id.toString()) {
        return next(createError('Unauthorized to access this receipt', 403));
      }
    }

    if (donation.status !== 'Approved') {
      return next(createError('Receipt is only available for approved donations', 400));
    }

    const emailSetting = await EmailSetting.findOne().lean().catch(() => ({}));
    const pdfBuffer = await generateReceiptPdf(donation, emailSetting || {});

    const receiptNum = donation.receiptNumber || `SG-REC-${donation._id.toString().slice(-6).toUpperCase()}`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Donation_Receipt_${receiptNum}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const getTopContributors = async (req, res, next) => {
  try {
    // 1. Fetch all donations that are not rejected
    const donations = await Donation.find({ status: { $ne: 'Rejected' } })
      .populate('user', 'name email phone role profilePicture volunteerId memberId')
      .lean();

    // 2. Aggregate by user ID or donorEmail
    const donorAggregates = {};

    donations.forEach((d) => {
      const u = d.user;
      const key = u?._id
        ? String(u._id)
        : (d.donorEmail || d.donorName || String(d._id)).toLowerCase();

      if (!donorAggregates[key]) {
        donorAggregates[key] = {
          id: u?._id || d._id,
          name: u?.name || d.donorName || 'Anonymous Donor',
          email: u?.email || d.donorEmail || '',
          phone: u?.phone || d.donorPhone || '',
          role: u?.role || 'donor',
          profilePicture: u?.profilePicture || '',
          totalAmount: 0,
          donationCount: 0,
          lastDonatedAt: d.createdAt,
          campaigns: [],
        };
      }

      donorAggregates[key].totalAmount += Number(d.amount) || 0;
      donorAggregates[key].donationCount += 1;
      if (d.campaignTitle && !donorAggregates[key].campaigns.includes(d.campaignTitle)) {
        donorAggregates[key].campaigns.push(d.campaignTitle);
      }
      if (new Date(d.createdAt) > new Date(donorAggregates[key].lastDonatedAt)) {
        donorAggregates[key].lastDonatedAt = d.createdAt;
      }
    });

    // 3. Permanent founding contributors
    const permanentFounders = [
      {
        id: 'founder-1',
        name: 'Hari Om',
        role: 'Co-Founder & Managing Trustee',
        profilePicture: '/founders/HariOm.jpeg',
        totalAmount: 300000,
        donationCount: 1,
        tag: 'Founding Patron',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        isFounder: true,
      },
      {
        id: 'founder-2',
        name: 'Ankit Pandey',
        role: 'Co-Founder & Trustee',
        profilePicture: '/founders/AnkitPandey.jpeg',
        totalAmount: 250000,
        donationCount: 1,
        tag: 'Founding Patron',
        badge: 'bg-stone-200 text-stone-800 border-stone-300',
        isFounder: true,
      },
    ];

    // Convert aggregated donors to list
    const realDonorsList = Object.values(donorAggregates).map((item) => {
      let tag = 'Compassionate Donor';
      let badge = 'bg-blue-50 text-blue-800 border-blue-200';

      if (item.totalAmount >= 100000) {
        tag = 'Diamond Patron';
        badge = 'bg-amber-100 text-amber-900 border-amber-300';
      } else if (item.totalAmount >= 25000) {
        tag = 'Gold Benefactor';
        badge = 'bg-yellow-100 text-yellow-900 border-yellow-300';
      } else if (item.totalAmount >= 5000) {
        tag = 'Honorary Benefactor';
        badge = 'bg-orange-100 text-orange-900 border-orange-300';
      } else if (item.totalAmount >= 1000) {
        tag = 'Community Supporter';
        badge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      }

      return {
        ...item,
        tag,
        badge,
        isFounder: false,
      };
    });

    // Merge founding patrons and real donors (avoiding duplicates if names match)
    const combined = [...permanentFounders];

    realDonorsList.forEach((realDonor) => {
      const existingIdx = combined.findIndex(
        (f) => f.name.toLowerCase() === realDonor.name.toLowerCase()
      );
      if (existingIdx !== -1) {
        combined[existingIdx].totalAmount += realDonor.totalAmount;
        combined[existingIdx].donationCount += realDonor.donationCount;
        if (realDonor.profilePicture) {
          combined[existingIdx].profilePicture = realDonor.profilePicture;
        }
      } else {
        combined.push(realDonor);
      }
    });

    // Sort descending by totalAmount
    combined.sort((a, b) => b.totalAmount - a.totalAmount);

    // Pick top 5
    const top5 = combined.slice(0, 5).map((d, index) => ({
      ...d,
      rank: index + 1,
      formattedAmount: '₹' + Number(d.totalAmount).toLocaleString('en-IN'),
    }));

    return res.status(200).json({
      success: true,
      count: top5.length,
      data: top5,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDonationSettings,
  saveDonationSettings,
  deleteDonationSettings,
  getEmailSettings,
  saveEmailSettings,
  testEmailSettings,
  resendReceipt,
  downloadReceipt,
  submitDonation,
  getUserDonations,
  getAdminDonations,
  updateDonationStatus,
  deleteDonation,
  getTopContributors,
};
