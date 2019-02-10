const path = require('path');
const { AureliaPlugin } = require('aurelia-webpack-plugin');

class ProjextAureliaPlugin {
  constructor() {
    this._events = {
      htmlRules: 'webpack-html-rules-configuration-for-browser',
      allRules: 'webpack-rules-configuration-for-browser',
      baseConfiguration: 'webpack-base-configuration-for-browser',
      configuration: 'webpack-browser-configuration',
      babelConfiguration: 'babel-configuration',
      externalSettings: 'webpack-externals-configuration-for-browser',
    };
    this._externalModules = [
      'aurelia-framework',
      'aurelia-pal',
    ];
    this._loaders = {
      cleanExtract: 'aurelia-extract-clean-loader',
      htmlRequires: 'aurelia-webpack-plugin/html-requires-loader',
    };
    this._babelRequiredPlugins = [
      'transform-class-inject-directive',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-decorators',
    ];

    this._frameworkProperty = 'aurelia';
    this._aureliaEntry = 'aurelia-bootstrapper';
    this._htmlPluginNameExpression = /HtmlWebpackPlugin/;
  }

  register(app) {
    const events = app.get('events');
    const babelHelper = app.get('babelHelper');

    events.on(this._events.htmlRules, (rules, params) => this._filterEvent(
      this._updateHTMLRules,
      rules,
      params
    ));

    events.on(this._events.allRules, (data, params) => this._filterEvent(
      this._addExtraHTMLRules,
      data,
      params
    ));

    events.on(this._events.baseConfiguration, (config, params) => this._filterEvent(
      this._addModulesResolution,
      config,
      params
    ));

    events.on(this._events.configuration, (config, params) => this._filterEvent(
      this._updateTargetEntry,
      config,
      params
    ));

    events.on(this._events.babelConfiguration, (config, target) => this._filterEvent(
      this._updateBabelConfiguration,
      config,
      { target },
      babelHelper
    ));

    events.on(this._events.externalSettings, (externals, params) => this._filterEvent(
      this._updateExternals,
      externals,
      params
    ));
  }

  _filterEvent(method, obj, params, ...args) {
    let result;
    if (params.target.framework === this._frameworkProperty) {
      result = method.bind(this)(obj, params, ...args);
    } else {
      result = obj;
    }

    return result;
  }

  _updateHTMLRules(rules) {
    const newRules = rules.slice();
    const [firstRule] = newRules;
    firstRule.use.unshift(this._loaders.cleanExtract);
    return newRules;
  }

  _addExtraHTMLRules(data) {
    const newData = Object.assign({}, data);
    newData.rules.push({
      test: /\.html?$/,
      exclude: /\.tpl\.html/,
      use: [this._loaders.htmlRequires],
    });

    return newData;
  }

  _addModulesResolution(config, params) {
    const newConfig = Object.assign({}, config);
    newConfig.resolve.modules.unshift(params.target.paths.source);
    return newConfig;
  }

  _updateTargetEntry(config, params) {
    const { target, buildType } = params;
    const newConfig = Object.assign({}, config);
    const targetEntryFile = path.join(target.paths.source, target.entry[buildType]);
    const entries = newConfig.entry[target.name];
    if (Array.isArray(entries)) {
      const targetEntryIndex = entries.findIndex((entry) => entry === targetEntryFile);
      if (targetEntryIndex > -1) {
        newConfig.entry[target.name][targetEntryIndex] = this._aureliaEntry;
      } else {
        newConfig.entry[target.name].push(this._aureliaEntry);
      }
    } else {
      newConfig.entry[target.name] = this._aureliaEntry;
    }

    const plugins = this._filterHTMLPlugins(newConfig.plugins);
    newConfig.plugins = [
      ...plugins.html,
      new AureliaPlugin({
        aureliaApp: path.parse(targetEntryFile).name,
        noHtmlLoader: true,
      }),
      ...plugins.others,
    ];

    return newConfig;
  }

  _updateBabelConfiguration(config, params, babelHelper) {
    let newConfig = Object.assign({}, config);
    this._babelRequiredPlugins.forEach((plugin) => {
      newConfig = babelHelper.addPlugin(newConfig, plugin);
    });

    return newConfig;
  }

  _filterHTMLPlugins(plugins) {
    const html = [];
    const others = [];
    plugins.forEach((instance) => {
      if (
        instance.constructor &&
        instance.constructor.name &&
        instance.constructor.name.match(this._htmlPluginNameExpression)
      ) {
        html.push(instance);
      } else {
        others.push(instance);
      }
    });

    return {
      html,
      others,
    };
  }

  _updateExternals(currentExternals, params) {
    let updatedExternals;
    if (params.target.library) {
      updatedExternals = Object.assign({}, currentExternals);
      this._externalModules.forEach((name) => {
        updatedExternals[name] = `commonjs ${name}`;
      });
    } else {
      updatedExternals = currentExternals;
    }

    return updatedExternals;
  }
}

module.exports = ProjextAureliaPlugin;
