import React from 'react';

export function UserNav() {
  return (
    <div aria-label="User navigation" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Simple user icon placeholder */}
      <span style={{ fontSize: 20 }}>👤</span>
      <span>User</span>
    </div>
  );
} 