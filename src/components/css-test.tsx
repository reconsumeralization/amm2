'use client'

export function CSSTest() {
  return (
    <div className="p-8 bg-blue-500 text-white rounded-lg shadow-lg m-4">
      <h1 className="text-2xl font-bold mb-4">CSS Test Component</h1>
      <p className="text-lg">If you can see this styled content, CSS is working!</p>
      <div className="mt-4 space-y-2">
        <div className="bg-red-500 p-2 rounded">Red background</div>
        <div className="bg-green-500 p-2 rounded">Green background</div>
        <div className="bg-yellow-500 p-2 rounded">Yellow background</div>
      </div>
      <button className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">
        Test Button
      </button>
    </div>
  )
}
