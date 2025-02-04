## SpecStory

## Fixing 'withdrawals' Variable Error in Code (04/02/2025, 11:40:11)

_**User**_

For the code present, we get this error:
```
Cannot find name 'withdrawals'. Did you mean 'Withdrawals'?
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because `withdrawals` is not defined. You need to fetch the withdrawals data similar to how other data is being fetched in the Promise.all array. Here's the fix:

```typescript:src/app/(DashboardLayout)/page.tsx
// ... existing code ...
import { getWithdrawals } from "../api/withdrawal"; // Add this import at the top

const Page = async ({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  // ... existing code ...
  const [userStats, postStats, marketSquareStats, liveStreamStats, echoStats, users, withdrawals] =
    await Promise.all([
      getUserStats(),
      getPostStats(),
      getMarketSquareStats(),
      getLivestreamStats(),
      getEchoStats(),
      getUsers(page, limit),
      getWithdrawals(), // Add this line
    ]);
    
  // ... rest of the existing code ...
```

You'll need to create the `getWithdrawals` API function in your API folder if it doesn't exist already. Let me know if you need help with that as well.

---

_**User**_

For the code present, we get this error:
```
Type 'IPendingWithdrawalsResponse | null' is not assignable to type 'IPendingWithdrawals[] | null'.
  Type 'IPaginatedResponse<IPendingWithdrawals[]>' is missing the following properties from type 'IPendingWithdrawals[]': length, pop, push, concat, and 35 more.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because we need to access the `data.data` property of the paginated response. Here's the fix:

```typescript:src/app/(DashboardLayout)/page.tsx
// ... existing code ...
        <div className="lg:col-span-4 col-span-12">
          <Withdrawals
            selectedWithdrawalID={selectedWithdrawalID}
            withdrawals={withdrawals?.data?.data || null}
            totalPages={withdrawals?.data?.last_page || 1}
            currentPage={pWPage}
            pageSize={pWLimit}
          />
        </div>
// ... existing code ...
```

The key change is `withdrawals?.data?.data || null` instead of `withdrawals?.data || null` to access the actual array of withdrawals inside the paginated response.

---

_**User**_

For the code present, we get this error:
```
Argument of type 'IPendingWithdrawals[] | null' is not assignable to parameter of type 'SetStateAction<IPendingWithdrawals | null>'.
  Type 'IPendingWithdrawals[]' is not assignable to type 'SetStateAction<IPendingWithdrawals | null>'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_****_

For the code present, we get this error:
```
Argument of type 'IPendingWithdrawals[] | null' is not assignable to parameter of type 'SetStateAction<IPendingWithdrawals | null>'.
  Type 'IPendingWithdrawals[]' is not assignable to type 'SetStateAction<IPendingWithdrawals | null>'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because we're passing an array to a state that expects a single object. Here's the fix:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
// ... existing code ...
  useEffect(() => {
    if (selectedWithdrawalID && withdrawals?.data) {
      setSelectedWithdrawal(
        withdrawals.data.find((withdrawal) => withdrawal.uuid === selectedWithdrawalID) ||
          null
      );
    }
  }, [selectedWithdrawalID, withdrawals]);
// ... existing code ...
```

The key change is accessing `withdrawals.data` instead of `withdrawals?.data?.find`, since `withdrawals` is already the array of pending withdrawals.

---

_**User**_

For the code present, we get this error:
```
Argument of type 'IPendingWithdrawals[] | null' is not assignable to parameter of type 'SetStateAction<IPendingWithdrawals | null>'.
  Type 'IPendingWithdrawals[]' is not assignable to type 'SetStateAction<IPendingWithdrawals | null>'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The issue is with the type of `withdrawals`. Let's fix the prop type:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
const Withdrawals = ({
  selectedWithdrawalID,
  withdrawals,
  totalPages,
  currentPage,
  pageSize,
}: {
  selectedWithdrawalID: string;
  withdrawals: IPendingWithdrawals[] | null;  // Changed from IPendingWithdrawalsResponse
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  // ... existing code ...
  useEffect(() => {
    if (selectedWithdrawalID && withdrawals) {
      setSelectedWithdrawal(
        withdrawals.find((withdrawal) => withdrawal.uuid === selectedWithdrawalID) || null
      );
    }
  }, [selectedWithdrawalID, withdrawals]);
  // ... rest of the code ...
```

This change aligns the prop type with how it's being used in the component.

---

_**User**_

For the code present, we get this error:
```
Argument of type 'IPendingWithdrawals[] | null' is not assignable to parameter of type 'SetStateAction<IPendingWithdrawals | null>'.
  Type 'IPendingWithdrawals[]' is not assignable to type 'SetStateAction<IPendingWithdrawals | null>'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_



The issue is with the type mismatch. Here's the fix for `Withdrawals.tsx`:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
  useEffect(() => {
    if (selectedWithdrawalID && withdrawals) {
      const withdrawal = withdrawals.find((w) => w.uuid === selectedWithdrawalID);
      setSelectedWithdrawal(withdrawal || null);
    }
  }, [selectedWithdrawalID, withdrawals]);
```

And update the component props type:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
const Withdrawals = ({
  selectedWithdrawalID,
  withdrawals,
  totalPages,
  currentPage,
  pageSize,
}: {
  selectedWithdrawalID: string;
  withdrawals: IPendingWithdrawals[] | null;  // Changed from IPendingWithdrawalsResponse
  totalPages: number;
  currentPage: number;
  pageSize: number;
})
```

This aligns the types with how the data is being passed from the parent component.

---

_**User**_

For the code present, we get this error:
```
Property 'profile_picture' does not exist on type 'IWithdrawalUser'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_



Looking at the types, we need to access one level deeper into the user object. Here's the fix:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
// ... existing code ...
          {!!withdrawals?.length && withdrawals?.map((item) => (
            <div className="flex gap-3 items-center" key={item.uuid}>
              <div className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative bg-light${item.bgcolor} dark:bg-dark${item.bgcolor}`}>
                <Image src={item.user.user.profile_picture} fill alt="icon" className="h-6 w-6 rounded-full" />
              </div>
              <h5 className="text-base">{item.user.user.name}</h5>
              <div className={`ms-auto font-medium text-ld ${item.disable}`}>{item.amount}</div>
// ... existing code ...
```

The key change is accessing `item.user.user.profile_picture` and `item.user.user.name` instead of `item.user.profile_picture` and `item.user.name`.

---

_**User**_

For the code present, we get this error:
```
Type 'IPendingWithdrawalsResponse | null' is not assignable to type 'IPendingWithdrawals[] | null'.
  Type 'IPaginatedResponse<IPendingWithdrawals[]>' is missing the following properties from type 'IPendingWithdrawals[]': length, pop, push, concat, and 35 more.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_



We need to pass the data array from the paginated response. Here's the fix for `page.tsx`:

```typescript:src/app/(DashboardLayout)/page.tsx
          <Withdrawals
            selectedWithdrawalID={selectedWithdrawalID}
            withdrawals={pendingWithdrawals?.data?.data || null}
            totalPages={pendingWithdrawals?.data?.last_page || 1}
            currentPage={pWPage}
            pageSize={pWLimit}
          />
```

The key change is `pendingWithdrawals?.data?.data || null` instead of `pendingWithdrawals?.data || null` to access the array inside the paginated response.

---

_**User**_

For the code present, we get this error:
```
Block-scoped variable 'withdrawal' used before its declaration.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_



Here's the fix for the incomplete withdrawal assignment in `Withdrawals.tsx`:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
  useEffect(() => {
    if (selectedWithdrawalID && withdrawals?.data) {
      const withdrawal = withdrawals.data.find((w) => w.uuid === selectedWithdrawalID);
      setSelectedWithdrawal(withdrawal || null);
    }
  }, [selectedWithdrawalID, withdrawals]);
```

The issue was that the withdrawal assignment was incomplete. This fix properly finds the withdrawal in the paginated data array.

---

_**User**_

Help add warning for declined

---

_**Assistant**_



I'll add warning color styling for declined transactions. Here's the fix:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
                <div
                  className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative bg-light${
                    item.transaction_status === "pending"
                      ? "primary"
                      : item.transaction_status === "failed"
                      ? "error"
                      : item.transaction_status === "declined"
                      ? "warning"
                      : "success"
                  } dark:bg-dark${
                    item.transaction_status === "pending"
                      ? "primary"
                      : item.transaction_status === "failed"
                      ? "error"
                      : item.transaction_status === "declined"
                      ? "warning" 
                      : "success"
                  }`}
                >
```

This adds a warning color for transactions with "declined" status, while keeping the existing colors for other statuses.

---

_**User**_

For the code present, we get this error:
```
Property 'transaction_status' does not exist on type 'IPendingWithdrawals[]'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_



The error occurs because we're trying to access `transaction_status` on the array instead of the individual item. Here's the fix:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
          {!!withdrawals?.data?.length &&
            withdrawals.data.map((item) => (
              <div className="flex gap-3 items-center" key={item.uuid}>
                <div
                  className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative bg-light${
                    item.transaction_fee === "pending"
                      ? "primary"
                      : item.transaction_fee === "success"
                      ? "success"
                      : item.transaction_fee === "declined"
                      ? "warning"
                      : "error"
                  } dark:bg-dark${
                    item.transaction_fee === "pending"
                      ? "primary"
                      : item.transaction_fee === "success"
                      ? "success"
                      : item.transaction_fee === "declined"
                      ? "warning"
                      : "error"
                  }`}
                >
```

The key changes are:
1. Using `withdrawals.data.map` instead of `withdrawals?.data?.map`
2. Using `transaction_fee` instead of `transaction_status` since that's the typed field in the interface

---

_**User**_

Nah

---

_**Assistant**_

<think>
Okay, let's tackle this problem. The user is getting an error that says "Property 'transaction_status' does not exist on type 'IPendingWithdrawals[]'." They mentioned that they tried to add a warning for declined transactions, which probably involved using the 'transaction_status' property. 

First, I need to check the type definitions. Looking at the provided types in types.d.ts, the IPendingWithdrawals interface has a property called 'transaction_status' and another called 'transaction_fee'. Wait, in a previous edit, the user changed 'transaction_fee' to be a union type of 'pending' | 'success' | 'declined', but maybe that was a mistake. Let me confirm.

In the types.d.ts file, the IPendingWithdrawals interface has:
- transaction_status: string
- transaction_fee: 'pending' | 'success' | 'declined'

But the user's code is using 'transaction_status' to determine the status. However, the type for 'transaction_status' is just a string, while 'transaction_fee' is the one with the specific union. That seems like a possible mix-up. 

Wait, maybe the user intended to use 'transaction_status' for the status (like pending, success, declined) and 'transaction_fee' for the fee amount. But in their code, they're checking 'transaction_fee' as if it's the status. That's probably the issue. 

Looking at the Withdrawals.tsx file, the recent edit changed references from 'transaction_status' to 'transaction_fee', which is incorrect because 'transaction_fee' is supposed to represent the fee, not the status. So the error occurs because 'transaction_status' is the correct property that exists on IPendingWithdrawals, not 'transaction_fee'. 

The user's error message says that 'transaction_status' doesn't exist on the array, but that's a red herring. The real issue is that in the code, after a previous edit, they mistakenly used 'transaction_fee' instead of 'transaction_status'. 

So the fix is to revert those changes and use 'transaction_status' where appropriate. Additionally, ensuring that the type for 'transaction_status' in the interface is correctly defined as a union of possible statuses (like 'pending', 'success', 'declined') would prevent such errors. 

In the types.d.ts, the 'transaction_status' is currently a string. Updating it to a union type would help with type safety. Then, in the Withdrawals component, using 'transaction_status' instead of 'transaction_fee' in the conditional checks would resolve the error.
</think>

The core issue is a mismatch between the type definition and implementation. Here's the proper fix:

```typescript:src/types/types.d.ts
interface IPendingWithdrawals {
    uuid: string,
    amount: string,
    currency_id: string,
    user_id: string,
    wallet_id: string,
    transaction_type: string,
    transaction_category: string,
    transaction_status: 'pending' | 'success' | 'declined', // Correct status field
    transaction_fee: string, // Keep fee as string
    description: string,
    transaction_id: string,
    payment_method: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
    user: IWithdrawalUser
}
```

Then update the component to use `transaction_status`:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
<div 
  className={`h-10 w-10 shrink-0 rounded-full flex justify-center items-center relative bg-light${
    item.transaction_status === "pending"
      ? "primary"
      : item.transaction_status === "success" 
      ? "success"
      : "warning" // declined
  } dark:bg-dark${
    item.transaction_status === "pending"
      ? "primary"
      : item.transaction_status === "success"
      ? "success"
      : "warning"
  }`}
>
```

This aligns with the actual status field in the interface while maintaining the fee as a string type.

---

_**User**_

For the code present, we get this error:
```
Type '{ children: string; variant: string; color: string; className: string; }' is not assignable to type 'IntrinsicAttributes & { href?: string | undefined; color?: keyof FlowbiteColors | undefined; fullSized?: boolean | undefined; gradientDuoTone?: keyof ButtonGradientDuoToneColors | undefined; ... 10 more ...; theme?: { ...; } | undefined; } & AsProp<...> & { ...; } & Omit<...> & { ...; }'.
  Property 'variant' does not exist on type 'IntrinsicAttributes & { href?: string | undefined; color?: keyof FlowbiteColors | undefined; fullSized?: boolean | undefined; gradientDuoTone?: keyof ButtonGradientDuoToneColors | undefined; ... 10 more ...; theme?: { ...; } | undefined; } & AsProp<...> & { ...; } & Omit<...> & { ...; }'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

<think>
Okay, let's tackle this error. The user is getting a TypeScript error saying that the 'variant' property doesn't exist on the Button component from Flowbite React. 

First, I remember that sometimes UI libraries have specific props they accept. Maybe the Button component from Flowbite doesn't support a 'variant' prop, or perhaps it's named differently. 

I'll check the Flowbite React documentation for the Button component. Oh, right, Flowbite's Button uses 'color' to set the color, but for outline styles, they might have a different prop. Wait, maybe the correct prop is 'outline' instead of 'variant'. 

Looking at the error message again, the user is trying to set variant="outline". In Flowbite React, Buttons have an 'outline' boolean prop to switch to the outline style. So instead of using 'variant', they should use the 'outline' prop.

So the fix would be to replace variant="outline" with outline={true} or just outline. That should resolve the type error because 'outline' is a valid prop for the Button component.
</think>

The error occurs because the `variant` prop isn't supported by Flowbite's Button component. Use the `outline` prop instead:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
<Button color={"red"} className="w-fit" outline>
  Cancel
</Button>
```

This is the correct way to create an outlined button in Flowbite React. The `outline` prop is a boolean that toggles the button style.

---

_**User**_

Help make this dialog looks better, and again the title is currently not showing

---

_**Assistant**_



Here's an improved version of the dialog with better styling and a visible title:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
              <DialogPanel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-[500px] flex flex-col p-6 gap-6 rounded-lg bg-white dark:bg-darkgray shadow-md dark:dark-shadow-md"
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold">
                    Approve Withdrawal
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Are you sure you want to approve withdrawal request of{" "}
                    <span className="font-medium">{selectedWithdrawal?.amount}</span> for{" "}
                    <span className="font-medium">{selectedWithdrawal?.user.name}</span>?
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    onClick={() => setIsOpen(false)}
                    color="gray" 
                    className="w-fit"
                  >
                    Cancel
                  </Button>
                  <Button 
                    color="success" 
                    className="w-fit"
                  >
                    Approve
                  </Button>
                </div>
              </DialogPanel>
```

Key improvements:
1. Reduced max width for better dialog appearance
2. Added proper padding and spacing
3. Added a clear title and descriptive message
4. Improved button styling with proper spacing
5. Added user amount and name in the confirmation message
6. Used semantic heading tags
7. Added proper color contrast for dark mode

---

_**User**_

When this button is clicked, help fetch more withdrawal data and add it to the bottom of the existing one, when last page is reach, we stop fetching. We can show a little info at the bottom of the button saying all withdrawal data is fetched @wallet.ts 

---

_**Assistant**_



I'll help implement the infinite scroll functionality for withdrawals. First, let's update the wallet API:

```typescript:src/app/api/wallet.ts
'use server'

import { apiGet } from '@/lib/api';
import { getToken } from '@/lib/getToken';

export const getPendingWithdrawals = async (page: number = 1, limit: number = 20) => {
    const token = await getToken()
    return await apiGet<IPendingWithdrawalsResponse>(
        `/wallet/pending-withdrawals?page=${page}&limit=${limit}`,
        token
    );
};
```

Then update the Withdrawals component to handle loading more data:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
const Withdrawals = ({
  selectedWithdrawalID,
  withdrawals,
  totalPages,
  currentPage,
  pageSize,
}: {
  selectedWithdrawalID: string;
  withdrawals: IPendingWithdrawalsResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localWithdrawals, setLocalWithdrawals] = useState<IPendingWithdrawals[]>([]);
  const [currentLocalPage, setCurrentLocalPage] = useState(1);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    if (withdrawals?.data) {
      setLocalWithdrawals(withdrawals.data);
      setCurrentLocalPage(currentPage);
      setHasReachedEnd(currentPage >= totalPages);
    }
  }, [withdrawals, currentPage, totalPages]);

  const loadMore = async () => {
    if (isLoading || hasReachedEnd) return;
    
    try {
      setIsLoading(true);
      const nextPage = currentLocalPage + 1;
      const moreWithdrawals = await getPendingWithdrawals(nextPage, pageSize);
      
      if (moreWithdrawals?.data?.data) {
        setLocalWithdrawals(prev => [...prev, ...moreWithdrawals.data.data]);
        setCurrentLocalPage(nextPage);
        setHasReachedEnd(nextPage >= (moreWithdrawals.data.last_page || totalPages));
      }
    } catch (error) {
      console.error('Error loading more withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your component code ...

  return (
    <>
      <CardBox>
        {/* ... existing code ... */}
        <div className="mt-5 flex flex-col gap-4">
          {!!localWithdrawals.length &&
            localWithdrawals.map((item) => (
              // ... your existing withdrawal item code ...
            ))}
        </div>
        <div className="border-t border-ld mt-6">
          {hasReachedEnd ? (
            <p className="text-center text-gray-500 text-sm mt-4">
              All withdrawals have been loaded
            </p>
          ) : (
            <Button 
              color="primary" 
              className="w-full mt-7"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'View More'}
            </Button>
          )}
        </div>
      </CardBox>
      {/* ... rest of your component code ... */}
    </>
  );
};
```

This implementation:
1. Maintains a local state of withdrawals that can be appended to
2. Tracks loading state and whether we've reached the last page
3. Loads more data when the "View More" button is clicked
4. Shows a message when all data has been loaded
5. Disables the button during loading
6. Preserves all existing functionality while adding the load more feature

The button will be replaced with a message once all withdrawals have been loaded, and it shows a loading state while fetching more data.

---

_**User**_



---

_**Assistant**_



Let me fix both the TypeScript errors and improve the message. Here's the updated code:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
  useEffect(() => {
    if (withdrawals?.data?.data) {
      setLocalWithdrawals(withdrawals.data.data);
      setCurrentLocalPage(currentPage);
      setHasReachedEnd(currentPage >= totalPages);
    }
  }, [withdrawals, currentPage, totalPages]);

  const loadMore = async () => {
    if (isLoading || hasReachedEnd) return;

    try {
      setIsLoading(true);
      const nextPage = currentLocalPage + 1;
      const moreWithdrawals = await getPendingWithdrawals(nextPage, pageSize);

      if (moreWithdrawals?.data?.data) {
        setLocalWithdrawals((prev) => [...prev, ...moreWithdrawals.data.data]);
        setCurrentLocalPage(nextPage);
        setHasReachedEnd(nextPage >= (moreWithdrawals.data.last_page || totalPages));
      }
    } catch (error) {
      console.error("Error loading more withdrawals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the component ...

  <div className="border-t border-ld mt-6">
    {hasReachedEnd ? (
      <p className="text-center text-gray-500 text-sm mt-4">
        No more withdrawals to show
      </p>
    ) : (
      <Button
        color="primary"
        className="w-full mt-7"
        onClick={loadMore}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "View More"}
      </Button>
    )}
  </div>
```

Key changes:
1. Fixed TypeScript errors by properly accessing `data.data` from the response
2. Changed the end message to be more user-friendly
3. Added proper type safety checks with optional chaining

---

_**User**_

Hmm, still errors

---

_**Assistant**_



Let me fix those TypeScript errors. The main issue is with the state management and types:

```typescript:src/app/(DashboardLayout)/Withdrawals.tsx
const Withdrawals = ({
  selectedWithdrawalID,
  withdrawals,
  totalPages,
  currentPage,
  pageSize,
}: {
  selectedWithdrawalID: string;
  withdrawals: IPendingWithdrawalsResponse | null;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localWithdrawals, setLocalWithdrawals] = useState<IPendingWithdrawals[]>([]);
  const [currentLocalPage, setCurrentLocalPage] = useState(1);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    if (withdrawals?.data?.data) {
      setLocalWithdrawals([...withdrawals.data.data]);
      setCurrentLocalPage(currentPage);
      setHasReachedEnd(currentPage >= totalPages);
    }
  }, [withdrawals, currentPage, totalPages]);

  const loadMore = async () => {
    if (isLoading || hasReachedEnd) return;

    try {
      setIsLoading(true);
      const nextPage = currentLocalPage + 1;
      const moreWithdrawals = await getPendingWithdrawals(nextPage, pageSize);

      if (moreWithdrawals?.data?.data) {
        setLocalWithdrawals(prevWithdrawals => [...prevWithdrawals, ...moreWithdrawals.data.data]);
        setCurrentLocalPage(nextPage);
        if (moreWithdrawals.data.last_page) {
          setHasReachedEnd(nextPage >= moreWithdrawals.data.last_page);
        }
      }
    } catch (error) {
      console.error("Error loading more withdrawals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the component remains the same
```

Key changes:
1. Used spread operator to create new arrays when setting state
2. Added type safety checks for the paginated response
3. Improved the logic for checking last page
4. Fixed array spreading in state updates to maintain proper types

---



---

