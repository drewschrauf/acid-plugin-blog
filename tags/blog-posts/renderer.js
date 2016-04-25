var template = require('marko').load(require.resolve('./template.marko'));
var buildRoutes = require('../../lib/PostHelper').buildRoutes;

exports.renderer = function(input, out) {
    var renderBody = input.renderBody;

    template.render({
        renderBody: renderBody,
        blogProvider: callback => {
            buildRoutes(out.global.plugins.blog.options).then(routes => {
                var posts = Object.keys(routes).reduce((prev, curr) => {
                    var routeItem = routes[curr];
                    if (routeItem.type === 'post') {
                        prev.push(routeItem.context);
                    }
                    return prev;
                }, []);

                callback(null, posts);
            }).catch(err => {
                callback(err);
            });
        }
    }, out);
};

exports.tag = {
    attributes: {
        var: 'identifier'
    },
    vars: [
        {
            'name-from-attribute': 'var'
        }
    ]
};
