import React from 'react'

export function MapEmbed({ src }: { src?: string }) {
  return (
    <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500">
      {src ? (
        <iframe
          src={src}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
        />
      ) : (
        <>Map Placeholder</>
      )}
    </div>
  )
}
