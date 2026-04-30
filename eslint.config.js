const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

module.exports = [
    js.configs.recommended,
    ...compat.extends("standard"),
    {
        plugins: {
            import: require("eslint-plugin-import"),
            n: require("eslint-plugin-n"),
            promise: require("eslint-plugin-promise"),
        },
        languageOptions: {
            globals: {
                ...require("globals").browser,
                ...require("globals").node,
                ...require("globals").electron,
                __static: true,
            },
            parser: require("@babel/eslint-parser"),
            parserOptions: {
                requireConfigFile: false,
                sourceType: "module",
            },
        },
        rules: {
            "arrow-parens": 0,
            "generator-star-spacing": 0,
            "no-debugger": 0,
            "no-undef": 1,
            "prefer-const": 0,
            "quotes": 0,
            "no-multiple-empty-lines": 0,
            "quote-props": 0,
            "object-curly-spacing": 0,
            "dot-notation": 0,
            "n/no-path-concat": 0,
        },
    },
];
