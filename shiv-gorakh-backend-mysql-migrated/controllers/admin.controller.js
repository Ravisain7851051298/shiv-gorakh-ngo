const authService = require('../services/auth.services');
const adminService = require('../services/admin.service');
const { UserRole } = require('../constants/app.constants');
const { sendTokenResponse, handleAuthError } = require('../utils/auth-response.util');

const registerAdmin = async (req, res, next) => {
  try {
    const result = await authService.register(
      req.body,
      UserRole.ADMIN,
      req.get('x-admin-secret-key'),
    );
    sendTokenResponse(res, 201, 'User registered successfully', result);
  } catch (error) {
    handleAuthError(error, next);
  }
};

function handleAdminError(error, next) {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    error.status = 400;
  }
  return next(error);
}

function createProfileHandlers(profileType, responseName, pluralName) {
  return {
    list: async (req, res, next) => {
      try {
        const result = await adminService.listProfiles(profileType, req.query);
        return res.status(200).json({
          success: true,
          message: `${pluralName} retrieved successfully`,
          [pluralName]: result.profiles,
          pagination: result.pagination,
        });
      } catch (error) {
        return handleAdminError(error, next);
      }
    },
    get: async (req, res, next) => {
      try {
        const profile = await adminService.getProfile(profileType, req.params.id);
        return res.status(200).json({
          success: true,
          message: `${responseName} retrieved successfully`,
          [responseName]: profile,
        });
      } catch (error) {
        return handleAdminError(error, next);
      }
    },
    update: async (req, res, next) => {
      try {
        const profile = await adminService.updateProfile(profileType, req.params.id, req.body);
        return res.status(200).json({
          success: true,
          message: `${responseName} updated successfully`,
          [responseName]: profile,
        });
      } catch (error) {
        return handleAdminError(error, next);
      }
    },
    remove: async (req, res, next) => {
      try {
        await adminService.deleteProfile(profileType, req.params.id);
        return res.status(200).json({
          success: true,
          message: `${responseName} deleted successfully`,
        });
      } catch (error) {
        return handleAdminError(error, next);
      }
    },
  };
}

const volunteerProfiles = createProfileHandlers('volunteer', 'volunteer', 'volunteers');
const membershipProfiles = createProfileHandlers('membership', 'membership', 'memberships');

const getAnalyticsSummary = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardAnalytics();
    return res.status(200).json({
      success: true,
      message: 'Dashboard analytics retrieved successfully',
      data,
    });
  } catch (error) {
    return handleAdminError(error, next);
  }
};

module.exports = {
  registerAdmin,
  volunteerProfiles,
  membershipProfiles,
  getAnalyticsSummary,
};