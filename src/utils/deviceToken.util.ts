/**
 * Device Token Management Utility
 * Handle FCM token registration, updates, and cleanup
 */

import { Types } from 'mongoose';
import UserDeviceModel, { DeviceType } from '../database/models/UserDevice.js';
import logger from './logger.util.js';

export interface IRegisterDevicePayload {
  userId: Types.ObjectId;
  fcmToken: string;
  deviceType: DeviceType;
}

export interface IDeviceTokenResult {
  success: boolean;
  message: string;
  deviceId?: string;
}

/**
 * Register or update user device
 */
export const registerDevice = async (
  payload: IRegisterDevicePayload
): Promise<IDeviceTokenResult> => {
  try {
    const { userId, fcmToken, deviceType } = payload;

    // Check if device already exists
    const existingDevice = await UserDeviceModel.findOne({
      userId,
      fcmToken,
    });

    let device;

    if (existingDevice) {
      // Update existing device
      device = await UserDeviceModel.findByIdAndUpdate(
        existingDevice._id,
        {
          deviceType,
          isActive: true,
        },
        { new: true }
      );

      logger.info(`Device updated for user: ${userId}`);
    } else {
      // Create new device
      device = await UserDeviceModel.create({
        userId,
        fcmToken,
        deviceType,
        isActive: true,
      });

      logger.info(`New device registered for user: ${userId}`);
    }

    return {
      success: true,
      message: 'Device registered successfully',
      deviceId: device._id.toString(),
    };
  } catch (error) {
    logger.error('Error registering device', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Unregister device (deactivate)
 */
export const unregisterDevice = async (fcmToken: string): Promise<IDeviceTokenResult> => {
  try {
    const result = await UserDeviceModel.findOneAndUpdate(
      { fcmToken },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return {
        success: false,
        message: 'Device not found',
      };
    }

    logger.info(`Device unregistered: ${fcmToken}`);

    return {
      success: true,
      message: 'Device unregistered successfully',
    };
  } catch (error) {
    logger.error('Error unregistering device', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get all active FCM tokens for a user
 */
export const getUserFCMTokens = async (userId: Types.ObjectId): Promise<string[]> => {
  try {
    const devices = await UserDeviceModel.find({
      userId,
      isActive: true,
    });

    return devices.map((device) => device.fcmToken);
  } catch (error) {
    logger.error('Error fetching user FCM tokens', error);
    return [];
  }
};

/**
 * Get user devices with filters
 */
export const getUserDevices = async (
  userId: Types.ObjectId,
  isActive?: boolean
) => {
  try {
    const query: any = { userId };

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const devices = await UserDeviceModel.find(query).sort({ createdAt: -1 });

    return {
      success: true,
      devices,
      total: devices.length,
    };
  } catch (error) {
    logger.error('Error fetching user devices', error);
    return {
      success: false,
      devices: [],
      total: 0,
    };
  }
};

/**
 * Delete user device
 */
export const deleteDevice = async (deviceId: Types.ObjectId): Promise<IDeviceTokenResult> => {
  try {
    const result = await UserDeviceModel.findByIdAndDelete(deviceId);

    if (!result) {
      return {
        success: false,
        message: 'Device not found',
      };
    }

    logger.info(`Device deleted: ${deviceId}`);

    return {
      success: true,
      message: 'Device deleted successfully',
    };
  } catch (error) {
    logger.error('Error deleting device', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Clear inactive devices for a user
 */
export const clearInactiveDevices = async (userId: Types.ObjectId): Promise<any> => {
  try {
    const result = await UserDeviceModel.deleteMany({
      userId,
      isActive: false,
    });

    logger.info(`Cleared ${result.deletedCount} inactive devices for user: ${userId}`);

    return {
      success: true,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    logger.error('Error clearing inactive devices', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Cleanup expired devices (not accessed in X days)
 */
export const cleanupExpiredDevices = async (daysInactive: number = 30): Promise<any> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const result = await UserDeviceModel.deleteMany({
      updatedAt: { $lt: cutoffDate },
    });

    logger.info(`Cleaned up ${result.deletedCount} expired devices`);

    return {
      success: true,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    logger.error('Error cleaning up expired devices', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get device statistics
 */
export const getDeviceStatistics = async () => {
  try {
    const totalDevices = await UserDeviceModel.countDocuments();
    const activeDevices = await UserDeviceModel.countDocuments({ isActive: true });
    const inactiveDevices = await UserDeviceModel.countDocuments({ isActive: false });

    const devicesByType = await UserDeviceModel.aggregate([
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      success: true,
      totalDevices,
      activeDevices,
      inactiveDevices,
      devicesByType,
    };
  } catch (error) {
    logger.error('Error fetching device statistics', error);
    return {
      success: false,
      totalDevices: 0,
      activeDevices: 0,
      inactiveDevices: 0,
      devicesByType: [],
    };
  }
};

export default {
  registerDevice,
  unregisterDevice,
  getUserFCMTokens,
  getUserDevices,
  deleteDevice,
  clearInactiveDevices,
  cleanupExpiredDevices,
  getDeviceStatistics,
};
