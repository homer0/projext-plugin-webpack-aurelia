# projext plugin for Aurelia on webpack

[![Travis](https://img.shields.io/travis/homer0/projext-plugin-webpack-aurelia.svg?style=flat-square)](https://travis-ci.org/homer0/projext-plugin-webpack-aurelia)
[![Coveralls github](https://img.shields.io/coveralls/github/homer0/projext-plugin-webpack-aurelia.svg?style=flat-square)](https://coveralls.io/github/homer0/projext-plugin-webpack-aurelia?branch=master)
[![David](https://img.shields.io/david/homer0/projext-plugin-webpack-aurelia.svg?style=flat-square)](https://david-dm.org/homer0/projext-plugin-webpack-aurelia)
[![David](https://img.shields.io/david/dev/homer0/projext-plugin-webpack-aurelia.svg?style=flat-square)](https://david-dm.org/homer0/projext-plugin-webpack-aurelia)

Allows you to bundle an [Aurelia](https://aurelia.io) project with [projext](https://yarnpkg.com/en/package/projext) using the [webpack](https://webpack.js.org) [build engine](https://yarnpkg.com/en/package/projext-plugin-webpack).

## Introduction

...

## Information

| -            | -                                                                                      |
|--------------|----------------------------------------------------------------------------------------|
| Package      | projext-plugin-webpack-aurelia                                                         |
| Description  | Allows you to bundle an Aurelia project with projext using the webpack build engine.   |
| Node Version | >= v8.0.0                                                                              |

## Usage

...

## Development

Before doing anything, install the repository hooks:

```bash
# You can either use npm or yarn, it doesn't matter
yarn run hooks
```

### Yarn/NPM Tasks

| Task                    | Description                         |
|-------------------------|-------------------------------------|
| `yarn run hooks`        | Install the GIT repository hooks.   |
| `yarn test`             | Run the project unit tests.         |
| `yarn run lint`         | Lint the modified files.            |
| `yarn run lint:full`    | Lint the project code.              |
| `yarn run docs`         | Generate the project documentation. |

### Testing

I use [Jest](https://facebook.github.io/jest/) with [Jest-Ex](https://yarnpkg.com/en/package/jest-ex) to test the project. The configuration file is on `./.jestrc`, the tests and mocks are on `./tests` and the script that runs it is on `./utils/scripts/test`.

### Linting

I use [ESlint](http://eslint.org) to validate all our JS code. The configuration file for the project code is on `./.eslintrc` and for the tests on `./tests/.eslintrc` (which inherits from the one on the root), there's also an `./.eslintignore` to ignore some files on the process, and the script that runs it is on `./utils/scripts/lint`.

### Documentation

I use [ESDoc](http://esdoc.org) to generate HTML documentation for the project. The configuration file is on `./.esdocrc` and the script that runs it is on `./utils/scripts/docs`.
