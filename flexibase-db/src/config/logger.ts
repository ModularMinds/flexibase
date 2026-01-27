import winston from "winston";

const { combine, timestamp, printf, colorize, metadata } = winston.format;

const logFormat = printf(({ level, message, timestamp, requestId }) => {
  const rid = requestId ? ` [${requestId}]` : "";
  return `${timestamp}${rid} ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});
