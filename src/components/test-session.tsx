'use client'

import { useSession } from 'next-auth/react'

export function TestSession() {
  const { data: session, status } = useSession()

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Session Test</h3>
      <p>Status: {status}</p>
      {session ? (
        <div>
          <p>User: {session.user?.name}</p>
          <p>Email: {session.user?.email}</p>
          <p>Role: {session.user?.role}</p>
        </div>
      ) : (
        <p>No session</p>
      )}
    </div>
  )
}
