/**
 * A regular expression to match HTML views that are expored using the ES modules syntax.
 * @type {RegExp}
 * @ignore
 */
const expression = /^\s*export\s*default\s*(["|']\s*<template\s*)/i;
/**
 * Checks if an HTML file is an Aurelia view that is being exported using ES modules and replaces
 * the syntax in order to use `module.exports`. The issue here is that the Aurelia's webpack
 * plugin doesn't use ES modules and when the view is loaded, the HTML is inside a `default`
 * property, which breaks the Aurelia's loader.
 * @param {String} source The module's code.
 * @return {String}
 */
module.exports = (source) => (
  source.match(expression) ?
    source.replace(expression, 'module.exports = $1') :
    source
);
