/* eslint-disable */
export default {
  displayName: 'chatbot-stores',
  preset: '../../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/chatbot/stores',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
};
