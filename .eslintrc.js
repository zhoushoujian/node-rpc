module.exports = {
  extends: [
    "eslint-config-ts-base"
  ],
  parser: "babel-eslint",
  parserOptions: {
    target: "es5" /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', or 'ESNEXT'. */,
    module: "ESNext" /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */,
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      modules: true,
    },
  },
  globals: {
    logger: true,
    before: true,
    execFunc: true
  },
  rules: {
    'max-len': [
      'error',
      160,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ], //强制行的最大长度
    "no-tabs": 0,
    semi: 0,
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  plugins: ["babel"],
};
