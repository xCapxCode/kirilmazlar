import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      ".github/",
      "public/",
      "debug-*.js",
      "test-*.js"
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  pluginJs.configs.recommended,
  {
    ...pluginReactConfig,
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      // React specific rules
      "react/prop-types": "error",
      "react/no-unused-prop-types": "warn",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",

      // General rules
      "no-unused-vars": "warn",
      "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
      "prefer-const": "error",
      "no-var": "error",

      // ES6+ rules
      "arrow-spacing": "error",
      "object-shorthand": "warn",
      "template-curly-spacing": ["error", "never"]
    }
  }
];
