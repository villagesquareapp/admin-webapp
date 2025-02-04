## SpecStory

## Fixing NavigateOptions Error in Next.js (10/01/2025, 09:16:37)

_**User**_

For the code present, we get this error:
```
Object literal may only specify known properties, and 'shallow' does not exist in type 'NavigateOptions'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because the `shallow` option is specific to older Next.js versions and the `useRouter` from `next/navigation` doesn't support it. In Next.js 13+ with the App Router, we should simply remove the `shallow` option.

Here's the concise fix:

```typescript:src/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp.tsx
// ... existing code ...
  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("userId");
    router.replace(`?${params.toString()}`);
  };
// ... existing code ...
```

The change simply removes the `{ shallow: true }` option since it's no longer supported in the new Next.js App Router.

---



---

