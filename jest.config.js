module.exports = {
    clearMocks: true,
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/*.spec.ts"],
    collectCoverage: true,
    coverageReporters: ["json-summary"]
};
