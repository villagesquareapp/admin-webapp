## SpecStory

## Resolving React TypeScript Error (12/12/2024, 16:19:50)

_**User**_

For the code present, we get this error:
```
Namespace 'React' has no exported member 'AwaitedReactNode'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because `AwaitedReactNode` was introduced in newer versions of React's type definitions. To fix this, we can simplify the type definition for the profile object. Here's the concise fix:

```typescript:src/app/components/apps/userprofile/followers/FollowerCard.tsx
// ... existing code ...
      <div className="grid grid-cols-12 gap-30">
        {followers.map((profile: {
          id: React.Key;
          avatar: string;
          name: React.ReactNode;
          country: string;
          isFollowed: boolean;
        }) => {
// ... existing code ...
```

This simplifies the type definitions while maintaining type safety. The complex union types weren't necessary for this use case.

---



---

