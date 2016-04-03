import path from 'path';
import fs from 'fs';
import yamlFront from 'yaml-front-matter';
import moment from 'moment';
import slug from 'slug';

function promiseReaddir(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                return reject(err);
            }
            return resolve(files);
        });
    });
}

function promiseReadFile(path) {
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
    return promiseReaddir(postDir).then(files => {
        return Promise.all(files.map(file =>{
            return promiseReadFile(path.join(postDir, file));
        }));
    }).then(posts => {
        return posts.map(post => yamlFront.loadFront(post));
    }).then(posts => {
        // parse dates
        return posts.map(post => ({...post, date: moment(post.date, 'YYYY/MM/DD')}));
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

    return {
        name: 'blog',
        resolver: {
            resolveContext: route => {

            },
            resolveRoutes: () => {
                return getPosts(postDir).then(posts => posts.map(post => (
                    `/${post.date.year()}/${post.date.month() + 1}/${post.date.day() - 1}/${slug(post.title)}`
                )));
            },
            resolveTemplate: url => {

            }
        }
    };
}
