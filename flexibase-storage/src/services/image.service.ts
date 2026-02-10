import sharp from "sharp";

export interface ResizeOptions {
  width?: number;
  height?: number;
  format?: "webp" | "jpeg" | "png";
}

export const imageService = {
  /**
   * Process an image buffer based on provided options
   */
  processImage: async (
    buffer: Buffer,
    options: ResizeOptions,
  ): Promise<{ buffer: Buffer; info: sharp.OutputInfo }> => {
    let pipeline = sharp(buffer);

    // Resize if options provided
    if (options.width || options.height) {
      pipeline = pipeline.resize({
        width: options.width,
        height: options.height,
        fit: "cover", // Default fit
      });
    }

    // Convert format if requested
    if (options.format) {
      pipeline = pipeline.toFormat(options.format);
    }

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    return { buffer: data, info };
  },

  /**
   * Check if a mime type is supported for optimization
   */
  isSupportedImage: (mimeType: string): boolean => {
    return [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ].includes(mimeType.toLowerCase());
  },
};
