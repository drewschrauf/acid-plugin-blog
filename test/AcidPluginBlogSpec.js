import AcidPluginBlog, { __RewireAPI__ as ARewireAPI } from '../src/AcidPluginBlog';
import { expect } from 'chai';
import { posts } from './mocks/fs';

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
                console.log(routes);
                done();
            }).catch(done);
        });
    });
});
