import hbs from "handlebars";
import fs from "fs/promises";
import path from "path";
import { logger } from "../config/logger";

class TemplateService {
  private templatesPath = path.join(__dirname, "../templates");

  /**
   * Render a template with context
   */
  async render(
    templateId: string,
    context: Record<string, any>,
  ): Promise<string> {
    try {
      const filePath = path.join(this.templatesPath, `${templateId}.hbs`);
      const source = await fs.readFile(filePath, "utf-8");
      const template = hbs.compile(source);
      return template(context);
    } catch (error) {
      logger.error(`❌ Failed to render template ${templateId}:`, error);
      throw new Error(`Template ${templateId} not found or invalid`);
    }
  }
}

export const templateService = new TemplateService();
