import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="glass">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-destructive to-destructive/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-destructive">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="p-6 glass rounded-lg border border-destructive/50 bg-destructive/10">
              <h3 className="text-lg font-semibold mb-2 text-destructive">Something went wrong</h3>
              {params?.error ? (
                <p className="text-sm text-muted-foreground">Error: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">An unspecified authentication error occurred.</p>
              )}
            </div>
            <div className="space-y-3">
              <Button className="w-full neon-glow" asChild>
                <Link href="/auth/login">Try Again</Link>
              </Button>
              <Button variant="outline" className="w-full glass bg-transparent" asChild>
                <Link href="/">Back to Tournament</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
