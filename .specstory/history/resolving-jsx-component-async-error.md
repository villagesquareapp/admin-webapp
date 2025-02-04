## SpecStory

## Resolving JSX Component Async Error (12/12/2024, 14:21:32)

_**User**_

For the code present, we get this error:
```
'Overview' cannot be used as a JSX component.
  Its type '() => Promise<JSX.Element>' is not a valid JSX element type.
    Type '() => Promise<JSX.Element>' is not assignable to type '(props: any, deprecatedLegacyContext?: any) => ReactNode'.
      Type 'Promise<Element>' is not assignable to type 'ReactNode'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because `Overview` is an async component, but you're trying to use it directly in JSX. In Next.js, when using async components, you need to mark the parent component as async and await the child component.

Here's the fix:

```typescript:src/app/(DashboardLayout)/dashboards/overview/page.tsx
const ecommerce = async () => {
  return await <Overview />;
};
```

Or alternatively, a cleaner approach:

```typescript:src/app/(DashboardLayout)/dashboards/overview/page.tsx
const ecommerce = async () => {
  const OverviewContent = await Overview();
  return OverviewContent;
};
```

Either solution will resolve the type error by properly handling the Promise returned by the async component.

---



---

