import { z } from "zod";

export const insertDataSchema = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").max(63),
    data: z
      .record(z.string(), z.any())
      .refine((data) => Object.keys(data).length > 0, {
        message: "Data object must not be empty",
      }),
  }),
});

export const fetchDataSchema = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").max(63),
    columns: z.array(z.string()).optional(),
    filters: z
      .array(
        z.object({
          column: z.string().min(1),
          operator: z.enum([
            "eq",
            "neq",
            "gt",
            "gte",
            "lt",
            "lte",
            "like",
            "in",
          ]),
          value: z.any(),
        }),
      )
      .optional(),
    sort: z
      .object({
        column: z.string().min(1),
        direction: z.enum(["asc", "desc"]).default("asc"),
      })
      .optional(),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().nonnegative().optional(),
  }),
});

export const createTableSchema = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").max(63),
    isAdminOnly: z.boolean().optional().default(false),
    tableColumns: z
      .array(
        z.object({
          name: z.string().min(1).max(63),
          type: z.string().min(1),
          constraints: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

export const deleteTableSchema = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").max(63),
  }),
});

export const getColumnsSchema = z.object({
  query: z.object({
    tableName: z.string().min(1, "Table name is required"),
  }),
});

export const getAuditLogsSchema = z.object({
  query: z.object({
    userId: z.string().optional(),
    tableName: z.string().optional(),
    action: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const createWebhookSchema = z.object({
  body: z.object({
    event: z.string().min(1, "Event is required"),
    targetUrl: z.string().url("Target URL must be valid"),
    secret: z.string().optional(),
  }),
});

export const updateWebhookSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Webhook ID"),
  }),
  body: z.object({
    event: z.string().optional(),
    targetUrl: z.string().url().optional(),
    secret: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteWebhookSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Webhook ID"),
  }),
});

export const updateDataSchema = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").max(63),
    data: z
      .record(z.string(), z.any())
      .refine((data) => Object.keys(data).length > 0, {
        message: "Data object must not be empty",
      }),
    conditions: z
      .record(z.string(), z.any())
      .refine((data) => Object.keys(data).length > 0, {
        message: "Conditions object must not be empty",
      }),
  }),
});

export const deleteDataSchema = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").max(63),
    conditions: z
      .record(z.string(), z.any())
      .refine((data) => Object.keys(data).length > 0, {
        message: "Conditions object must not be empty",
      }),
  }),
});

export const upsertDataSchema = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").max(63),
    data: z
      .record(z.string(), z.any())
      .refine((data) => Object.keys(data).length > 0, {
        message: "Data object must not be empty",
      }),
    conflictColumns: z
      .array(z.string())
      .min(1, "At least one conflict column is required"),
  }),
});

export const alterTableSchema = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").max(63),
    action: z.enum(["ADD", "DROP", "TOGGLE_ADMIN_ONLY"]),
    isAdminOnly: z.boolean().optional(),
    column: z
      .object({
        name: z.string().min(1).max(63),
        type: z.string().min(1).optional(), // Optional for DROP
        constraints: z.string().optional(),
      })
      .optional(),
  }),
});

export const createIndexSchema = z.object({
  body: z.object({
    tableName: z.string().min(1, "Table name is required").max(63),
    indexName: z.string().min(1).max(63),
    columns: z.array(z.string().min(1)).min(1),
    unique: z.boolean().default(false),
  }),
});
