import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Flexibase DB API",
      version: "1.0.0",
      description: "API for dynamic database management and CRUD operations",
    },
    servers: [
      {
        url: "/api",
        description: "API Base Path",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routers/*.ts", "./src/controllers/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
