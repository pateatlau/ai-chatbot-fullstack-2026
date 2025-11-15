const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.base.config.cjs');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/react'].map((config) => {
    // If the config has TypeScript rules, ensure it has the plugin
    if (
      config.rules &&
      Object.keys(config.rules).some((rule) =>
        rule.startsWith('@typescript-eslint/')
      )
    ) {
      return {
        ...config,
        plugins: {
          ...config.plugins,
          '@typescript-eslint': tsPlugin,
        },
      };
    }
    return config;
  }),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
