import type { Request, Response } from 'express';
import { snakeCaseToCamelCase } from '../utils/response-transformer.util';

export abstract class BaseController {
  protected sendSuccess(res: Response, data: unknown, status = 200) {
    return res.status(status).json({ success: true, data: snakeCaseToCamelCase(data) });
  }

  protected sendCreated(res: Response, data: unknown) {
    return res.status(201).json({ success: true, data: snakeCaseToCamelCase(data) });
  }

  protected sendError(res: Response, message: string, status = 400) {
    return res.status(status).json({ success: false, message });
  }

  protected sendNoContent(res: Response) {
    return res.status(204).send();
  }
}
