module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['./jest.setup.js'],
};
