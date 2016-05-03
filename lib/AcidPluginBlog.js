'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!options.templateDir) {
        throw new Error('acid-plugin-blog requires a templateDir');
    }
    if (!options.postDir) {
        throw new Error('acid-plugin-blog requires a postDir');
    }

    var opts = {
        templateDir: _path2.default.resolve(options.templateDir),
        postDir: _path2.default.resolve(options.postDir),
        postUrlFormat: options.postUrlFormat || '/{yyyy}/{mm}/{dd}/{slug}',
        listingUrlFormat: options.listingUrlFormat || '/posts/{idx}',
        pageSize: options.pageSize || 5
    };

    return {
        name: 'blog',
        resolver: {
            resolveContext: function resolveContext(route) {
                return (0, _PostHelper.buildRoutes)(opts).then(function (routes) {
                    return routes[route].context;
                });
            },
            resolveRoutes: function resolveRoutes() {
                return (0, _PostHelper.buildRoutes)(opts).then(function (routes) {
                    return Object.keys(routes);
                });
            },
            resolveTemplate: function resolveTemplate(route) {
                return (0, _PostHelper.buildRoutes)(opts).then(function (routes) {
                    var r = routes[route];
                    return _path2.default.join(opts.templateDir, r.type + '.marko');
                });
            }
        },
        options: opts,
        watchExpressions: [new RegExp(opts.postDir + '/.+.md')]
    };
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _PostHelper = require('./PostHelper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }