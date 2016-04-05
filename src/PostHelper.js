import path from 'path';
import fs from 'fs';
import yamlFront from 'yaml-front-matter';
import moment from 'moment';
import slug from 'slug';
import marked from 'marked';

const POST = 'post';
const LISTING = 'listing';

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
    let fileArray;
    return pReaddir(postDir).then(files => {
        fileArray = files;
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
        posts.forEach((post, i) => {
            if (!post.title) {
                throw new Error(`Post must have a title: ${fileArray[i]}`);
            }
            if (!post.date.isValid()) {
                throw new Error(`Post must have a date in the format YYYY/MM/DD: ${fileArray[i]}`);
            }
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

function routeForListing(format, pageNumber) {
    return format
        .replace('{idx}', pageNumber);
}

function buildRoutesForPosts(postDir, format) {
    return getPosts(postDir).then(posts =>
        posts.reduce((prev, curr) => ({
            ...prev,
            [routeForPost(format, curr)]: {
                type: POST,
                context: curr
            }
        }), {})
    );
}

function buildRoutesForListings(postDir, pageSize, format) {
    return getPosts(postDir).then(posts => {
        return posts.reduce((prev, curr, index) => {
            let pageNum = Math.floor(index / pageSize);
            let route = routeForListing(format, pageNum + 1);
            return {
                ...prev,
                [route]: {
                    type: LISTING,
                    context: prev[route] ? [...prev[route].context, curr] : [curr]
                }
            };
        }, {});
    });
}

export function buildRoutes(options) {
    return Promise.all([
        buildRoutesForPosts(options.postDir, options.postUrlFormat),
        buildRoutesForListings(options.postDir, options.pageSize, options.listingUrlFormat)
    ]).then(routesArrays => {
        return {...routesArrays[0], ...routesArrays[1]};
    });
}
