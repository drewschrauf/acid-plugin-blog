process.env.BABEL_ENV = 'test';

module.exports = function(wallaby) {
    return {
        files: ['src/**/*.js', 'test/mocks/**/*.js'],
        tests: ['test/**/*Spec.js'],
        env: {
            type: 'node'
        },
        compilers: {
            '**/*.js': wallaby.compilers.babel()
        }
    };
};
