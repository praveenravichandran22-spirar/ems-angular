import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup.jest.ts'],
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/app/core/services/*.ts',
    'src/app/core/guards/*.ts',
    'src/app/core/interceptors/*.ts',
    'src/app/core/constants/*.ts',
    'src/app/store/**/*.reducer.ts',
    'src/app/store/**/*.selectors.ts',
    'src/app/store/**/*.effects.ts',
    '!src/**/*.spec.ts',
  ],
  coverageReporters: ['html', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: { lines: 80 },
  },
};

export default config;
