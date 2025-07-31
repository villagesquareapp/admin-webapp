'use client';

import React, {Suspense} from 'react'
import AdminUsersComp from './AdminUsersComp'

const Page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminUsersComp />
      </Suspense>
    </div>
  );
}

export default Page;