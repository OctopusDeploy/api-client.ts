const path = require("path");

module.exports = {
    preset: "ts-jest/presets/js-with-ts",
    globals: {
        "ts-jest": {
            tsConfig: path.resolve("jest.tsconfig.json"),
        },
    },
    projects: [
        {
            displayName: "test",
            transform: {
                ".(ts)": "ts-jest",
            },
            testRegex: ".*\\.(test|spec)\\.(ts)$",
            moduleDirectories: ["<rootDir>/src/", "node_modules"],
            moduleFileExtensions: ["ts", "js"],
            setupFilesAfterEnv: ["jest-expect-message", "jest-extended"],
            resetMocks: true,
        },
    ],
};
