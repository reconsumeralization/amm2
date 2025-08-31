import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/__tests__/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^payload/database$': '<rootDir>/src/__mocks__/payload.js',
    '^payload/config$': '<rootDir>/src/__mocks__/payload.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@payloadcms|@lexical).+\\.(js|jsx|ts|tsx)$',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
}

export default createJestConfig(customJestConfig)
