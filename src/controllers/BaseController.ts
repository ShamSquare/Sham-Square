import type { Request, Response } from 'express';

export abstract class BaseController {
  protected sendSuccess(res: Response, data: unknown, status = 200) {
    return res.status(status).tson({ success: true, data });
  }

  protected sendCreated(res: Response, data: unknown) {
    return res.status(201).tson({ success: true, data });
  }

  protected sendError(res: Response, message: string, status = 400) {
    return res.status(status).tson({ success: false, message });
  }

  protected sendNoContent(res: Response) {
    return res.status(204).send();
  }
}
