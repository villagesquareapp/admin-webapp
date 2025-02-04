## SpecStory

## Fixing TypeScript Error in React Code (12/12/2024, 16:17:57)

_**User**_

For the code present, we get this error:
```
Namespace 'React' has no exported member 'AwaitedReactNode'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because `AwaitedReactNode` was introduced in newer versions of React's type definitions. Here's how to fix the type definition for the `unitTotalPrice`:

```typescript:src/app/components/apps/invoice/Edit-invoice/index.tsx
// ... existing code ...
                order: {
                  itemName: string | number | readonly string[] | undefined;
                  unitPrice: string | number | readonly string[] | undefined;
                  units: string | number | readonly string[] | undefined;
                  unitTotalPrice: React.ReactNode;  // Simplified type
                },
// ... existing code ...
```

I've simplified the type to just `React.ReactNode` which should cover all the use cases you need for displaying the total price. This type is more commonly used and available across all React versions.

---



---

