// client/src/components/auth/LoginForm.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

type Props = {
  onLogin: (email: string, password: string) => void | Promise<void>;
};

export default function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const eNorm = email.trim().toLowerCase();

    if (!eNorm || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await onLogin(eNorm, password); // App.tsx will do Supabase auth + allowlist check
    } catch (err: any) {
      setError(err?.message ?? "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // optional quick-fill helpers for your three accounts
  const fill = (em: string) => setEmail(em);

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">QikMech Finance</CardTitle>
          <CardDescription className="text-center">
            Sign in with your allowed account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4" data-testid="form-login">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  data-testid="input-email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  data-testid="input-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading} data-testid="button-login">
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            {/* quick-fill (optional) — remove if you don't want them visible */}
            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <div className="flex flex-wrap gap-2 items-center">
                <span>Quick fill:</span>
                <Button type="button" variant="secondary" size="sm" onClick={() => fill("pominpoppip@gmail.com")}>
                  admin
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => fill("sooryamohan0001@gmail.com")}>
                  accountant
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => fill("gokulsaj2016@gmail.com")}>
                  staff
                </Button>
              </div>
              <p>Emails must be lowercase and exactly match the allowlist.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
