module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/config/prismaMock.ts"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};
