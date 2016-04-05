import { buildRoutes, __RewireAPI__ as PHRewireAPI } from '../src/PostHelper';
import { posts, missingTitle, missingDate, badDate } from './mocks/fs';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const defaultArgs = {
    templateDir: '/templates',
    postDir: '/posts',
    postUrlFormat: '/{yyyy}/{mm}/{dd}/{slug}'
};

describe('PostHelperSpec', () => {
    describe('#buildRoutes', () => {
        beforeEach(() => {
            PHRewireAPI.__Rewire__('fs', posts);
        });
        afterEach(() => {
            PHRewireAPI.__ResetDependency__('fs');
        });
        it('should build routes for all posts and listing items', done => {
            buildRoutes(defaultArgs).then(routes => {
                expect(Object.keys(routes).length).to.equal(2);
                expect(routes['/2016/4/4/post-one']).to.not.be.undefined;
                expect(routes['/2016/3/3/post-two']).to.not.be.undefined;
                done();
            }).catch(done);
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
