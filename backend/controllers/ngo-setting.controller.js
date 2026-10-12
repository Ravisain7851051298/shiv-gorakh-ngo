const fs = require('fs/promises');
const path = require('path');
const NgoSetting = require('../models/ngo-setting.model');
const { uploadRoot } = require('../middlewares/image-upload.middleware');

async function removeFileFromDisk(relativeUrl) {
  if (!relativeUrl || typeof relativeUrl !== 'string') return;
  // Only remove user-uploaded files from /uploads/
  if (!relativeUrl.startsWith('/uploads/')) return;
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

const getNgoSettings = async (req, res, next) => {
  try {
    let settings = await NgoSetting.findOne();
    if (!settings) {
      settings = await NgoSetting.create({});
    }
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const saveNgoSettings = async (req, res, next) => {
  try {
    let settings = await NgoSetting.findOne();
    const isNew = !settings;
    if (!settings) {
      settings = new NgoSetting();
    }

    const {
      ngoName,
      shortName,
      suffix,
      tagline,
      description,
      logoInitials,
      founderName,
      founderRole,
      founderBio,
      coFounderName,
      coFounderRole,
      coFounderBio,
      email,
      phone,
      alternatePhone,
      whatsapp,
      addressLine,
      city,
      state,
      pincode,
      country,
      mapUrl,
      registrationNumber,
      taxExemption80G,
      facebook,
      instagram,
      twitter,
      youtube,
      linkedin,
      signatoryName,
      signatoryRole,
      removeLogo,
      removeFounderImage,
      removeCoFounderImage,
      removeAuthorizedSignature,
      removePresidentSignature,
      removeSecretarySignature,
      removeStampImage,
    } = req.body;

    // Update String Fields
    if (ngoName !== undefined) settings.ngoName = ngoName.trim();
    if (shortName !== undefined) settings.shortName = shortName.trim();
    if (suffix !== undefined) settings.suffix = suffix.trim();
    if (tagline !== undefined) settings.tagline = tagline.trim();
    if (description !== undefined) settings.description = description.trim();
    if (logoInitials !== undefined) settings.logoInitials = logoInitials.trim().toUpperCase();

    if (founderName !== undefined) settings.founderName = founderName.trim();
    if (founderRole !== undefined) settings.founderRole = founderRole.trim();
    if (founderBio !== undefined) settings.founderBio = founderBio.trim();

    if (coFounderName !== undefined) settings.coFounderName = coFounderName.trim();
    if (coFounderRole !== undefined) settings.coFounderRole = coFounderRole.trim();
    if (coFounderBio !== undefined) settings.coFounderBio = coFounderBio.trim();

    if (email !== undefined) settings.email = email.trim();
    if (phone !== undefined) settings.phone = phone.trim();
    if (alternatePhone !== undefined) settings.alternatePhone = alternatePhone.trim();
    if (whatsapp !== undefined) settings.whatsapp = whatsapp.trim();

    if (addressLine !== undefined) settings.addressLine = addressLine.trim();
    if (city !== undefined) settings.city = city.trim();
    if (state !== undefined) settings.state = state.trim();
    if (pincode !== undefined) settings.pincode = pincode.trim();
    if (country !== undefined) settings.country = country.trim();
    if (mapUrl !== undefined) settings.mapUrl = mapUrl.trim();

    if (registrationNumber !== undefined) settings.registrationNumber = registrationNumber.trim();
    if (taxExemption80G !== undefined) settings.taxExemption80G = taxExemption80G.trim();
    if (facebook !== undefined) settings.facebook = facebook.trim();
    if (instagram !== undefined) settings.instagram = instagram.trim();
    if (twitter !== undefined) settings.twitter = twitter.trim();
    if (youtube !== undefined) settings.youtube = youtube.trim();
    if (linkedin !== undefined) settings.linkedin = linkedin.trim();

    if (signatoryName !== undefined) settings.signatoryName = signatoryName.trim();
    if (signatoryRole !== undefined) settings.signatoryRole = signatoryRole.trim();

    // Handle Uploaded Files
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        if (settings.logo) {
          await removeFileFromDisk(settings.logo);
        }
        settings.logo = `/uploads/ngo-settings/${req.files.logo[0].filename}`;
      }

      if (req.files.founderImage && req.files.founderImage[0]) {
        if (settings.founderImage && settings.founderImage.startsWith('/uploads/')) {
          await removeFileFromDisk(settings.founderImage);
        }
        settings.founderImage = `/uploads/ngo-settings/${req.files.founderImage[0].filename}`;
      }

      if (req.files.coFounderImage && req.files.coFounderImage[0]) {
        if (settings.coFounderImage && settings.coFounderImage.startsWith('/uploads/')) {
          await removeFileFromDisk(settings.coFounderImage);
        }
        settings.coFounderImage = `/uploads/ngo-settings/${req.files.coFounderImage[0].filename}`;
      }

      if (req.files.authorizedSignature && req.files.authorizedSignature[0]) {
        if (settings.authorizedSignature && settings.authorizedSignature.startsWith('/uploads/')) {
          await removeFileFromDisk(settings.authorizedSignature);
        }
        settings.authorizedSignature = `/uploads/ngo-settings/${req.files.authorizedSignature[0].filename}`;
      }

      if (req.files.presidentSignature && req.files.presidentSignature[0]) {
        if (settings.presidentSignature && settings.presidentSignature.startsWith('/uploads/')) {
          await removeFileFromDisk(settings.presidentSignature);
        }
        settings.presidentSignature = `/uploads/ngo-settings/${req.files.presidentSignature[0].filename}`;
      }

      if (req.files.secretarySignature && req.files.secretarySignature[0]) {
        if (settings.secretarySignature && settings.secretarySignature.startsWith('/uploads/')) {
          await removeFileFromDisk(settings.secretarySignature);
        }
        settings.secretarySignature = `/uploads/ngo-settings/${req.files.secretarySignature[0].filename}`;
      }

      if (req.files.stampImage && req.files.stampImage[0]) {
        if (settings.stampImage && settings.stampImage.startsWith('/uploads/')) {
          await removeFileFromDisk(settings.stampImage);
        }
        settings.stampImage = `/uploads/ngo-settings/${req.files.stampImage[0].filename}`;
      }
    }

    // Removals
    if (removeLogo === 'true' || removeLogo === true) {
      if (settings.logo) {
        await removeFileFromDisk(settings.logo);
      }
      settings.logo = '';
    }

    if (removeFounderImage === 'true' || removeFounderImage === true) {
      if (settings.founderImage && settings.founderImage.startsWith('/uploads/')) {
        await removeFileFromDisk(settings.founderImage);
      }
      settings.founderImage = '/founders/HariOm.jpeg';
    }

    if (removeCoFounderImage === 'true' || removeCoFounderImage === true) {
      if (settings.coFounderImage && settings.coFounderImage.startsWith('/uploads/')) {
        await removeFileFromDisk(settings.coFounderImage);
      }
      settings.coFounderImage = '/founders/AnkitPandey.jpeg';
    }

    if (removeAuthorizedSignature === 'true' || removeAuthorizedSignature === true) {
      if (settings.authorizedSignature && settings.authorizedSignature.startsWith('/uploads/')) {
        await removeFileFromDisk(settings.authorizedSignature);
      }
      settings.authorizedSignature = '';
    }

    if (removePresidentSignature === 'true' || removePresidentSignature === true) {
      if (settings.presidentSignature && settings.presidentSignature.startsWith('/uploads/')) {
        await removeFileFromDisk(settings.presidentSignature);
      }
      settings.presidentSignature = '';
    }

    if (removeSecretarySignature === 'true' || removeSecretarySignature === true) {
      if (settings.secretarySignature && settings.secretarySignature.startsWith('/uploads/')) {
        await removeFileFromDisk(settings.secretarySignature);
      }
      settings.secretarySignature = '';
    }

    if (removeStampImage === 'true' || removeStampImage === true) {
      if (settings.stampImage && settings.stampImage.startsWith('/uploads/')) {
        await removeFileFromDisk(settings.stampImage);
      }
      settings.stampImage = '';
    }

    await settings.save();

    return res.status(isNew ? 201 : 200).json({
      success: true,
      message: 'NGO site profile & contact settings updated successfully!',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNgoSettings,
  saveNgoSettings,
};
