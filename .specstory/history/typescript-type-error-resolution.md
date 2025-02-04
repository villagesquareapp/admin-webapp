## SpecStory

## TypeScript Type Error Resolution (15/12/2024, 10:38:15)

_**User**_

For the code present, we get this error:
```
Type 'ApiResponse<IUsersResponse> | null' is not assignable to type 'IUsersResponse | null'.
  Type 'ApiResponse<IUsersResponse>' is missing the following properties from type 'IPaginatedResponse<IUsers[]>': current_page, per_page, total, last_page
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

Change the line to:
```typescript
<UserTable users={users?.data || null} />
```

This extracts the `data` property from the API response to match the expected type.

---



---

