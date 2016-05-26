import path from 'path';
import fs from 'fs';
import yamlFront from 'yaml-front-matter';
import moment from 'moment';
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

export async function getPosts(postDir) {
    const files = await pReaddir(postDir);
    const postContents = await Promise.all(files.map(file =>{
        return pReadFile(path.join(postDir, file));
    }));
    const posts = postContents.map(
        post => yamlFront.loadFront(post)
    ).map(post => ({
        // parse out date and content
        ...post,
        date: moment(post.date, 'YYYY/MM/DD'),
        content: marked(post.__content)
    }));

    // check the format
    posts.forEach((post, i) => {
        if (!post.title) {
            throw new Error(`Post must have a title: ${files[i]}`);
        }
        if (!post.date.isValid()) {
            throw new Error(`Post must have a date in the format YYYY/MM/DD: ${files[i]}`);
        }
    });

    return posts.sort((a, b) => {
        return b.date - a.date;
    });
}

function routeForPost(format, post) {
    return format
        .replace('{yyyy}', post.date.year())
        .replace('{mm}', post.date.month() + 1)
        .replace('{dd}', post.date.date())
        .replace('{slug}', post.title.toLowerCase().replace(/[^\w\d]+/g, '-'));
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
                context: {
                    ...curr,
                    url: routeForPost(format, curr)
                }
            }
        }), {})
    );
}

function buildRoutesForListings(postDir, pageSize, format, postFormat) {
    return getPosts(postDir).then(posts => {
        let totalPages = Math.ceil(posts.length / pageSize);
        return posts.reduce((prev, curr, index) => {
            let pageNum = Math.floor(index / pageSize) + 1;
            let route = routeForListing(format, pageNum);
            let post = {...curr, url: routeForPost(postFormat, curr)};
            return {
                ...prev,
                [route]: {
                    type: LISTING,
                    context: {
                        currentPage: pageNum,
                        totalPages,
                        posts: prev[route] ? [...prev[route].context.posts, post] : [post]
                    }
                }
            };
        }, {});
    });
}

export function buildRoutes(options) {
    return Promise.all([
        buildRoutesForPosts(options.postDir, options.postUrlFormat),
        buildRoutesForListings(options.postDir, options.pageSize, options.listingUrlFormat, options.postUrlFormat)
    ]).then(routesArrays => {
        return {...routesArrays[0], ...routesArrays[1]};
    });
}
