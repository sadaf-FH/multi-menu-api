/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  testMatch: ['**/__tests__/**/*.test.ts'],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/models/**',
  ],

  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
