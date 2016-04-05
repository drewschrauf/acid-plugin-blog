import AcidPluginBlog, { __RewireAPI__ as ARewireAPI } from '../src/AcidPluginBlog';
import chai, { expect } from 'chai';
import routes from './mocks/routes';

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

    describe('resolver', () => {
        let blog;
        beforeEach(() => {
            ARewireAPI.__Rewire__('buildRoutes', () => Promise.resolve(routes));
            blog = new AcidPluginBlog({templateDir: '/templates', postDir: '/posts'});
        });
        afterEach(() => {
            ARewireAPI.__ResetDependency__('buildRoutes');
        });

        describe('#resolveRoutes', () => {
            it('should return a route for each post', () => {
                return expect(blog.resolver.resolveRoutes())
                    .to.eventually.eql(['/one', '/two', '/page/1']);
            });
        });

        describe('#resolveContext', () => {
            it('should return a context for an existing route', done => {
                blog.resolver.resolveContext('/one').then(context => {
                    expect(context).to.equal('one');
                    done();
                }).catch(done);
            });
        });

        describe('#resolveTemplate', () => {
            it('should return post.marko for a post', () => {
                return expect(blog.resolver.resolveTemplate('/one'))
                    .to.eventually.equal('/templates/post.marko');
            });
            it('should return listing.marko for a listing', () => {
                return expect(blog.resolver.resolveTemplate('/page/1'))
                    .to.eventually.equal('/templates/listing.marko');
            });
        });

    });
});
