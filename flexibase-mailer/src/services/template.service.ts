import hbs from "handlebars";
import fs from "fs/promises";
import path from "path";
import { logger } from "../config/logger";

class TemplateService {
  private templatesPath = path.join(__dirname, "../templates");

  /**
   * Render a template with context
   */
  /**
   * Render a template with context and optional locale
   */
  async render(
    templateId: string,
    context: Record<string, any>,
    locale?: string,
  ): Promise<string> {
    try {
      let filePath = path.join(this.templatesPath, `${templateId}.hbs`);

      if (locale) {
        const localePath = path.join(
          this.templatesPath,
          `${templateId}.${locale}.hbs`,
        );
        try {
          await fs.access(localePath);
          filePath = localePath;
        } catch {
          logger.warn(
            `Locale template ${templateId}.${locale}.hbs not found, falling back to default.`,
          );
        }
      }

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
