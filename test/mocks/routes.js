export default {
    '/one': {
        type: 'post',
        context: 'one'
    },
    '/two': {
        type: 'post',
        context: 'one'
    },
    '/page/1': {
        type: 'listing',
        context: ['one', 'two']
    }
};
