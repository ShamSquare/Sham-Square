import { userDeviceRepository } from '../database/repositories/index;
import type { DeviceType } from '../database/models/UserDevice;
import logger from './logger.util;

export interface IRegisterDevicePayload {
  userId: string;
  fcmToken: string;
  deviceType: DeviceType;
}

export interface IDeviceTokenResult {
  success: boolean;
  message: string;
  deviceId?: string;
}

export const registerDevice = async (
  payload: IRegisterDevicePayload
): Promise<IDeviceTokenResult> => {
  try {
    const { userId, fcmToken, deviceType } = payload;

    const existingDevice = await userDeviceRepository.findOne({
      userId,
      fcmToken,
    });

    let device;

    if (existingDevice) {
      device = await userDeviceRepository.updateById(existingDevice.id, {
        deviceType,
        isActive: true,
      });

      logger.info(`Device updated for user: ${userId}`);
    } else {
      device = await userDeviceRepository.create({
        userId,
        fcmToken,
        deviceType,
        isActive: true,
      });

      logger.info(`New device registered for user: ${userId}`);
    }

    if (!device) {
      return {
        success: false,
        message: 'Failed to create/update device',
      };
    }

    return {
      success: true,
      message: 'Device registered successfully',
      deviceId: device.id,
    };
  } catch (error) {
    logger.error('Error registering device', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const unregisterDevice = async (fcmToken: string): Promise<IDeviceTokenResult> => {
  try {
    const device = await userDeviceRepository.findOne({ fcmToken });

    if (!device) {
      return {
        success: false,
        message: 'Device not found',
      };
    }

    await userDeviceRepository.updateById(device.id, { isActive: false });

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

export const getUserFCMTokens = async (userId: string): Promise<string[]> => {
  try {
    const devices = await userDeviceRepository.find({
      userId,
      isActive: true,
    });

    return devices.map((device) => device.fcmToken);
  } catch (error) {
    logger.error('Error fetching user FCM tokens', error);
    return [];
  }
};

export const getUserDevices = async (
  userId: string,
  isActive?: boolean
) => {
  try {
    const query: any = { userId };

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const devices = await userDeviceRepository.find(query, {
      orderBy: 'createdAt',
      orderDir: 'desc',
    });

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

export const deleteDevice = async (deviceId: string): Promise<IDeviceTokenResult> => {
  try {
    const device = await userDeviceRepository.findById(deviceId);

    if (!device) {
      return {
        success: false,
        message: 'Device not found',
      };
    }

    await userDeviceRepository.deleteById(deviceId);

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

export const clearInactiveDevices = async (userId: string): Promise<any> => {
  try {
    const inactiveDevices = await userDeviceRepository.find({
      userId,
      isActive: false,
    });

    for (const device of inactiveDevices) {
      await userDeviceRepository.deleteById(device.id);
    }

    logger.info(`Cleared ${inactiveDevices.length} inactive devices for user: ${userId}`);

    return {
      success: true,
      deletedCount: inactiveDevices.length,
    };
  } catch (error) {
    logger.error('Error clearing inactive devices', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const cleanupExpiredDevices = async (daysInactive: number = 30): Promise<any> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const allDevices = await userDeviceRepository.find();
    const expiredDevices = allDevices.filter(
      (d) => new Date(d.updatedAt) < cutoffDate
    );

    for (const device of expiredDevices) {
      await userDeviceRepository.deleteById(device.id);
    }

    logger.info(`Cleaned up ${expiredDevices.length} expired devices`);

    return {
      success: true,
      deletedCount: expiredDevices.length,
    };
  } catch (error) {
    logger.error('Error cleaning up expired devices', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getDeviceStatistics = async () => {
  try {
    const allDevices = await userDeviceRepository.find();
    const totalDevices = allDevices.length;
    const activeDevices = allDevices.filter((d) => d.isActive).length;
    const inactiveDevices = totalDevices - activeDevices;
    const devicesByType = Object.entries(
      allDevices.reduce((acc: Record<string, number>, d) => {
        acc[d.deviceType] = (acc[d.deviceType] || 0) + 1;
        return acc;
      }, {})
    ).map(([deviceType, count]) => ({ deviceType, count }));

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
