import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-white border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">✓</span>
              </div>
            </div>
            <CardTitle className="text-3xl font-light text-black">Check Your Email</CardTitle>
            <CardDescription className="text-gray-600 text-base">We've sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 text-center">
            <p className="text-gray-700 mb-8 leading-relaxed">
              Thank you for joining Modernmen.CA! Please check your email and click the confirmation link to activate
              your account.
            </p>
            <Button asChild className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium">
              <Link href="/auth/login">Return to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
