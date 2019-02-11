jest.unmock('/src/plugin');
jest.mock('aurelia-webpack-plugin');
require('jasmine-expect');

const path = require('path');
const { AureliaPlugin } = require('aurelia-webpack-plugin');
const ProjextAureliaPlugin = require('/src/plugin');

describe('plugin:projextAurelia/main', () => {
  beforeEach(() => {
    AureliaPlugin.mockReset();
  });

  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new ProjextAureliaPlugin();
    // Then
    expect(sut).toBeInstanceOf(ProjextAureliaPlugin);
  });

  it('should register the listeners for the webpack plugin', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    let sut = null;
    const expectedEvents = [
      'webpack-html-rules-configuration-for-browser',
      'webpack-rules-configuration-for-browser',
      'webpack-base-configuration-for-browser',
      'webpack-browser-configuration',
      'babel-configuration',
      'webpack-externals-configuration-for-browser',
    ];
    const expectedServices = Object.keys(services);
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    // Then
    expect(app.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((service) => {
      expect(app.get).toHaveBeenCalledWith(service);
    });
    expect(events.on).toHaveBeenCalledTimes(expectedEvents.length);
    expectedEvents.forEach((eventName) => {
      expect(events.on).toHaveBeenCalledWith(eventName, expect.any(Function));
    });
  });

  it('shouldn\'t update the HTML rules is the target doesn\'t use Aurelia', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'react',
    };
    const params = { target };
    const htmlRules = 'original-html-rules';
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [[, reducer]] = events.on.mock.calls;
    result = reducer(htmlRules, params);
    // Then
    expect(result).toBe(htmlRules);
  });

  it('should update the HTML rules for a target', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'aurelia',
    };
    const params = { target };
    const htmlRules = [{
      use: [],
    }];
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [[, reducer]] = events.on.mock.calls;
    result = reducer(htmlRules, params);
    // Then
    expect(result).toEqual([{
      use: ['aurelia-extract-clean-loader'],
    }]);
  });

  it('should add an extra HTML rule for a target', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'aurelia',
    };
    const params = { target };
    const configuration = {
      rules: [],
    };
    let sut = null;
    let reducer = null;
    let result = null;
    let rule = null;
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [, [, reducer]] = events.on.mock.calls;
    result = reducer(configuration, params);
    [rule] = result.rules;
    // Then
    expect(result).toEqual({
      rules: [{
        test: expect.any(RegExp),
        exclude: expect.any(RegExp),
        use: ['aurelia-webpack-plugin/html-requires-loader'],
      }],
    });
    expect('charito.html').toMatch(rule.test);
    expect('charito.js').not.toMatch(rule.test);
    expect('homer0.tpl.html').toMatch(rule.exclude);
    expect('homer0.html').not.toMatch(rule.exclude);
  });

  it('should add the target directory to the modules resolution path', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const source = './rosario/src';
    const target = {
      framework: 'aurelia',
      paths: {
        source,
      },
    };
    const params = { target };
    const configuration = {
      resolve: {
        modules: [],
      },
    };
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [,, [, reducer]] = events.on.mock.calls;
    result = reducer(configuration, params);
    // Then
    expect(result).toEqual({
      resolve: {
        modules: [source],
      },
    });
  });

  it('should update the target entry and add the Aurelia plugin', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const source = './rosario/src';
    const entry = 'index.js';
    const entryPath = path.join(source, entry);
    const buildType = 'development';
    const target = {
      name: 'my-target',
      framework: 'aurelia',
      entry: {
        [buildType]: entry,
      },
      paths: {
        source,
      },
    };
    const params = { target, buildType };
    const htmlPlugin = {
      constructor: {
        name: 'HtmlWebpackPlugin',
      },
    };
    const otherPlugin = {
      name: 'Charito',
    };
    const configuration = {
      entry: {
        [target.name]: entryPath,
      },
      plugins: [
        otherPlugin,
        htmlPlugin,
      ],
    };
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [,,, [, reducer]] = events.on.mock.calls;
    result = reducer(configuration, params);
    // Then
    expect(result).toEqual({
      entry: {
        [target.name]: 'aurelia-bootstrapper',
      },
      plugins: [
        htmlPlugin,
        expect.any(AureliaPlugin),
        otherPlugin,
      ],
    });
    expect(AureliaPlugin).toHaveBeenCalledTimes(1);
    expect(AureliaPlugin).toHaveBeenCalledWith({
      aureliaApp: path.parse(entry).name,
      noHtmlLoader: true,
    });
  });

  it('should update the target entry when it\'s a list and add the Aurelia plugin', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const source = './rosario/src';
    const polyfillEntry = 'some-polyfill';
    const entry = 'index.js';
    const entryPath = path.join(source, entry);
    const buildType = 'development';
    const target = {
      name: 'my-target',
      framework: 'aurelia',
      entry: {
        [buildType]: entry,
      },
      paths: {
        source,
      },
    };
    const params = { target, buildType };
    const htmlPlugin = {
      constructor: {
        name: 'HtmlWebpackPlugin',
      },
    };
    const otherPlugin = {
      name: 'Charito',
    };
    const configuration = {
      entry: {
        [target.name]: [
          polyfillEntry,
          entryPath,
        ],
      },
      plugins: [
        otherPlugin,
        htmlPlugin,
      ],
    };
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [,,, [, reducer]] = events.on.mock.calls;
    result = reducer(configuration, params);
    // Then
    expect(result).toEqual({
      entry: {
        [target.name]: [
          polyfillEntry,
          'aurelia-bootstrapper',
        ],
      },
      plugins: [
        htmlPlugin,
        expect.any(AureliaPlugin),
        otherPlugin,
      ],
    });
    expect(AureliaPlugin).toHaveBeenCalledTimes(1);
    expect(AureliaPlugin).toHaveBeenCalledWith({
      aureliaApp: path.parse(entry).name,
      noHtmlLoader: true,
    });
  });

  it('should push the Aurelia entry even if it can\'t find the target entry', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const source = './rosario/src';
    const polyfillEntry = 'some-polyfill';
    const unknownEntry = 'unknown-entry';
    const entry = 'index.js';
    const buildType = 'development';
    const target = {
      name: 'my-target',
      framework: 'aurelia',
      entry: {
        [buildType]: entry,
      },
      paths: {
        source,
      },
    };
    const params = { target, buildType };
    const htmlPlugin = {
      constructor: {
        name: 'HtmlWebpackPlugin',
      },
    };
    const otherPlugin = {
      name: 'Charito',
    };
    const configuration = {
      entry: {
        [target.name]: [
          polyfillEntry,
          unknownEntry,
        ],
      },
      plugins: [
        otherPlugin,
        htmlPlugin,
      ],
    };
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [,,, [, reducer]] = events.on.mock.calls;
    result = reducer(configuration, params);
    // Then
    expect(result).toEqual({
      entry: {
        [target.name]: [
          polyfillEntry,
          unknownEntry,
          'aurelia-bootstrapper',
        ],
      },
      plugins: [
        htmlPlugin,
        expect.any(AureliaPlugin),
        otherPlugin,
      ],
    });
    expect(AureliaPlugin).toHaveBeenCalledTimes(1);
    expect(AureliaPlugin).toHaveBeenCalledWith({
      aureliaApp: path.parse(entry).name,
      noHtmlLoader: true,
    });
  });

  it('should update a target Babel configuration', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = {
      addPlugin: jest.fn((config, plugin) => Object.assign({
        plugins: [
          ...config.plugins,
          plugin,
        ],
      })),
    };
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'aurelia',
    };
    const configuration = {
      plugins: [],
    };
    let sut = null;
    let reducer = null;
    let result = null;
    const expectedPlugins = [
      'transform-class-inject-directive',
      ['@babel/plugin-proposal-decorators', {
        legacy: true,
      }],
      ['@babel/plugin-proposal-class-properties', {
        loose: true,
      }],
    ];
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [,,,, [, reducer]] = events.on.mock.calls;
    result = reducer(configuration, target);
    // Then
    expect(result).toEqual({
      plugins: expectedPlugins,
    });
    expect(babelHelper.addPlugin).toHaveBeenCalledTimes(expectedPlugins.length);
    expectedPlugins.reduce((prev, current) => {
      if (prev.length) {
        expect(babelHelper.addPlugin).toHaveBeenCalledWith(
          {
            plugins: prev,
          },
          current
        );
      } else {
        expect(babelHelper.addPlugin).toHaveBeenCalledWith(configuration, current);
      }
      return [...prev, current];
    }, []);
  });

  it('shouldn\'t modify a target externals if the target is a browser app', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'aurelia',
    };
    const params = { target };
    const initialExternals = {};
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [,,,,, [, reducer]] = events.on.mock.calls;
    result = reducer(initialExternals, params);
    // Then
    expect(result).toEqual(initialExternals);
  });

  it('should include the Aurelia packages on the externals for a browser library target', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'aurelia',
      library: true,
    };
    const initialExternals = {
      'colors/safe': 'commonjs colors/safe',
    };
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextAureliaPlugin();
    sut.register(app);
    [,,,,, [, reducer]] = events.on.mock.calls;
    result = reducer(initialExternals, { target });
    // Then
    expect(result).toEqual(Object.assign({}, initialExternals, {
      'aurelia-framework': 'commonjs aurelia-framework',
      'aurelia-pal': 'commonjs aurelia-pal',
    }));
  });
});
