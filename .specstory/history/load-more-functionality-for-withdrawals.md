## SpecStory

## Load More Functionality for Withdrawals (04/02/2025, 15:33:27)

_**User**_

Pls for the loadMore button, Help pass the loadmore info to the searchparam, like the pending withdrawal request limit and  page. I named it pwLimit and pwPage. So data is fethed on serverside and we have limit and page on the search URL

---

_**Assistant**_

I'll help you modify the `loadMore` function in the `Withdrawals.tsx` component to update the search parameters with `pwLimit` and `pwPage`. Here's how we'll do it:

First, I'll explain what we need to do: Instead of directly fetching data in the `loadMore` function, we'll update the URL search parameters which will trigger a server-side refresh with the new page number.

Let me modify the code:

---

_****_

```diff
  import CardBox from "../components/shared/CardBox";
  import WithdrawalDialog from "./WithdrawalDialog";
+ import { useRouter } from "next/navigation";
  
  const Withdrawals = ({
    );
    const dropdownItems = ["Action", "Another action", "Something else"];
+   const router = useRouter();
  
    useEffect(() => {
    }, [withdrawals, currentPage, totalPages]);
  
-   const loadMore = async () => {
+   const loadMore = () => {
      if (isLoading || hasReachedEnd) return;
  
-     try {
-       setIsLoading(true);
-       const nextPage = currentLocalPage + 1;
-       const response = await getPendingWithdrawals(nextPage, pageSize);
- 
-       const newWithdrawals = response?.data?.data;
-       const lastPage = response?.data?.last_page;
- 
-       if (newWithdrawals) {
-         const typedWithdrawals = newWithdrawals as unknown as IPendingWithdrawals[];
-         setLocalWithdrawals((prev) => [...prev, ...typedWithdrawals]);
-         setCurrentLocalPage(nextPage);
-         setHasReachedEnd(nextPage >= (lastPage || totalPages));
-       }
-     } catch (error) {
-       console.error("Error loading more withdrawals:", error);
-     } finally {
-       setIsLoading(false);
-     }
+     const params = new URLSearchParams(window.location.search);
+     const nextPage = currentPage + 1;
+ 
+     params.set("pwPage", nextPage.toString());
+     params.set("pwLimit", pageSize.toString());
+ 
+     // Update the URL with new search params
+     router.replace(`?${params.toString()}`, {
+       scroll: false,
+     });
    };
  
```

---

_****_



I've made the following changes to the `Withdrawals.tsx` component:

1. Added the `useRouter` import from `next/navigation`
2. Added the router instance at the component level
3. Modified the `loadMore` function to:
   - Use URL search parameters instead of direct API calls
   - Update the `pwPage` and `pwLimit` parameters in the URL
   - Use the router to update the URL, which will trigger a server-side refresh

The changes mean that:
1. When "View More" is clicked, instead of fetching data client-side, it updates the URL parameters
2. The URL update triggers a server-side refresh through the page component
3. The new data will be fetched server-side with the updated parameters

This approach is more consistent with the server-side data fetching pattern you're using in the rest of the application. The data will be fetched fresh from the server each time, ensuring consistency and better SEO.

Would you like me to make any additional adjustments to this implementation?

---

_**User**_

There is an issue. You can see example from Reusable table and users data. Any value set as page limit is supposed to be the limit, just like the user request. 

---

_**Assistant**_

Ah, I understand now. Looking at how the `ReusableTable` and user data handling works, we should preserve any existing page limit value in the URL and only update the page number. Let me modify the `loadMore` function to handle this correctly:

---

_****_

```diff
      const nextPage = currentPage + 1;
  
+     // Only update the page number, preserve the existing limit
      params.set("pwPage", nextPage.toString());
-     params.set("pwLimit", pageSize.toString());
  
      // Update the URL with new search params
```

---

_****_



I've modified the `loadMore` function to:
1. Only update the page number using `pwPage`
2. Remove the line that was setting `pwLimit` since we want to preserve whatever limit value is already in the URL
3. This way, it will respect the existing page size/limit that was set in the URL, similar to how the user data table works

This change ensures that:
1. The pagination behavior is consistent with the rest of the application
2. The page size/limit remains as originally set in the URL
3. Only the page number is incremented when loading more items

Is there anything else you'd like me to adjust in this implementation?

---

_**User**_

What have you done, when the page limit is 5 and I click the button, I expect the page limit to always be 5, page 2 and then join the new data to the previous one we have

---

_**Assistant**_

Ah, now I understand! You want to maintain the same page limit while

---



---

