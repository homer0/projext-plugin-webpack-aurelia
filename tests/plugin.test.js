jest.unmock('/src/plugin');

require('jasmine-expect');

const ProjextAureliaPlugin = require('/src/plugin');

describe('plugin:projextAurelia/main', () => {
  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new ProjextAureliaPlugin();
    // Then
    expect(sut).toBeInstanceOf(ProjextAureliaPlugin);
  });
});
