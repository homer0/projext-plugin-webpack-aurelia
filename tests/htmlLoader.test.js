jest.unmock('/src/htmlLoader');

const loader = require('/src/htmlLoader');

describe('plugin:HTMLLoader', () => {
  it('should replace the modules syntax', () => {
    // Given
    const template = '"<template>Rosario</template>"';
    const source = `export default ${template}`;
    const expected = `module.exports = ${template}`;
    let result = null;
    // When
    result = loader(source);
    // Then
    expect(result).toBe(expected);
  });

  it('should replace the modules syntax (with single quotes and weird spacing)', () => {
    // Given
    const template = '\' <template bindings="">Rosario</template>\'';
    const source = `export default ${template}`;
    const expected = `module.exports = ${template}`;
    let result = null;
    // When
    result = loader(source);
    // Then
    expect(result).toBe(expected);
  });

  it('shouldnt replace the module syntax if is not a view template', () => {
    // Given
    const template = '"<div>Rosario</div>"';
    const source = `export default ${template}`;
    let result = null;
    // When
    result = loader(source);
    // Then
    expect(result).toBe(source);
  });
});
