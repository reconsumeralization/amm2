import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-white border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">!</span>
              </div>
            </div>
            <CardTitle className="text-3xl font-light text-black">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 text-center">
            {params?.error ? (
              <p className="text-gray-700 mb-8">Error: {params.error}</p>
            ) : (
              <p className="text-gray-700 mb-8">An authentication error occurred. Please try again.</p>
            )}
            <div className="space-y-4">
              <Button asChild className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium">
                <Link href="/auth/login">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 border-gray-200 bg-transparent">
                <Link href="/auth/sign-up">Create New Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
