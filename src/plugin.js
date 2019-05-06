/*eslint-disable */
const path = require('path');
const { AureliaPlugin } = require('aurelia-webpack-plugin');
/**
 * It updates a target webpack and Babel configuration in order to work with the Aurelia framework.
 */
class ProjextAureliaPlugin {
  /**
   * Class constructor.
   * @ignore
   */
  constructor() {
    /**
     * A dictionary with familiar names for all the events the plugin will listen and use in order
     * to modify the target configurations.
     * @type {Object}
     * @access protected
     * @ignore
     */
    this._events = {
      htmlRules: 'webpack-html-rules-configuration-for-browser',
      allRules: 'webpack-rules-configuration-for-browser',
      baseConfiguration: 'webpack-base-configuration-for-browser',
      configuration: 'webpack-browser-configuration',
      babelConfiguration: 'babel-configuration',
      externalSettings: 'webpack-externals-configuration-for-browser',
    };
    /**
     * The list of Aurelia packages that should never end up on the bundle if the target is a
     * library.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._externalModules = [
      'aurelia-framework',
      'aurelia-pal',
    ];
    /**
     * A dictionary with familiar names for the loaders that will be added to the webpack
     * configuration.
     * @type {Object}
     * @access protected
     * @ignore
     */
    this._loaders = {
      cleanExtract: 'aurelia-extract-clean-loader',
      htmlRequires: 'aurelia-webpack-plugin/html-requires-loader',
      htmlModulesFix: path.resolve(path.join(__dirname, 'htmlLoader')),
    };
    /**
     * A list of Babel plugins that need to be on the target Babel configuration in order to
     * work with Aurelia.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._babelRequiredPlugins = [
      'transform-class-inject-directive',
      ['@babel/plugin-proposal-decorators', {
        legacy: true,
      }],
      ['@babel/plugin-proposal-class-properties', {
        loose: true,
      }],
    ];
    /**
     * The required value a target `framework` setting needs to have in order for the plugin to
     * modify a configuration.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._frameworkProperty = 'aurelia';
    /**
     * The name of the entry point that webpack will use in order for Aurelia to resolve all the
     * imports.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._aureliaEntry = 'aurelia-bootstrapper';
  }
  /**
   * This is the method called when the plugin is loaded by projext. It setups all the listeners
   * for the events the plugin needs to intercept in order to:
   * 1. Update the target HTML rules to include the `aurelia-extract-clean-loader` loader.
   * 2. Manually add the `aurelia-webpack-plugin/html-requires-loader`.
   * 3. Add the target source directory for modules resolution.
   * 4. Update the webpack entry point and add the Aurelia plugin for webpack.
   * 5. Update the target Babel configuration.
   * 6. Filter Aurelia packages if the target is a library.
   * @param {Projext} app The projext main container
   */
  register(app) {
    // Get the `events` service to listen for the events.
    const events = app.get('events');
    // Get the `babelHelper` to send to the method that adds support validates the plugins.
    const babelHelper = app.get('babelHelper');
    // Add the listener that will push the _"extract clean loader"_.
    events.on(this._events.htmlRules, (rules, params) => this._filterEvent(
      this._updateHTMLRules,
      rules,
      params
    ));
    // Add the listener that will push the Aurelia HTML loader.
    events.on(this._events.allRules, (data, params) => this._filterEvent(
      this._addExtraHTMLRules,
      data,
      params
    ));
    // Add the listener that will update the modules resolution directories list.
    events.on(this._events.baseConfiguration, (config, params) => this._filterEvent(
      this._addModulesResolution,
      config,
      params
    ));
    // Add the listener that will update the webpack entry point and add the Aurelia plugin.
    events.on(this._events.configuration, (config, params) => this._filterEvent(
      this._updateTargetEntryAndPlugins,
      config,
      params
    ));
    // Add the listener that will update the target Babel configuration.
    events.on(this._events.babelConfiguration, (config, target) => this._filterEvent(
      this._updateBabelConfiguration,
      config,
      { target },
      babelHelper
    ));
    // Add the listener that will push the Aurelia packages to the _"externals"_ list.
    events.on(this._events.externalSettings, (externals, params) => this._filterEvent(
      this._updateExternals,
      externals,
      params
    ));
  }
  /**
   * Updates a target HTML rules and adds:
   * - The `aurelia-extract-clean-loader` loader and the, which allows you to extract all your CSS
   * imported from HTML with `mini-css-extract-plugin`.
   * - The custom loader the fixes HTML modules being exported with ES modules syntax, so they
   * won't break the Aurelia's loader (which doesn't support `export default`).
   * @param {Array} rules The original rules.
   * @return {Array}
   * @access protected
   * @ignore
   */
  _updateHTMLRules(rules) {
    const newRules = rules.slice();
    const [firstRule] = newRules;
    firstRule.use.unshift(...[
      this._loaders.cleanExtract,
      this._loaders.htmlModulesFix,
    ]);
    return newRules;
  }
  /**
   * Updates a target rules configuration and pushes a new one to manually add the
   * `aurelia-webpack-plugin/html-requires-loader` loader. The reason we do this is because
   * if the `HtmlWebpackPlugin` detects another loader for HTML, it doesn't use the `html-loader`
   * on the target HTML file.
   * @param {Object} config       The target rules configuration.
   * @param {Array}  config.rules The list of rules.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _addExtraHTMLRules(config) {
    const newConfig = Object.assign({}, config);
    newConfig.rules.push({
      test: /\.html?$/,
      exclude: /\.tpl\.html/,
      use: [this._loaders.htmlRequires],
    });

    return newConfig;
  }
  /**
   * Updates the paths from where webpack can resolve modules in order to add the target source
   * directory. This is so aurelia can automatically find components and views.
   * @param {Object}                     config                 The webpack configuration to
   *                                                            update.
   * @param {Object}                     config.resolve         The webpack configuration for
   *                                                            resolution.
   * @param {Object}                     config.resolve.modules The list of paths where webpack
   *                                                            can find modules.
   * @param {WebpackConfigurationParams} params                 A dictionary generated by the
   *                                                            webpack plugin with all the
   *                                                            information about the bundle: The
   *                                                            target, the build type, the output
   *                                                            paths, etc.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _addModulesResolution(config, params) {
    const newConfig = Object.assign({}, config);
    newConfig.resolve.modules.unshift(params.target.paths.source);
    return newConfig;
  }
  /**
   * Updates webpack entry point and plugins in order to add the Aurelia specific entry and plugin
   * (required in order to work with the framework).
   * @param {Object}                     config The webpack configuration for a target.
   * @param {WebpackConfigurationParams} params A dictionary generated by the webpack plugin with
   *                                            all the information about the bundle: The target,
   *                                            the build type, the output paths, etc.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _updateTargetEntryAndPlugins(config, params) {
    const { target, buildType } = params;
    const newConfig = Object.assign({}, config);
    const targetEntryFile = path.join(target.paths.source, target.entry[buildType]);
    const entries = newConfig.entry[target.name];
    // If the entry is on a list...
    if (Array.isArray(entries)) {
      // ...find the target entry.
      const targetEntryIndex = entries.findIndex((entry) => entry === targetEntryFile);
      /**
       * ...if the target entry was found, replace it with the one for Aurelia; otherwise, just
       * push the one for Aurelia to the list.
       */
      if (targetEntryIndex > -1) {
        newConfig.entry[target.name][targetEntryIndex] = this._aureliaEntry;
      } else {
        newConfig.entry[target.name].push(this._aureliaEntry);
      }
    } else {
      // ...otherwise, replace the entry with the one for Aurelia.
      newConfig.entry[target.name] = this._aureliaEntry;
    }
    /**
     * Filter the plugins by type, as the `HtmlWebpackPlugin` and its plugins need to be before
     * the one for Aurelia, and rebuild the plugins list.
     */
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
  /**
   * Update a target Babel's configuration in order to push the necessary plugins to work
   * with Aurelia.
   * @param {Object}      currentConfiguration The current Babel configuration for the target.
   * @param {Object}      params               An object with the information of the target
   *                                           being bundled.
   * @param {Target}      params.target        The target information.
   * @param {BabelHelper} babelHelper          To update the target configuration and add the
   *                                           required preset and plugin.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _updateBabelConfiguration(currentConfiguration, params, babelHelper) {
    let newConfig = Object.assign({}, currentConfiguration);
    this._babelRequiredPlugins.forEach((plugin) => {
      newConfig = babelHelper.addPlugin(newConfig, plugin);
    });

    return newConfig;
  }
  /**
   * Updates the dictionary of external modules to ensure non Aurelia packages will end up inside
   * the bundle when the target is a library.
   * @param {Object}                     currentExternals A dictionary of external dependencies
   *                                                      with the format webpack uses:
   *                                                      `{ 'module': 'commonjs module'}`.
   * @param {WebpackConfigurationParams} params           A dictionary generated by the webpack
   *                                                      plugin with all the information about
   *                                                      the bundle: The target, the build type,
   *                                                      the output paths, etc.
   * @return {Object}
   * @access protected
   * @ignore
   */
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
  /**
   * This is a helper method that all the event listeners use in order to prevent a method to
   * be called if the target for that event doesn't use Aurelia. It does it by checking the
   * target `framework` property.
   * @param {Function}                          method        The method to be called if the target
   *                                                          uses Aurelia.
   * @param {Object|Array}                      obj           The object the event is updating.
   * @param {WebpackConfigurationParams|Object} params        A dictionary generated by the webpack
   *                                                          plugin with all the information
   *                                                          about the bundle: The target, the
   *                                                          build type, the output paths, etc.
   * @param {Target}                            params.target The target information.
   * @param {...*}                              args          Extra parameters for the method that
   *                                                          will process the event in case the
   *                                                          target uses Aurelia.
   * @return {Object|Array} If the target uses Aurelia, it will call the `method` parameter and
   *                        return whatever it returns; but if the target doesn't use Aurelia,
   *                        it will return the original `obj`.
   * @access protected
   * @ignore
   */
  _filterEvent(method, obj, params, ...args) {
    let result;
    if (params.target.framework === this._frameworkProperty) {
      result = method.bind(this)(obj, params, ...args);
    } else {
      result = obj;
    }

    return result;
  }
  /**
   * This is a helper method that _"categorizes"_ a list of plugins: the `HtmlWebpackPlugin` and
   * its plugins on one side and then the other plugins.
   * The reason is that the configuration needs to have, first the `HtmlWebpackPlugin` and its
   * plugins, then the Aurelia plugin and then the other ones.
   * @param {Array} plugins The list of plugins to _"categorize"_.
   * @return {Object} A dictionary with the categories.
   * @property {Array} html   The list with the `HtmlWebpackPlugin` and its plugin.
   * @property {Array} others The other plugins.
   * @access protected
   * @ignore
   */
  _filterHTMLPlugins(plugins) {
    const html = [];
    const others = [];
    plugins.forEach((instance) => {
      if (
        instance.constructor &&
        instance.constructor.name &&
        instance.constructor.name.match(/HtmlWebpackPlugin/)
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
}

module.exports = ProjextAureliaPlugin;
