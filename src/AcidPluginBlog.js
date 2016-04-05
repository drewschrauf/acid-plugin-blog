import path from 'path';
import { buildRoutes } from './PostHelper';

export default function(options = {}) {
    if (!options.templateDir) {
        throw new Error('acid-plugin-blog requires a templateDir');
    }
    if (!options.postDir) {
        throw new Error('acid-plugin-blog requires a postDir');
    }

    let opts = {
        templateDir: path.resolve(options.templateDir),
        postDir: path.resolve(options.postDir),
        postUrlFormat: options.postUrlFormat || '/{yyyy}/{mm}/{dd}/{slug}',
        listingUrlFormat: options.listingUrlFormat || '/posts/{idx}',
        pageSize: options.pageSize || 5
    };

    return {
        name: 'blog',
        resolver: {
            resolveContext: route => {
                return buildRoutes(opts).then(routes => (
                    routes[route].context
                ));
            },
            resolveRoutes: () => {
                return buildRoutes(opts).then(routes => (
                    Object.keys(routes)
                ));
            },
            resolveTemplate: () => {
                return path.join(opts.templateDir, 'post.marko');
            }
        }
    };
}
