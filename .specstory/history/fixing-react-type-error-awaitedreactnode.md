## SpecStory

## Fixing React Type Error: AwaitedReactNode (12/12/2024, 16:18:58)

_**User**_

For the code present, we get this error:
```
Namespace 'React' has no exported member 'AwaitedReactNode'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because `AwaitedReactNode` was introduced in newer versions of React's type definitions. Here's how to fix the type definition for the order items:

```typescript:src/app/components/apps/invoice/Invoice-detail/index.tsx
// ... existing code ...
                order: {
                  itemName: React.ReactNode;
                  unitPrice: React.ReactNode;
                  units: React.ReactNode;
                  unitTotalPrice: React.ReactNode;
                },
// ... existing code ...
```

This simplifies the type definition while maintaining type safety. `React.ReactNode` is the most common type for renderable content in React and includes strings, numbers, elements, and other valid JSX content.

---



---

