## SpecStory

## Fixing React AwaitedReactNode Error (12/12/2024, 16:10:51)

_**User**_

For the code present, we get this error:
```
Namespace 'React' has no exported member 'AwaitedReactNode'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

This error occurs because `AwaitedReactNode` was introduced in newer versions of React. Replace the complex type union with simply `React.ReactNode`. So instead of that long union type, use:

```typescript
title: React.ReactNode;
```

This will maintain type safety while being compatible across React versions.

---



---

