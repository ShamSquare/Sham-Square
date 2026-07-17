import { Request, Response } from 'express';
import deviceUtil from '../utils/deviceToken.util';
import { AppError } from '../utils/app-error.util';
import { BaseController } from './BaseController';

export class DeviceController extends BaseController {
  async register(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const { fcmToken, deviceType } = req.body as any;
    if (!fcmToken || !deviceType) throw new AppError('Missing fields', 400);

    const result = await deviceUtil.registerDevice({ userId, fcmToken, deviceType } as any);
    if (!result.success) throw new AppError(result.message, 500);
    return this.sendSuccess(res, { deviceId: result.deviceId });
  }

  async unregister(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const { fcmToken } = req.body as any;
    if (!fcmToken) throw new AppError('Missing fcmToken', 400);

    const result = await deviceUtil.unregisterDevice(fcmToken);
    if (!result.success) throw new AppError(result.message, 500);
    return this.sendSuccess(res, { message: result.message });
  }

  async list(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const result = await deviceUtil.getUserDevices(userId as any);
    return this.sendSuccess(res, result);
  }
}

export const deviceController = new DeviceController();
