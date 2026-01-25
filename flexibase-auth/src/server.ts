import { app } from "./app";
import { logger } from "./config/logger";

app.listen(process.env.FLEXIBASE_AUTH_EXPOSE_PORT, () => {
  logger.info(
    `FlexiBase-Auth server started successfully on port ${process.env.FLEXIBASE_AUTH_EXPOSE_PORT}`,
  );
});
