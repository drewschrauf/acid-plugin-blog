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

export const missingTitle = mock.fs({
    '/posts/noTitle.md':
`---
date: 2016/03/01
---
No Title`
});

export const missingDate = mock.fs({
    '/posts/noDate.md':
`---
title: No Date
---
No Date`
});

export const badDate = mock.fs({
    '/posts/badDate.md':
`---
title: Bad Date
date: testing
---
Bad Date`
});
