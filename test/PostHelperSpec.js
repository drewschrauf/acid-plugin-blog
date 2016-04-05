import { buildRoutes, __RewireAPI__ as PHRewireAPI } from '../src/PostHelper';
import { posts, missingTitle, missingDate, badDate } from './mocks/fs';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const defaultArgs = {
    templateDir: '/templates',
    postDir: '/posts',
    postUrlFormat: '/{yyyy}/{mm}/{dd}/{slug}',
    listingUrlFormat: '/page/{idx}',
    pageSize: 2
};

describe('PostHelperSpec', () => {
    describe('#buildRoutes', () => {
        let routes;
        beforeEach(done => {
            PHRewireAPI.__Rewire__('fs', posts);
            buildRoutes(defaultArgs).then(r => {
                routes = r;
                done();
            });
        });
        afterEach(() => {
            PHRewireAPI.__ResetDependency__('fs');
        });
        it('should build routes for all posts and listing items', () => {
            expect(Object.keys(routes).length).to.equal(6);
            expect(routes['/2016/4/4/post-one']).to.not.be.undefined;
            expect(routes['/2016/3/3/post-two']).to.not.be.undefined;
            expect(routes['/2016/3/3/post-three']).to.not.be.undefined;
            expect(routes['/2016/3/3/post-four']).to.not.be.undefined;
            expect(routes['/page/1']).to.not.be.undefined;
            expect(routes['/page/2']).to.not.be.undefined;
        });

        it('should generate a post object for posts', () => {
            let item = routes['/2016/4/4/post-one'];
            expect(item.type).to.equal('post');
            expect(item.context.title).to.equal('Post One');
            expect(item.context.url).to.equal('/2016/4/4/post-one');
            expect(item.context.content).to.equal('<p>Post One</p>\n');
        });

        it('should generate a listng object for listings', () => {
            let item = routes['/page/2'];
            expect(item.type).to.equal('listing');
            expect(item.context.posts).to.have.length(2);
            expect(item.context.page).to.equal(2);
            expect(item.context.totalPages).to.equal(2);
        });

        describe('no title', () => {
            beforeEach(() => {
                PHRewireAPI.__Rewire__('fs', missingTitle);
            });
            afterEach(() => {
                PHRewireAPI.__ResetDependency__('fs');
            });

            it('should fail to generate routes if a post is missing a title', () => {
                return expect(buildRoutes(defaultArgs))
                    .to.eventually.be.rejectedWith('Post must have a title: noTitle.md');
            });
        });

        describe('no date', () => {
            beforeEach(() => {
                PHRewireAPI.__Rewire__('fs', missingDate);
            });
            afterEach(() => {
                PHRewireAPI.__ResetDependency__('fs');
            });

            it('should fail to generate routes if a post is missing a date', () => {
                return expect(buildRoutes(defaultArgs))
                    .to.eventually.be.rejectedWith(/must have a date.*: noDate.md/);
            });
        });

        describe('bad date', () => {
            beforeEach(() => {
                PHRewireAPI.__Rewire__('fs', badDate);
            });
            afterEach(() => {
                PHRewireAPI.__ResetDependency__('fs');
            });

            it('should fail to generate routes if a post has an unparseable date', () => {
                return expect(buildRoutes(defaultArgs)).to.eventually.be.rejectedWith('must have a date');
            });
        });
    });
});
