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
          <p>User: {(session as any).user?.name}</p>
          <p>Email: {(session as any).user?.email}</p>
          <p>Role: {(session as any).user?.role}</p>
        </div>
      ) : (
        <p>No session</p>
      )}
    </div>
  )
}
