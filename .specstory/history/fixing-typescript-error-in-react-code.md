## SpecStory

## Fixing TypeScript Error in React Code (12/12/2024, 16:21:57)

_**User**_

For the code present, we get this error:
```
Namespace 'React' has no exported member 'AwaitedReactNode'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

This error occurs because `AwaitedReactNode` was introduced in newer versions of React's type definitions. Let's simplify the type definition for the profile object.

Here's the concise fix:

```typescript:src/app/components/apps/userprofile/friends/FriendsCard.tsx
// ... existing code ...
      <div className="grid grid-cols-12 gap-30">
        {followers.map((profile: { 
          id: React.Key; 
          avatar: string | StaticImport; 
          name: string;
          role: string;
        }) => {
          return (
// ... existing code ...
```

This simplifies the type definitions while maintaining type safety. The complex type unions for `name` and `role` weren't necessary since they're likely just strings in your data.

---



---

