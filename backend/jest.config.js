module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "mock-server.js",
    "!src/**/*.test.js"
  ],
  testMatch: [
    "**/tests/**/*.test.js"
  ],
  verbose: true,
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
