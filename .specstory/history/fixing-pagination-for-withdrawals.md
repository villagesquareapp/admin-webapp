## SpecStory

## Fixing Pagination for Withdrawals (04/02/2025, 15:48:51)

_**User**_

Help fix this, when view more button is clicked, more data should be fetch and added to previous data so its like a paginated thing clicking the load more fetch more pending withdrawal

---

_**Assistant**_

I'll help you fix the pagination for the withdrawals section. Looking at the code, I notice that while the UI is set up for pagination, there's a small issue with how the data is being loaded and managed. Let me help you improve this.

First, let me search for any related API implementations to understand how the withdrawal data is being fetched.

---

_****_

<details>
            <summary>Searched codebase "getPendingWithdrawals function definition or implementation" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/app/api/wallet.ts` | L1-12 |
| `src/app/api/market-square.ts` | L1-21 |
| `src/app/api/user.ts` | L1-20 |
| `src/app/api/livestream.ts` | L1-21 |
| `src/app/api/invoice/invoceLists.tsx` | L218-243 |
| `src/app/api/post.ts` | L1-31 |
| `src/app/api/ticket.ts` | L1-20 |
| `src/app/api/report.ts` | L1-41 |
| `src/app/api/auth/[...nextauth]/route.ts` | L1-6 |
| `src/app/api/echo.ts` | L1-21 |
| `src/app/api/invoice/invoceLists.tsx` | L61-117 |
| `src/app/api/auth/authOptions.ts` | L43-66 |
| `src/app/api/invoice/invoceLists.tsx` | L173-217 |
| `src/app/api/invoice/invoceLists.tsx` | L117-173 |
| `src/app/api/userprofile/PostData.ts` | L252-252 |
| `src/app/api/kanban/KanbanData.ts` | L71-139 |
| `src/app/api/auth/authOptions.ts` | L1-43 |
| `src/app/api/userprofile/UsersData.ts` | L97-145 |
| `src/app/api/invoice/invoceLists.tsx` | L1-61 |
| `src/app/api/userprofile/UsersData.ts` | L49-97 |
| `src/app/api/userprofile/PostData.ts` | L146-206 |
| `src/app/api/ticket/TicketData.ts` | L79-118 |
| `src/app/api/userprofile/PostData.ts` | L208-250 |
| `src/app/api/userprofile/PostData.ts` | L1-81 |
| `src/app/api/userprofile/UsersData.ts` | L145-190 |

</details>

---

_****_



I see that the `getPendingWithdrawals` API function is properly set up to handle pagination. Now let me help you fix the pagination in the Withdrawals component. I'll modify the code to properly handle the "View More" functionality.

Let me edit the `Withdrawals.tsx` file:

---

_****_

```diff
        setCurrentLocalPage(currentPage);
        setHasReachedEnd(currentPage >= totalPages);
+       setIsLoading(false);
      }
    }, [withdrawals, currentPage, totalPages]);
      if (isLoading || hasReachedEnd) return;
  
+     setIsLoading(true);
      const params = new URLSearchParams(window.location.search);
      const nextPage = currentPage + 1;
```

---

_****_



I've made the following improvements to fix the pagination:

1. Added loading state management:
   - Set `isLoading` to true when starting to load more data
   - Set `isLoading` to false when new data is received in the useEffect

2. The component now properly:
   - Prevents multiple simultaneous load more requests by checking isLoading
   - Shows loading state in the "View More" button
   - Maintains the existing data while loading more
   - Appends new data to the existing list when it arrives
   - Properly tracks when we've reached the end of the data

The pagination should now work as expected:
1. When you click "View More", it will show a loading state
2. The new data will be appended to the existing list
3. The loading state will be cleared once new data arrives
4. If there's no more data to load, the "View More" button will be replaced with a message

Is there anything specific about the pagination behavior you'd like me to adjust further?

---

_**User**_

Nice, it show loading more, but then new data is not shown

---

_**Assistant**_

I see the issue. The problem is that we're relying on URL parameters to trigger the data fetch, but we need to ensure the parent component is actually fetching new data when the URL changes. Let me check how the parent component is handling this.

---

_****_

<details>
            <summary>Searched codebase "getPendingWithdrawals implementation in page component" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/app/(DashboardLayout)/Withdrawals.tsx` | L88-119 |
| `src/app/(DashboardLayout)/Withdrawals.tsx` | L13-48 |
| `src/app/(DashboardLayout)/Withdrawals.tsx` | L50-88 |
| `src/app/(DashboardLayout)/Withdrawals.tsx` | L165-199 |
| `src/app/(DashboardLayout)/Withdrawals.tsx` | L119-165 |
| `src/app/(DashboardLayout)/Withdrawals.tsx` | L199-232 |
| `src/app/(DashboardLayout)/Withdrawals.tsx` | L1-13 |
| `src/app/(DashboardLayout)/Withdrawals.tsx` | L232-234 |
| `src/app/(DashboardLayout)/PendingVerifications.tsx` | L123-125 |
| `src/app/(DashboardLayout)/page.tsx` | L16-86 |
| `src/app/(DashboardLayout)/PendingVerifications.tsx` | L69-106 |
| `src/app/(DashboardLayout)/page.tsx` | L1-16 |
| `src/app/(DashboardLayout)/WithdrawalDialog.tsx` | L1-6 |
| `src/app/(DashboardLayout)/WithdrawalDialog.tsx` | L63-65 |
| `src/app/(DashboardLayout)/PendingVerifications.tsx` | L106-123 |
| `src/app/(DashboardLayout)/WithdrawalDialog.tsx` | L6-63 |
| `src/app/(DashboardLayout)/PendingVerifications.tsx` | L14-69 |
| `src/app/(DashboardLayout)/PendingVerifications.tsx` | L1-14 |
| `src/app/(DashboardLayout)/PendingVerificationDialog.tsx` | L58-60 |
| `src/app/(DashboardLayout)/page.tsx` | L88-135 |
| `src/app/(DashboardLayout)/ui-components/drawer/page.tsx` | L76-78 |
| `src/app/(DashboardLayout)/PendingVerificationDialog.tsx` | L1-7 |
| `src/app/(DashboardLayout)/ui-components/drawer/page.tsx` | L27-76 |
| `src/app/(DashboardLayout)/ui-components/pagination/page.tsx` | L56-56 |
| `src/app/(DashboardLayout)/headless-ui/dropdown/page.tsx` | L69-72 |

</details>

---

_****_



I see the issue now. The parent page component (`page.tsx`) is a server component that fetches the initial data, but it's not set up to handle dynamic updates when the URL changes. We need to modify our approach to handle the pagination on the client side.

Let me update the Withdrawals component to handle the data fetching itself:

---

_****_

```diff
  import CardBox from "../components/shared/CardBox";
  import WithdrawalDialog from "./WithdrawalDialog";
+ import { getPendingWithdrawals } from "../api/wallet";
  
  const Withdrawals = ({
    }, [withdrawals, currentPage, totalPages]);
  
-   const loadMore = () => {
+   const loadMore = async () => {
      if (isLoading || hasReachedEnd) return;
  
      setIsLoading(true);
+     const nextPage = currentLocalPage + 1;
+ 
+     try {
+       const newWithdrawals = await getPendingWithdrawals(nextPage, pageSize);
+       if (newWithdrawals?.data?.data) {
+         const newData = newWithdrawals.data.data as unknown as IPendingWithdrawals[];
+         setLocalWithdrawals((prevData) => [...prevData, ...newData]);
+         setCurrentLocalPage(nextPage);
+         setHasReachedEnd(nextPage >= (newWithdrawals.data.last_page || totalPages));
+       }
+     } catch (error) {
+       console.error("Error loading more withdrawals:", error);
+     } finally {
+       setIsLoading(false);
+     }
+ 
+     // Update URL for consistency, but don't rely on it for data fetching
      const params = new URLSearchParams(window.location.search);
-     const nextPage = currentPage + 1;
- 
      params.set("pwPage", nextPage.toString());
      params.set("pwLimit", pageSize.toString());
- 
-     // Update the URL with new search params
      router.replace(`?${params.toString()}`, {
        scroll: false,
```

---

_****_



I've made the following changes to fix the pagination:

1. Imported the `getPendingWithdrawals` function to fetch data directly in the component
2. Modified the `loadMore` function to:
   - Fetch new data directly using `getPendingWithdrawals`
   - Use `currentLocalPage` instead of `currentPage` for tracking
   - Handle errors appropriately
   - Update the URL after successful data fetch (for consistency)
   - Properly update the local state with new data

Now the pagination should work correctly because:
1. When "View More" is clicked, it will fetch the next page of data directly
2. New data will be appended to the existing list
3. Loading state will be properly managed
4. Error handling is in place
5. The URL will still be updated for consistency, but we're not relying on it for data fetching

The component now handles its own data fetching for pagination while maintaining the initial server-side rendered data. Try it now and let me know if you need any adjustments!

---

_**User**_

Pls take care of when last page is reached, and disable the button, plus show a little info below button saying no more data to display

---

_**Assistant**_

Looking at the code, we already have the logic for showing "No more withdrawals to display" when `hasReachedEnd` is true, but let's make sure it's working correctly. Let me check the logic for setting `hasReachedEnd` and the button state.

---

_****_



---

_****_



Let me try again with a more focused edit:

---

_****_

```diff
        if (newWithdrawals?.data?.data) {
          const newData = newWithdrawals.data.data as unknown as IPendingWithdrawals[];
+         if (newData.length === 0) {
+           setHasReachedEnd(true);
+         } else {
            setLocalWithdrawals((prevData) => [...prevData, ...newData]);
            setCurrentLocalPage(nextPage);
            setHasReachedEnd(nextPage >= (newWithdrawals.data.last_page || totalPages));
+         }
+       } else {
+         setHasReachedEnd(true);
        }
      } catch (error) {
        console.error("Error loading more withdrawals:", error);
+       setHasReachedEnd(true);
      } finally {
        setIsLoading(false);
          <div className="border-t border-ld mt-6">
            {hasReachedEnd ? (
-             <p className="text-center text-gray-500 text-sm mt-4">
-               No more withdrawals to display
-             </p>
+             <div className="text-center mt-4">
+               {localWithdrawals.length > 0 ? (
+                 <p className="text-gray-500 text-sm">No more withdrawals to display</p>
                ) : (
+                 <p className="text-gray-500 text-sm">No withdrawals found</p>
+               )}
+             </div>
+           ) : (
+             <>
                <Button
                  color="primary"
                  className="w-full mt-7"
                  onClick={loadMore}
-               disabled={isLoading}
+                 disabled={isLoading || hasReachedEnd}
                >
                  {isLoading ? "Loading..." : "View More"}
                </Button>
+               <p className="text-center text-gray-500 text-xs mt-2">
+                 Showing {localWithdrawals.length} withdrawals
+               </p>
+             </>
            )}
          </div>
```

---

_****_



I've made several improvements to handle the end of data state better:

1. In the `loadMore` function:
   - Added check for empty data array (`newData.length === 0`)
   - Set `hasReachedEnd` to true in all error cases
   - Better handling of edge cases when no data is returned

2. In the UI:
   - Added different messages for "No withdrawals found" vs "No more withdrawals to display"
   - Added a count of how many withdrawals are being shown
   - Made sure the button is properly disabled when loading or at the end
   - Improved the layout of status messages

Now the component will:
1. Show "No withdrawals found" if there's no data at all
2. Show "No more withdrawals to display" when you've reached the end
3. Show a count of displayed withdrawals while loading more
4. Properly disable the button when loading or at the end
5. Handle error cases by showing the end state

The pagination should now provide better feedback to users about the data state. Let me know if you'd like any adjustments to the messages or behavior!

---

_**User**_

Its not stable, Atime when the next data is shown, it revert back to the first page

---

_**Assistant**_

I see the issue. The problem is that the component is receiving new props from the parent component which is causing it to reset the state. Let me fix this by modifying how we handle the initial data and subsequent updates.

---

_****_

```diff
    const [currentLocalPage, setCurrentLocalPage] = useState(1);
    const [hasReachedEnd, setHasReachedEnd] = useState(false);
+   const [isInitialized, setIsInitialized] = useState(false);
    const [isOpenApproval, setIsOpenApproval] = useState(false);
    const [isOpenDecline, setIsOpenDecline] = useState(false);
  
    useEffect(() => {
-     if (withdrawals?.data) {
+     if (withdrawals?.data && !isInitialized) {
        const newData = withdrawals.data as unknown as IPendingWithdrawals[];
-       setLocalWithdrawals((prevData) =>
-         currentPage === 1 ? newData : [...prevData, ...newData]
-       );
+       setLocalWithdrawals(newData);
        setCurrentLocalPage(currentPage);
        setHasReachedEnd(currentPage >= totalPages);
-       setIsLoading(false);
+       setIsInitialized(true);
      }
-   }, [withdrawals, currentPage, totalPages]);
+   }, [withdrawals, currentPage, totalPages, isInitialized]);
  
    const loadMore = async () => {
```

---

_****_



I've made the following changes to stabilize the pagination:

1. Added an `isInitialized` state to track whether we've loaded the initial data
2. Modified the `useEffect` to:
   - Only set initial data once when the component mounts
   - Not update the data when props change after initialization
   - Remove the conditional merging logic that was causing instability

The key changes are:
1. We now only initialize the data once when the component first mounts
2. Subsequent data loading is handled entirely by the `loadMore` function
3. The component won't reset its state when parent props change
4. We maintain a stable local state for the pagination

This should prevent the data from reverting to the first page and maintain a stable list of withdrawals as you load more. Try it now and let me know if you see any other issues!

---

_**User**_

These color is not getting added/showing

---

_**Assistant**_

I see the issue with the color classes. The template literals for the background colors need to be fixed. Let me update the className structure:

---

_****_

```diff
                <div className="flex gap-3 items-center" key={item.uuid}>
                  <div
-                   className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative bg-light${
+                   className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative ${
                      item.transaction_status === "pending"
-                       ? "primary"
+                       ? "bg-lightprimary dark:bg-darkprimary"
                        : item.transaction_status === "success"
-                       ? "success"
+                       ? "bg-lightsuccess dark:bg-darksuccess"
                        : item.transaction_status === "declined"
-                       ? "warning"
-                       : "error"
-                   } dark:bg-dark${
-                     item.transaction_status === "pending"
-                       ? "primary"
-                       : item.transaction_status === "success"
-                       ? "success"
-                       : item.transaction_status === "declined"
-                       ? "warning"
-                       : "error"
+                       ? "bg-lightwarning dark:bg-darkwarning"
+                       : "bg-lighterror dark:bg-darkerror"
                    }`}
                  >
```

---

_****_



I've fixed the background color classes by:

1. Simplified the template literal structure
2. Used proper Tailwind color classes:
   - For light mode: `bg-lightprimary`, `bg-lightsuccess`, `bg-lightwarning`, `bg-lighterror`
   - For dark mode: `dark:bg-darkprimary`, `dark:bg-darksuccess`, `dark:bg-darkwarning`, `dark:bg-darkerror`
3. Removed the concatenation that was causing the classes to not be recognized

The colors should now appear correctly for each transaction status:
- Pending: Primary color
- Success: Success/green color
- Declined: Warning/yellow color
- Error: Error/red color

Let me know if you need any adjustments to the colors or if you'd like to use different color classes!

---

_**User**_

How did you know there is darksuccess and all?

---

_**Assistant**_

I apologize for assuming those color classes existed. You're right - I should have checked the available Tailwind classes first. Let me check your Tailwind configuration or theme setup to see what color classes are actually available.

---

_****_



---

_****_



Let me check the Tailwind configuration:

---

_****_

Read file: tailwind.config.ts

---

_****_



I see the issue now. Looking at your Tailwind configuration, the correct color classes are:

For light mode:
- `bg-lightprimary`
- `bg-lightsuccess`
- `bg-lightwarning`
- `bg-lighterror`

For dark mode, we should use the emphasis colors:
- `bg-primaryemphasis`
- `bg-successemphasis`
- `bg-warningemphasis`
- `bg-erroremphasis`

Let me fix the color classes:

---

_****_

```diff
                    className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative ${
                      item.transaction_status === "pending"
-                       ? "bg-lightprimary dark:bg-darkprimary"
+                       ? "bg-lightprimary dark:bg-primaryemphasis"
                        : item.transaction_status === "success"
-                       ? "bg-lightsuccess dark:bg-darksuccess"
+                       ? "bg-lightsuccess dark:bg-successemphasis"
                        : item.transaction_status === "declined"
-                       ? "bg-lightwarning dark:bg-darkwarning"
-                       : "bg-lighterror dark:bg-darkerror"
+                       ? "bg-lightwarning dark:bg-warningemphasis"
+                       : "bg-lighterror dark:bg-erroremphasis"
                    }`}
                  >
```

---

_****_







I've updated the color classes to use the correct ones from your Tailwind configuration:

1. Light mode colors:
   - Pending: `bg-lightprimary`
   - Success: `bg-lightsuccess`
   - Declined: `bg-lightwarning`
   - Error: `bg-lighterror`

2. Dark mode colors (using emphasis variants):
   - Pending: `bg-primaryemphasis`
   - Success: `bg-successemphasis`
   - Declined: `bg-warningemphasis`
   - Error: `bg-erroremphasis`

These colors should now work correctly as they match the CSS variables defined in your Tailwind configuration. The colors will also properly switch between light and dark mode.

I apologize for initially using non-existent color classes. Always good practice to check the Tailwind configuration for available classes!

---

_**User**_

Well, didn't reflect

---

_**Assistant**_

Let me check your global CSS file to see the CSS variables for these colors:

---

_****_

Read file: src/app/css/globals.css

---

_****_



Let me check the theme colors file:

---

_****_

Read file: src/app/css/theme/default-colors.css

---

_****_



Now I see the issue. The CSS variables are defined correctly, but we need to use the background color classes differently. Let me update the classes:

---

_****_

```diff
                    className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative ${
                      item.transaction_status === "pending"
-                       ? "bg-lightprimary dark:bg-primaryemphasis"
+                       ? "bg-lightprimary dark:bg-primary"
                        : item.transaction_status === "success"
-                       ? "bg-lightsuccess dark:bg-successemphasis"
+                       ? "bg-lightsuccess dark:bg-success"
                        : item.transaction_status === "declined"
-                       ? "bg-lightwarning dark:bg-warningemphasis"
-                       : "bg-lighterror dark:bg-erroremphasis"
+                       ? "bg-lightwarning dark:bg-warning"
+                       : "bg-lighterror dark:bg-error"
                    }`}
                  >
```

---

_****_







I've updated the color classes to match your CSS variables from the theme files:

1. Light mode colors (these were correct):
   - `bg-lightprimary` (--color-lightprimary)
   - `bg-lightsuccess` (--color-lightsuccess)
   - `bg-lightwarning` (--color-lightwarning)
   - `bg-lighterror` (--color-lighterror)

2. Dark mode colors (updated to match variables):
   - `bg-primary` (--color-primary)
   - `bg-success` (--color-success)
   - `bg-warning` (--color-warning)
   - `bg-error` (--color-error)

The colors should now appear correctly because:
1. We're using the exact variable names defined in your CSS
2. The light mode uses the lighter variants with 20-30% opacity
3. The dark mode uses the full color variables

Let me know if the colors are now showing up correctly!

---

_**User**_

Help add the handler to each button, and help show a Approving/Declining or a loading spinner on the button for dialog when the action button is clicked on dialog. Note dialog should only close when action is canceled or after succesfully performing action. Fix any error. And also make sure the api request are handled correctly

---

_**Assistant**_

I'll help you add loading states and proper handlers to the dialog buttons. Let me update the code:

---

_****_

```diff
    const [isOpenApproval, setIsOpenApproval] = useState(false);
    const [isOpenDecline, setIsOpenDecline] = useState(false);
+   const [isApproving, setIsApproving] = useState(false);
+   const [isDeclining, setIsDeclining] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<IPendingWithdrawals | null>(
      null
  
    const handleApproveWithdrawal = async () => {
-     const response = await approveWithdrawal(selectedWithdrawal?.uuid);
+     if (!selectedWithdrawal?.uuid) return;
+ 
+     try {
+       setIsApproving(true);
+       const response = await approveWithdrawal(selectedWithdrawal.uuid);
        if (response?.success) {
+         // Update the local state to reflect the change
+         setLocalWithdrawals((prevWithdrawals) =>
+           prevWithdrawals.map((withdrawal) =>
+             withdrawal.uuid === selectedWithdrawal.uuid
+               ? { ...withdrawal, transaction_status: "success" }
+               : withdrawal
+           )
+         );
          setIsOpenApproval(false);
+       } else {
+         // Handle error case
+         console.error("Failed to approve withdrawal");
+       }
+     } catch (error) {
+       console.error("Error approving withdrawal:", error);
+     } finally {
+       setIsApproving(false);
      }
    };
  
    const handleDeclineWithdrawal = async () => {
-     const response = await declineWithdrawal(selectedWithdrawal?.uuid);
+     if (!selectedWithdrawal?.uuid) return;
+ 
+     try {
+       setIsDeclining(true);
+       const response = await declineWithdrawal(selectedWithdrawal.uuid);
        if (response?.success) {
+         // Update the local state to reflect the change
+         setLocalWithdrawals((prevWithdrawals) =>
+           prevWithdrawals.map((withdrawal) =>
+             withdrawal.uuid === selectedWithdrawal.uuid
+               ? { ...withdrawal, transaction_status: "declined" }
+               : withdrawal
+           )
+         );
          setIsOpenDecline(false);
+       } else {
+         // Handle error case
+         console.error("Failed to decline withdrawal");
+       }
+     } catch (error) {
+       console.error("Error declining withdrawal:", error);
+     } finally {
+       setIsDeclining(false);
      }
    };
                    color="gray"
                    className="w-fit"
+                   disabled={isApproving}
                  >
                    Cancel
                  </Button>
-                 <Button color="success" className="w-fit">
-                   Approve
+                 <Button
+                   color="success"
+                   className="w-fit"
+                   onClick={handleApproveWithdrawal}
+                   disabled={isApproving}
+                 >
+                   {isApproving ? (
+                     <>
+                       <svg
+                         className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
+                         xmlns="http://www.w3.org/2000/svg"
+                         fill="none"
+                         viewBox="0 0 24 24"
+                       >
+                         <circle
+                           className="opacity-25"
+                           cx="12"
+                           cy="12"
+                           r="10"
+                           stroke="currentColor"
+                           strokeWidth="4"
+                         ></circle>
+                         <path
+                           className="opacity-75"
+                           fill="currentColor"
+                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
+                         ></path>
+                       </svg>
+                       Approving...
+                     </>
+                   ) : (
+                     "Approve"
+                   )}
                  </Button>
                </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Are you sure you want to decline withdrawal request of{" "}
-                   <span className="font-medium">{selectedWithdrawal?.amount}</span> for{" "}
+                   <span className="font-medium">${selectedWithdrawal?.amount}</span> for{" "}
                    <span className="font-medium">{selectedWithdrawal?.user.name}</span>?
                  </p>
                </div>
  
                <div className="flex justify-end gap-3">
-                 <Button onClick={() => setIsOpenDecline(false)} color="gray" className="w-fit">
+                 <Button
+                   onClick={() => setIsOpenDecline(false)}
+                   color="gray"
+                   className="w-fit"
+                   disabled={isDeclining}
+                 >
                    Cancel
                  </Button>
  
-                 <Button color="failure" className="w-fit">
-                   Decline
+                 <Button
+                   color="failure"
+                   className="w-fit"
+                   onClick={handleDeclineWithdrawal}
+                   disabled={isDeclining}
+                 >
+                   {isDeclining ? (
+                     <>
+                       <svg
+                         className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
+                         xmlns="http://www.w3.org/2000/svg"
+                         fill="none"
+                         viewBox="0 0 24 24"
+                       >
+                         <circle
+                           className="opacity-25"
+                           cx="12"
+                           cy="12"
+                           r="10"
+                           stroke="currentColor"
+                           strokeWidth="4"
+                         ></circle>
+                         <path
+                           className="opacity-75"
+                           fill="currentColor"
+                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
+                         ></path>
+                       </svg>
+                       Declining...
+                     </>
+                   ) : (
+                     "Decline"
+                   )}
                  </Button>
                </div>
```

---

_****_



Let me fix the linter errors by checking the API response type:

---

_****_

<details>
            <summary>Searched codebase "approveWithdrawal or declineWithdrawal function definition" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `src/app/api/wallet.ts` | L1-22 |
| `src/app/api/auth/authOptions.ts` | L43-66 |
| `src/app/api/email/EmailData.tsx` | L463-501 |
| `src/app/api/ticket/TicketData.ts` | L79-118 |
| `src/app/api/userprofile/PostData.ts` | L252-252 |
| `src/app/api/auth/authOptions.ts` | L1-43 |
| `src/app/api/userprofile/UsersData.ts` | L97-145 |
| `src/app/api/email/EmailData.tsx` | L502-502 |
| `src/app/api/userprofile/UsersData.ts` | L145-190 |
| `src/app/api/userprofile/UsersData.ts` | L49-97 |
| `src/app/api/ticket.ts` | L1-20 |
| `src/app/api/market-square.ts` | L1-21 |
| `src/app/api/auth/[...nextauth]/route.ts` | L1-6 |
| `src/app/api/ticket/TicketData.ts` | L43-79 |
| `src/app/api/invoice/invoceLists.tsx` | L61-117 |
| `src/app/api/invoice/invoceLists.tsx` | L173-217 |
| `src/app/api/user.ts` | L1-20 |
| `src/app/api/userprofile/PostData.ts` | L1-81 |
| `src/app/api/contacts/ContactsData.tsx` | L480-504 |
| `src/app/api/email/EmailData.tsx` | L287-331 |
| `src/app/api/userprofile/PostData.ts` | L208-250 |
| `src/app/api/report.ts` | L1-41 |
| `src/app/api/email/EmailData.tsx` | L50-111 |
| `src/app/api/userprofile/PostData.ts` | L146-206 |
| `src/app/api/email/EmailData.tsx` | L243-287 |

</details>

---

_****_



Let me check the API response type:

---

_****_

Read file: src/lib/api.ts

---

_****_



Let me check the base API file:

---

_****_

Read file: src/lib/api/base.ts

---

_****_







Now I see the issue. The API response type has `status` instead of `success`. Let me fix the code:

---

_****_

```diff
        setIsApproving(true);
        const response = await approveWithdrawal(selectedWithdrawal.uuid);
-       if (response?.success) {
+       if (response?.status) {
          // Update the local state to reflect the change
          setLocalWithdrawals((prevWithdrawals) =>
        } else {
          // Handle error case
-         console.error("Failed to approve withdrawal");
+         console.error("Failed to approve withdrawal:", response?.message);
        }
      } catch (error) {
        setIsDeclining(true);
        const response = await declineWithdrawal(selectedWithdrawal.uuid);
-       if (response?.success) {
+       if (response?.status) {
          // Update the local state to reflect the change
          setLocalWithdrawals((prevWithdrawals) =>
        } else {
          // Handle error case
-         console.error("Failed to decline withdrawal");
+         console.error("Failed to decline withdrawal:", response?.message);
        }
      } catch (error) {
```

---

_****_







Now let me update the dialog buttons to properly handle the actions:

---

_****_

```diff
                  <Button
                    color="success"
-                   className="w-fit"
+                   className="w-fit min-w-[100px]"
                    onClick={handleApproveWithdrawal}
                    disabled={isApproving}
                  >
                    {isApproving ? (
-                     <>
-                       <svg
-                         className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
-                         xmlns="http://www.w3.org/2000/svg"
-                         fill="none"
-                         viewBox="0 0 24 24"
-                       >
-                         <circle
-                           className="opacity-25"
-                           cx="12"
-                           cy="12"
-                           r="10"
-                           stroke="currentColor"
-                           strokeWidth="4"
-                         ></circle>
-                         <path
-                           className="opacity-75"
-                           fill="currentColor"
-                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
-                         ></path>
-                       </svg>
+                     <div className="flex items-center gap-2">
+                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Approving...
-                     </>
+                     </div>
                    ) : (
                      "Approve"
                  <Button
                    color="failure"
-                   className="w-fit"
+                   className="w-fit min-w-[100px]"
                    onClick={handleDeclineWithdrawal}
                    disabled={isDeclining}
                  >
                    {isDeclining ? (
-                     <>
-                       <svg
-                         className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
-                         xmlns="http://www.w3.org/2000/svg"
-                         fill="none"
-                         viewBox="0 0 24 24"
-                       >
-                         <circle
-                           className="opacity-25"
-                           cx="12"
-                           cy="12"
-                           r="10"
-                           stroke="currentColor"
-                           strokeWidth="4"
-                         ></circle>
-                         <path
-                           className="opacity-75"
-                           fill="currentColor"
-                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
-                         ></path>
-                       </svg>
+                     <div className="flex items-center gap-2">
+                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Declining...
-                     </>
+                     </div>
                    ) : (
                      "Decline"
```

---

_****_







I've made several improvements to the withdrawal approval/decline functionality:

1. Fixed API Response Handling:
   - Changed `success` to `status` to match the API response type
   - Added proper error message handling from the response
   - Added null checks for the withdrawal UUID

2. Improved Loading States:
   - Added loading spinners to both approve and decline buttons
   - Disabled both action and cancel buttons during loading
   - Added minimum width to buttons to prevent layout shift
   - Used a simpler, more consistent loading spinner design

3. Better State Management:
   - The dialog only closes on successful action or cancel
   - Local state is updated immediately after successful action
   - Loading states are properly cleaned up in finally blocks

4. UI Improvements:
   - Added gap between spinner and text
   - Made loading states more visible
   - Ensured consistent button sizes during loading

The workflow now should be:
1. Click Approve/Decline -> Shows loading state
2. Button is disabled and shows spinner
3. Cancel button is also disabled during action
4. On success: Updates local state and closes dialog
5. On error: Shows error in console and keeps dialog open
6. Loading state is cleared in all cases

Let me know if you'd like any adjustments to the behavior or styling!

---

_**User**_

Help show toast message or error when action is successful using sonner (its already installed)

---

_**Assistant**_

I'll help you add toast notifications using Sonner for both success and error cases. First, let's import the toast function from Sonner and add notifications to our handlers:

---

_****_

```diff
  import WithdrawalDialog from "./WithdrawalDialog";
  import { approveWithdrawal, declineWithdrawal, getPendingWithdrawals } from "../api/wallet";
+ import { toast } from "sonner";
  
  const Withdrawals = ({
          );
          setIsOpenApproval(false);
+         toast.success("Withdrawal request approved successfully");
        } else {
          // Handle error case
+         toast.error(response?.message || "Failed to approve withdrawal");
          console.error("Failed to approve withdrawal:", response?.message);
        }
      } catch (error) {
        console.error("Error approving withdrawal:", error);
+       toast.error("An error occurred while approving withdrawal");
      } finally {
        setIsApproving(false);
          );
          setIsOpenDecline(false);
+         toast.success("Withdrawal request declined successfully");
        } else {
          // Handle error case
+         toast.error(response?.message || "Failed to decline withdrawal");
          console.error("Failed to decline withdrawal:", response?.message);
        }
      } catch (error) {
        console.error("Error declining withdrawal:", error);
+       toast.error("An error occurred while declining withdrawal");
      } finally {
        setIsDeclining(false);
```

---

_****_



I've added toast notifications for:

1. Success cases:
   - When a withdrawal is approved: "Withdrawal request approved successfully"
   - When a withdrawal is declined: "Withdrawal request declined successfully"

2. Error cases:
   - API error responses: Shows the error message from the API response
   - Generic error fallback: "An error occurred while approving/declining withdrawal"
   - Failed requests: Shows the specific failure message or a default message

The toasts will appear:
- Success toasts (green) when actions complete successfully
- Error toasts (red) when something goes wrong
- With the actual error message from the API when available
- With fallback messages when no specific error message is available

The notifications will help users understand:
- When their actions have been completed successfully
- If something went wrong and why
- The current state of their request

Let me know if you'd like to customize the toast messages or styling further!

---

_**User**_

Why this error?

Withdrawals.tsx:109 Failed to approve withdrawal: Cannot POST /v2/wallet/approve-withdrawal/135cb96e-295a-47ad-b658-8f1ad60afeb9
handleApproveWithdrawal	@	Withdrawals.tsx:109


---

_**Assistant**_



---



---

