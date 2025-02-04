## SpecStory

## Resolving Module Not Found Error (10/12/2024, 23:12:09)

_**User**_

For the code present, we get this error:
```
Cannot find module '@hookform/resolvers/zod' or its corresponding type declarations.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because the required package is not installed. You need to install both `@hookform/resolvers` and `zod` packages.

Run this command in your terminal:

```bash
npm install @hookform/resolvers zod
```

or if you're using yarn:

```bash
yarn add @hookform/resolvers zod
```

This will install the necessary dependencies and resolve the import error.

---



---

