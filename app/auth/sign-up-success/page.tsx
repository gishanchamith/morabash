import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="glass">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Account Created!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please check your email to confirm your account
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="p-6 glass rounded-lg">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verification Email Sent</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to your email address. Please click the link to activate your admin
                account and start managing the tournament.
              </p>
            </div>
            <div className="space-y-3">
              <Button className="w-full neon-glow" asChild>
                <Link href="/auth/login">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Go to Login
                </Link>
              </Button>
              <Button variant="outline" className="w-full glass bg-transparent" asChild>
                <Link href="/">Back to Tournament</Link>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Didn't receive the email? Check your spam folder or contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
