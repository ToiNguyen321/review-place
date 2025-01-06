const express = require("express");
const { AppSetting } = require("../../models");
const { uResponse } = require("../../utils");
const router = express.Router();

// Dữ liệu cấu hình
const appConfig = {
  appName: "MyApp",
  version: "1.0.0",
  features: {
    enableChat: true,
    enableNotifications: true,
  },
  maintenance: {
    isUnderMaintenance: false,
    message: "The app is currently under maintenance. Please try again later.",
  },
  support: {
    email: "support@myapp.com",
    phone: "+1-800-123-4567",
  },
};

router.get("/config", async (req, res) => {
  try {
    const config = await AppSetting.findOne({ isActive: true }).lean();
    if (!config) {
      return uResponse.createResponse(
        res,
        404,
        appConfig,
        "Config not found",
        true
      );
    }
    return uResponse.createResponse(res, 200, config);
  } catch (error) {
    return uResponse.createResponse(res, 500, appConfig, error.message, error);
  }
});

module.exports = router;
