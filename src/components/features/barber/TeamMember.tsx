import React from 'react'
import Image from 'next/image'

type TeamMemberProps = {
  name: string
  specialty?: string
  role?: string
  bio?: string
  image?: string
}

export function TeamMember({ name, specialty, role, bio, image }: TeamMemberProps) {
  return (
    <div className="card-premium p-6 text-center">
      {image ? (
        <Image src={image} alt={name} width={96} height={96} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 mx-auto mb-4 flex items-center justify-center text-gray-500">IMG</div>
      )}
      <h3 className="text-lg font-semibold text-black dark:text-white">{name}</h3>
      <p className="text-red-600 text-sm mb-2">{role || specialty}</p>
      {bio && <p className="text-sm text-gray-600 dark:text-gray-300">{bio}</p>}
    </div>
  )
}
