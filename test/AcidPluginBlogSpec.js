import AcidPluginBlog, { __RewireAPI__ as ARewireAPI } from '../src/AcidPluginBlog';
import chai, { expect } from 'chai';
import { posts, missingTitle, missingDate } from './mocks/fs';

import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

const args = {templateDir: 'templates', postDir: 'posts'};

describe('AcidPluginBlog', () => {
    it('should throw an error when no templateDir is supplied', () => {
        expect(() => {
           new AcidPluginBlog();
        }).to.throw('templateDir');
    });

    it('should throw an error when no postDir is supplied', () => {
        expect(() => {
           new AcidPluginBlog({templateDir: 'templates'});
        }).to.throw('postDir');
    });

    it('should return a plugin', () => {
        let blog = new AcidPluginBlog(args);
        expect(blog.name).to.equal('blog');
        expect(blog.resolver).to.be.an('object');
        expect(blog.resolver.resolveRoutes).to.be.a('function');
        expect(blog.resolver.resolveContext).to.be.a('function');
        expect(blog.resolver.resolveTemplate).to.be.a('function');
    });

    describe('#resolveRoutes', () => {
        let blog;
        beforeEach(() => {
            ARewireAPI.__Rewire__('fs', posts);
            blog = new AcidPluginBlog({templateDir: '/templates', postDir: '/posts'});
        });
        afterEach(() => {
            ARewireAPI.__ResetDependency__('fs');
        });

        it('should return a route for each post', done => {
            blog.resolver.resolveRoutes().then(routes => {
                expect(routes).to.eql(['/2016/3/1/post-one', '/2016/3/2/post-two']);
                done();
            }).catch(done);
        });

        describe('no title', () => {
            let blog;
            beforeEach(() => {
                ARewireAPI.__Rewire__('fs', missingTitle);
                blog = new AcidPluginBlog({templateDir: '/templates', postDir: '/posts'});
            });
            afterEach(() => {
                ARewireAPI.__ResetDependency__('fs');
            });

            it('should fail to generate routes if a post is missing a title', () => {
                return expect(blog.resolver.resolveRoutes()).to.eventually.be.rejectedWith('must have a title');
            });
        });

        describe('no date', () => {
            let blog;
            beforeEach(() => {
                ARewireAPI.__Rewire__('fs', missingDate);
                blog = new AcidPluginBlog({templateDir: '/templates', postDir: '/posts'});
            });
            afterEach(() => {
                ARewireAPI.__ResetDependency__('fs');
            });

            it('should fail to generate routes if a post is missing a date', () => {
                return expect(blog.resolver.resolveRoutes()).to.eventually.be.rejectedWith('must have a date');
            });
        });
    });

    describe('#resolveContext', () => {
        let blog;
        beforeEach(() => {
            ARewireAPI.__Rewire__('fs', posts);
            blog = new AcidPluginBlog({templateDir: '/templates', postDir: '/posts'});
        });
        afterEach(() => {
            ARewireAPI.__ResetDependency__('fs');
        });

        it('should return a context for an existing route', done => {
            blog.resolver.resolveContext('/2016/3/1/post-one').then(context => {
                expect(context.title).to.equal('Post One');
                done();
            }).catch(done);
        });
    });

    describe('#resolveTemplate', () => {
        let blog;
        beforeEach(() => {
            blog = new AcidPluginBlog({templateDir: '/templates', postDir: '/posts'});
        });

        it('should return post.marko for a post', () => {
            expect(blog.resolver.resolveTemplate('test')).to.equal('/templates/post.marko');
        });
    });
});
