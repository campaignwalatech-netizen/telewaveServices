export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\.(css|less)$': '<rootDir>/tests/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
};