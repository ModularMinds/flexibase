import { Request, Response } from "express";
import { templateService } from "../services/template.service";
import juice from "juice";

export const previewEmailController = async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const { context, locale } = req.query;

  try {
    const parsedContext = context ? JSON.parse(context as string) : {};

    let html = await templateService.render(
      templateId,
      parsedContext,
      locale as string,
    );

    // Apply CSS inlining for the preview too
    html = juice(html);

    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (error: any) {
    res.status(400).json({
      isSuccess: false,
      message: error.message,
    });
  }
};
