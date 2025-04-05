import pluginJs from '@eslint/js';

export default [
  pluginJs.configs.recommended,

  {
    rules: {
      // Best Practices
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePatten: '^process$' }], // Warn for unused vars, ignore "_" prefix
      'no-undef': 'warn', // Warn for undefined variables
      'no-console': 'warn', // Warn when using console.log
      'eqeqeq': ['error', 'always'], // Enforce strict equality (`===` and `!==`)
      'curly': ['error', 'all'], // Require curly braces for all control structures
      'arrow-parens': ['error', 'always'], // Always use parentheses in arrow functions
      'no-multiple-empty-lines': ['warn', { max: 1 }], // Allow only one empty line
      'no-trailing-spaces': 'warn', // Warn about spaces at the end of lines
      'semi': ['error', 'always'], // Require semicolons
      'quotes': ['error', 'single'], // Enforce single quotes
      'indent': ['error', 2], // Enforce 2-space indentation
      // 'comma-dangle': ['error', 'always-multiline'], // Require trailing commas in multiline objects/arrays
    },

  },
];