import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  {
    ignores: ["dist/", "node_modules/"],
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
      "react/prop-types": "warn",
      "react/no-unused-prop-types": "warn",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      
      // General rules
      "no-unused-vars": "warn",
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      
      // ES6+ rules
      "arrow-spacing": "error",
      "object-shorthand": "warn",
      "template-curly-spacing": ["error", "never"]
    }
  }
];
