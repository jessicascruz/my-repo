import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  verbose: true,
  clearMocks: true,
  coverageDirectory: './coverage',
  coverageReporters: [
    'clover',
    'text',
    'json',
    'lcov',
    [
      'cobertura',
      {
        outputDirectory: 'coverage',
        outputName: 'cobertura-coverage.xml',
      },
    ],
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['/src/app', '/src/types'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/presentation/(.*)$': '<rootDir>/src/presentation/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  fakeTimers: { enableGlobally: true },
  transformIgnorePatterns: [
    '/node_modules/(?!@iconify/react).+\\.js$', // Ignora a transpilação do @iconify/react
  ],
  modulePathIgnorePatterns: ["@types"]
}

export default createJestConfig(customJestConfig)
