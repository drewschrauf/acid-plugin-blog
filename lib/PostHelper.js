'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getPosts = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var getPosts = exports.getPosts = function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(postDir) {
        var files, postContents, posts;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return pReaddir(postDir);

                    case 2:
                        files = _context.sent;
                        _context.next = 5;
                        return _promise2.default.all(files.map(function (file) {
                            return pReadFile(_path2.default.join(postDir, file));
                        }));

                    case 5:
                        postContents = _context.sent;
                        posts = postContents.map(function (post) {
                            return _yamlFrontMatter2.default.loadFront(post);
                        }).map(function (post) {
                            return (0, _extends5.default)({}, post, {
                                date: (0, _moment2.default)(post.date, 'YYYY/MM/DD'),
                                content: (0, _marked2.default)(post.__content)
                            });
                        });

                        // check the format

                        posts.forEach(function (post, i) {
                            if (!post.title) {
                                throw new Error('Post must have a title: ' + files[i]);
                            }
                            if (!post.date.isValid()) {
                                throw new Error('Post must have a date in the format YYYY/MM/DD: ' + files[i]);
                            }
                        });

                        return _context.abrupt('return', posts.sort(function (a, b) {
                            return b.date - a.date;
                        }));

                    case 9:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
    return function getPosts(_x) {
        return ref.apply(this, arguments);
    };
}();

exports.buildRoutes = buildRoutes;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _yamlFrontMatter = require('yaml-front-matter');

var _yamlFrontMatter2 = _interopRequireDefault(_yamlFrontMatter);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var POST = 'post';
var LISTING = 'listing';

function pReaddir(dir) {
    return new _promise2.default(function (resolve, reject) {
        _fs2.default.readdir(dir, function (err, files) {
            if (err) {
                return reject(err);
            }
            return resolve(files);
        });
    });
}

function pReadFile(path) {
    return new _promise2.default(function (resolve, reject) {
        _fs2.default.readFile(path, 'utf8', function (err, content) {
            if (err) {
                return reject(err);
            }
            return resolve(content);
        });
    });
}

function routeForPost(format, post) {
    return format.replace('{yyyy}', post.date.year()).replace('{mm}', post.date.month() + 1).replace('{dd}', post.date.date()).replace('{slug}', post.title.toLowerCase().replace(/[^\w\d]+/g, '-'));
}

function routeForListing(format, pageNumber) {
    return format.replace('{idx}', pageNumber);
}

function buildRoutesForPosts(postDir, format) {
    return getPosts(postDir).then(function (posts) {
        return posts.reduce(function (prev, curr) {
            return (0, _extends5.default)({}, prev, (0, _defineProperty3.default)({}, routeForPost(format, curr), {
                type: POST,
                context: (0, _extends5.default)({}, curr, {
                    url: routeForPost(format, curr)
                })
            }));
        }, {});
    });
}

function buildRoutesForListings(postDir, pageSize, format, postFormat) {
    return getPosts(postDir).then(function (posts) {
        var totalPages = Math.ceil(posts.length / pageSize);
        return posts.reduce(function (prev, curr, index) {
            var pageNum = Math.floor(index / pageSize) + 1;
            var route = routeForListing(format, pageNum);
            var post = (0, _extends5.default)({}, curr, { url: routeForPost(postFormat, curr) });
            return (0, _extends5.default)({}, prev, (0, _defineProperty3.default)({}, route, {
                type: LISTING,
                context: {
                    currentPage: pageNum,
                    totalPages: totalPages,
                    posts: prev[route] ? [].concat((0, _toConsumableArray3.default)(prev[route].context.posts), [post]) : [post]
                }
            }));
        }, {});
    });
}

function buildRoutes(options) {
    return _promise2.default.all([buildRoutesForPosts(options.postDir, options.postUrlFormat), buildRoutesForListings(options.postDir, options.pageSize, options.listingUrlFormat, options.postUrlFormat)]).then(function (routesArrays) {
        return (0, _extends5.default)({}, routesArrays[0], routesArrays[1]);
    });
}