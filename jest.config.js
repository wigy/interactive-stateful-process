module.exports = {
    "roots": [
      "<rootDir>/migrations",
      "<rootDir>/tests",
      "<rootDir>/src"
    ],
    "testMatch": [
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
      "^.+\\.ts$": "ts-jest"
    },
  }