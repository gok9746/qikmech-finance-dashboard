import { useEffect, useMemo, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { supabase } from "@/lib/supabaseClient";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginForm from "@/components/auth/LoginForm";
import JobsPage from "@/pages/JobsPage";
import SummaryPage from "@/pages/SummaryPage";
import ExpenseForm from "@/components/expenses/ExpenseForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Briefcase,
  CreditCard,
  FileText,
  LogOut,
  Settings,
  Shield,
  Download,
  FileSpreadsheet,
} from "lucide-react";

type Role = "admin" | "staff" | "accountant";
interface User { email: string; role: Role; }

// ---- Allowlist: only these three accounts may access the app
const ALLOWED_EMAILS = new Set<string>([
  "pominpoppip@gmail.com",      // admin
  "sooryamohan0001@gmail.com",  // accountant
  "gokulsaj2016@gmail.com",     // staff
]);

const ALLOWED_ROLES = new Set<Role>(["admin", "staff", "accountant"]); // UI behavior only
const DEBUG_ALLOWLIST = true;

// ===== Navigation (kept like your current design) =====
function Navigation({
  user, onLogout, currentPage, setCurrentPage,
}: { user: User; onLogout: () => void; currentPage: string; setCurrentPage: (p: string) => void }) {
  const items = useMemo(
    () =>
      [
        { title: "Jobs", page: "jobs", icon: Briefcase, roles: ["admin", "staff"] },
        { title: "Summary", page: "summary", icon: BarChart3, roles: ["admin", "accountant", "staff"] },
        { title: "Reports", page: "reports", icon: FileText, roles: ["admin", "accountant"] },
        { title: "Expenses", page: "expenses", icon: CreditCard, roles: ["admin"] },
        { title: "Audit Log", page: "audit", icon: Shield, roles: ["admin"] },
      ] as const,
    []
  );

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="border-b border-sidebar-border px-6 py-4">
        <h1 className="text-xl font-bold text-sidebar-primary">QikMech Finance</h1>
        <p className="text-sm text-sidebar-foreground/70 capitalize">{user.role} Dashboard</p>
      </div>
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {items.filter(i => (i.roles as readonly Role[]).includes(user.role)).map((item) => (
            <Button
              key={item.title}
              variant={currentPage === item.page ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentPage(item.page)}
              data-testid={`nav-${item.title.toLowerCase()}`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.title}
            </Button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentPage("settings")} data-testid="nav-settings">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={onLogout} data-testid="button-logout">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

// ===== Simple Reports page you had =====
function ReportsPage() {
  const handleExportPDF = () => alert("PDF report would be generated here!");
  const handleExportExcel = () => alert("Excel report would be generated here!");
  return (
    <div className="p-6 space-y-6" data-testid="page-reports">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate financial reports and exports</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />PDF Report</CardTitle>
            <CardDescription>Generate a comprehensive PDF report</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleExportPDF} data-testid="button-export-pdf">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" />Excel Export</CardTitle>
            <CardDescription>Export financial data to Excel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleExportExcel} data-testid="button-export-excel">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ExpensesPage() {
  return (
    <div className="p-6 space-y-6" data-testid="page-expenses">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
        <p className="text-muted-foreground">Track and manage business expenses</p>
      </div>
      <ExpenseForm onSubmit={() => { /* your existing handler or Supabase insert */ }} />
    </div>
  );
}

function AccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Access denied</CardTitle>
          <CardDescription className="text-center">This account is not allowed to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={onBack}>Back to login</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== MAIN APP (Auth + allowlist gate) =====
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("jobs");
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const normalizeEmail = (e: string | null | undefined) => (e ?? "").trim().toLowerCase();

  // Gate: allow if email in allowlist. Role/active refine UI/permissions but DB RLS still protects data.
  const checkAllowlist = async (uid: string, fallbackEmail: string | null) => {
    // Try to read the profile (role/active), but don't block if it fails.
    const { data: prof, error } = await supabase
      .from("profiles")
      .select("email, role, active")
      .eq("id", uid)
      .single();

    const email = normalizeEmail(prof?.email ?? fallbackEmail);
    const emailAllowed = ALLOWED_EMAILS.has(email);

    // If profile read errored, still allow based on email allowlist (we’ll default role to 'staff').
    if (error) {
      if (DEBUG_ALLOWLIST) console.warn("profiles read error (soft-allow by email):", error);
      return { allowed: emailAllowed as const, email, role: ("staff" as Role), reason: emailAllowed ? "soft-allow-by-email" : "email-not-allowed" };
    }

    // If profile exists, treat active=null as true (tolerant), and use role if valid.
    const active = prof?.active === false ? false : true;
    const role = (ALLOWED_ROLES.has((prof?.role as Role) ?? "staff") ? (prof?.role as Role) : "staff");

    const allowed = emailAllowed && active;
    const reason = !emailAllowed ? "email-not-allowed" : (!active ? "inactive-profile" : "ok");
    return { allowed: allowed as const, email, role, reason };
  };

  // Restore session on refresh
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session;
      if (!s?.user) { setCheckingSession(false); return; }

      const res = await checkAllowlist(s.user.id, s.user.email ?? null);
      if (!res.allowed) {
        if (DEBUG_ALLOWLIST) console.warn("Access denied on restore:", res);
        setAccessDenied(true);
        await supabase.auth.signOut();
        setUser(null);
        setCheckingSession(false);
        return;
      }
      setAccessDenied(false);
      setUser({ email: res.email, role: res.role });
      setCurrentPage(res.role === "staff" ? "jobs" : "summary");
      setCheckingSession(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) { setUser(null); return; }
      const res = await checkAllowlist(session.user.id, session.user.email ?? null);
      if (!res.allowed) {
        if (DEBUG_ALLOWLIST) console.warn("Access denied on state change:", res);
        setAccessDenied(true);
        await supabase.auth.signOut();
        setUser(null);
        return;
      }
      setAccessDenied(false);
      setUser({ email: res.email, role: res.role });
      setCurrentPage(res.role === "staff" ? "jobs" : "summary");
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  // Login with Supabase email/password
  const handleLogin = async (email: string, password: string) => {
    setAccessDenied(false);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) { alert("Invalid email or password"); return; }

    const res = await checkAllowlist(data.user.id, data.user.email ?? null);
    if (!res.allowed) {
      if (DEBUG_ALLOWLIST) console.warn("Access denied on login:", res);
      setAccessDenied(true);
      await supabase.auth.signOut();
      alert("Access denied for this account.");
      return;
    }
    setUser({ email: res.email, role: res.role });
    setCurrentPage(res.role === "staff" ? "jobs" : "summary");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage("jobs");
  };

  const renderCurrentPage = () => {
    if (!user) return null;
    switch (currentPage) {
      case "jobs": return <JobsPage userRole={user.role} />;
      case "summary": return <SummaryPage userRole={user.role} />;
      case "expenses": return user.role === "admin" ? <ExpensesPage /> : <div className="p-6">Access Denied</div>;
      case "reports": return (user.role === "admin" || user.role === "accountant") ? <ReportsPage /> : <div className="p-6">Access Denied</div>;
      case "audit": return user.role === "admin" ? <div className="p-6">Audit Log (Coming Soon)</div> : <div className="p-6">Access Denied</div>;
      case "settings": return <div className="p-6">Settings (Coming Soon)</div>;
      default: return <JobsPage userRole={user.role} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {checkingSession ? (
          <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>
        ) : !user ? (
          accessDenied ? (
            <AccessDenied onBack={() => setAccessDenied(false)} />
          ) : (
            <LoginForm onLogin={handleLogin} />
          )
        ) : (
          <div className="flex h-screen bg-background" data-testid="app-dashboard">
            <Navigation user={user} onLogout={handleLogout} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-1 overflow-auto">{renderCurrentPage()}</main>
          </div>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
