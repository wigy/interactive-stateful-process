module.exports = {
    "roots": [
      "<rootDir>/src",
      "<rootDir>/tests"
    ],
    "testMatch": [
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
      "^.+\\.ts$": "ts-jest"
    },
  }