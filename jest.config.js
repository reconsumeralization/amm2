import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  modulePaths: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@payloadcms/db-postgres$': '<rootDir>/src/__mocks__/payload-db.js',
    '^@payloadcms/richtext-lexical$': '<rootDir>/src/__mocks__/payload-lexical.js',
    '^@payloadcms/bundler-webpack$': '<rootDir>/src/__mocks__/payload-bundler.js',
    '^payload$': '<rootDir>/src/__mocks__/payload.js',
    'payload/database': '<rootDir>/src/__mocks__/payload.js',
    'payload/config': '<rootDir>/src/__mocks__/payload.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(?:@payloadcms|@lexical)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
}

export default createJestConfig(customJestConfig)