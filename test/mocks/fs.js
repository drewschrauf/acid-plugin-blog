import mock from 'mock-fs';

export const posts = mock.fs({
    '/posts/one.md':
`---
title: Post One
date: 2016/03/01
---
Post One`,
    '/posts/two.md':
`---
title: Post Two
date: 2016/03/02
---
Post Two`
});
