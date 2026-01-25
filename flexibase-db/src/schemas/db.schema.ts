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
