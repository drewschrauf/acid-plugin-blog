import mock from 'mock-fs';

export const posts = mock.fs({
    '/posts/one.md':
`---
title: Post One
date: 2016/04/04
---
Post One`,
    '/posts/two.md':
`---
title: Post Two
date: 2016/02/02
---
Post Two`,
    '/posts/three.md':
`---
title: Post Three
date: 2016/03/03
---
Post Three`,
    '/posts/four.md':
`---
title: Post Four
date: 2016/01/01
---
Post Four`
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
