import path from 'path';
import fs from 'fs';
import yamlFront from 'yaml-front-matter';
import moment from 'moment';
import slug from 'slug';
import marked from 'marked';

function pReaddir(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                return reject(err);
            }
            return resolve(files);
        });
    });
}

function pReadFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, content) => {
            if (err) {
                return reject(err);
            }
            return resolve(content);
        });
    });
}

function getPosts(postDir) {
    return pReaddir(postDir).then(files => {
        return Promise.all(files.map(file =>{
            return pReadFile(path.join(postDir, file));
        }));
    }).then(posts => {
        return posts.map(post => yamlFront.loadFront(post));
    }).then(posts => {
        // parse out date and content
        return posts.map(post => ({
            ...post,
            date: moment(post.date, 'YYYY/MM/DD'),
            content: marked(post.__content)
        }));
    }).then(posts => {
        // check the format
        posts.forEach(post => {
            if (!post.title) throw new Error('Post must have a title: ' + JSON.stringify(post));
            if (!post.date.isValid()) throw new Error('Post must have a date in the format YYYY/MM/DD: ' + JSON.stringify(post));
        });

        return posts;
    });
}

function routeForPost(format, post) {
    return format
        .replace('{yyyy}', post.date.year())
        .replace('{mm}', post.date.month() + 1)
        .replace('{dd}', post.date.date())
        .replace('{slug}', slug(post.title, {lower: true}));
}

function buildRoutesForPosts(postDir, format) {
    return getPosts(postDir).then(posts => {
        return posts.reduce((prev, curr) => ({
            ...prev,
            [routeForPost(format, curr)]: curr
        }), {});
    });
}

export default function(options) {
    options = options || {};
    if (!options.templateDir) {
        throw new Error('acid-plugin-blog requires a templateDir');
    }
    if (!options.postDir) {
        throw new Error('acid-plugin-blog requires a postDir');
    }

    let templateDir = path.resolve(options.templateDir);
    let postDir = path.resolve(options.postDir);
    let postUrlFormat = options.postUrlFormat || '/{yyyy}/{mm}/{dd}/{slug}';

    return {
        name: 'blog',
        resolver: {
            resolveContext: route => {
                return buildRoutesForPosts(postDir, postUrlFormat).then(routes => {
                    return routes[route];
                });
            },
            resolveRoutes: () => {
                return buildRoutesForPosts(postDir, postUrlFormat).then(routes => {
                    return Object.keys(routes);
                });
            },
            resolveTemplate: () => {
                return path.join(templateDir, 'post.marko');
            }
        }
    };
}
