'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getPosts = getPosts;
exports.buildRoutes = buildRoutes;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _yamlFrontMatter = require('yaml-front-matter');

var _yamlFrontMatter2 = _interopRequireDefault(_yamlFrontMatter);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _slug = require('slug');

var _slug2 = _interopRequireDefault(_slug);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var POST = 'post';
var LISTING = 'listing';

function pReaddir(dir) {
    return new Promise(function (resolve, reject) {
        _fs2.default.readdir(dir, function (err, files) {
            if (err) {
                return reject(err);
            }
            return resolve(files);
        });
    });
}

function pReadFile(path) {
    return new Promise(function (resolve, reject) {
        _fs2.default.readFile(path, 'utf8', function (err, content) {
            if (err) {
                return reject(err);
            }
            return resolve(content);
        });
    });
}

function getPosts(postDir) {
    var fileArray = void 0;
    return pReaddir(postDir).then(function (files) {
        fileArray = files;
        return Promise.all(files.map(function (file) {
            return pReadFile(_path2.default.join(postDir, file));
        }));
    }).then(function (posts) {
        return posts.map(function (post) {
            return _yamlFrontMatter2.default.loadFront(post);
        });
    }).then(function (posts) {
        // parse out date and content
        return posts.map(function (post) {
            return _extends({}, post, {
                date: (0, _moment2.default)(post.date, 'YYYY/MM/DD'),
                content: (0, _marked2.default)(post.__content)
            });
        });
    }).then(function (posts) {
        // check the format
        posts.forEach(function (post, i) {
            if (!post.title) {
                throw new Error('Post must have a title: ' + fileArray[i]);
            }
            if (!post.date.isValid()) {
                throw new Error('Post must have a date in the format YYYY/MM/DD: ' + fileArray[i]);
            }
        });

        return posts.sort(function (a, b) {
            return b.date - a.date;
        });
    });
}

function routeForPost(format, post) {
    return format.replace('{yyyy}', post.date.year()).replace('{mm}', post.date.month() + 1).replace('{dd}', post.date.date()).replace('{slug}', (0, _slug2.default)(post.title, { lower: true }));
}

function routeForListing(format, pageNumber) {
    return format.replace('{idx}', pageNumber);
}

function buildRoutesForPosts(postDir, format) {
    return getPosts(postDir).then(function (posts) {
        return posts.reduce(function (prev, curr) {
            return _extends({}, prev, _defineProperty({}, routeForPost(format, curr), {
                type: POST,
                context: _extends({}, curr, {
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
            var post = _extends({}, curr, { url: routeForPost(postFormat, curr) });
            return _extends({}, prev, _defineProperty({}, route, {
                type: LISTING,
                context: {
                    currentPage: pageNum,
                    totalPages: totalPages,
                    posts: prev[route] ? [].concat(_toConsumableArray(prev[route].context.posts), [post]) : [post]
                }
            }));
        }, {});
    });
}

function buildRoutes(options) {
    return Promise.all([buildRoutesForPosts(options.postDir, options.postUrlFormat), buildRoutesForListings(options.postDir, options.pageSize, options.listingUrlFormat, options.postUrlFormat)]).then(function (routesArrays) {
        return _extends({}, routesArrays[0], routesArrays[1]);
    });
}