jest.unmock('/src/index');

require('jasmine-expect');

const ProjextAureliaPlugin = require('/src/plugin');
const plugin = require('/src/index');

describe('plugin:projextAurelia', () => {
  it('should call the `register` method of the plugin main class', () => {
    // Given
    const app = 'projextApp';
    // When
    plugin(app);
    // Then
    expect(ProjextAureliaPlugin).toHaveBeenCalledTimes(1);
    expect(ProjextAureliaPlugin.mock.instances.length).toBe(1);
    expect(ProjextAureliaPlugin.mock.instances[0].register).toHaveBeenCalledTimes(1);
    expect(ProjextAureliaPlugin.mock.instances[0].register).toHaveBeenCalledWith(app);
  });
});
