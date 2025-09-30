import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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

import supabase from "@/lib/supabaseClient";

interface User {
  email: string;
  role: "admin" | "staff" | "accountant";
}

const ALLOWLIST: Record<string, User["role"]> = {
  "pominpoppi@gmail.com": "admin",
  "sooryamohan0001@gmail.com": "accountant",
  "gokulsaji2016@gmail.com": "staff",
};

const EXPENSES_STORAGE_KEY = "qm_expenses_v1";

function Navigation({
  user,
  onLogout,
  currentPage,
  setCurrentPage,
}: {
  user: User;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  const getMenuItems = () => {
    const baseItems = [
      { title: "Jobs", page: "jobs", icon: Briefcase, roles: ["admin", "staff"] },
      { title: "Summary", page: "summary", icon: BarChart3, roles: ["admin", "accountant"] },
      { title: "Reports", page: "reports", icon: FileText, roles: ["admin", "accountant"] },
    ];
    const adminItems = [
      { title: "Expenses", page: "expenses", icon: CreditCard, roles: ["admin"] },
      { title: "Audit Log", page: "audit", icon: Shield, roles: ["admin"] },
    ];
    return [...baseItems, ...adminItems].filter((item) => item.roles.includes(user.role));
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="border-b border-sidebar-border px-6 py-4">
        <h1 className="text-xl font-bold text-sidebar-primary">QikMech Finance</h1>
        <p className="text-sm text-sidebar-foreground/70 capitalize">{user.role} Dashboard</p>
      </div>

      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {getMenuItems().map((item) => (
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
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setCurrentPage("settings")}
          data-testid="nav-settings"
        >
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

function ReportsPage() {
  const handleExportPDF = () => {
    alert("PDF report would be generated here!");
  };
  const handleExportExcel = () => {
    alert("Excel report would be generated here!");
  };
  return (
    <div className="p-6 space-y-6" data-testid="page-reports">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate financial reports and exports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              PDF Report
            </CardTitle>
            <CardDescription>Generate a comprehensive PDF report with all financial data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportPDF} className="w-full" data-testid="button-export-pdf">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Excel Export
            </CardTitle>
            <CardDescription>Export financial data to Excel for further analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportExcel} className="w-full" data-testid="button-export-excel">
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
  const handleExpenseSubmit = (expense: any) => {
    try {
      const newExpense = {
        id: crypto.randomUUID(),
        date: expense?.date ?? new Date().toISOString().slice(0, 10),
        category: String(expense?.category ?? "Other"),
        amount_eur: Number(expense?.amount_eur ?? 0),
        note: expense?.note ? String(expense.note) : null,
      };
      const existing = JSON.parse(localStorage.getItem(EXPENSES_STORAGE_KEY) || "[]");
      const next = Array.isArray(existing) ? [newExpense, ...existing] : [newExpense];
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(next));
      alert(`Added expense: €${newExpense.amount_eur.toFixed(2)} for ${newExpense.category}`);
    } catch (err) {
      console.error("Failed to save expense", err);
      alert("Failed to save expense. Please try again.");
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="page-expenses">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
        <p className="text-muted-foreground">Track and manage business expenses</p>
      </div>
      <ExpenseForm onSubmit={handleExpenseSubmit} />
      <p className="text-xs text-muted-foreground">
        Tip: after adding an expense, open <span className="font-medium">Summary</span> to see the totals update.
      </p>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("jobs");

  const handleLogin = async (email: string, password: string) => {
    const e = email.trim().toLowerCase();

    // Frontend allowlist
    const allowRole = ALLOWLIST[e];
    if (!allowRole) {
      console.warn("Access denied on login", { email: e, reason: "email-not-allowed" });
      alert("Access denied: this email is not allowed.");
      return;
    }

    // Supabase auth
    const { error } = await supabase.auth.signInWithPassword({ email: e, password });
    if (error) {
      console.error("Supabase sign-in failed", error);
      alert("Sign-in failed. Check your email/password.");
      return;
    }

    // Optional: load profile role/active. If not found, fall back to allowlist role.
    let finalRole: User["role"] = allowRole;
    try {
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("role, active")
        .eq("email", e)
        .maybeSingle();

      if (pErr) console.warn("Profile load error (continuing with allowlist role):", pErr.message);
      if (profile) {
        if (profile.active === false) {
          alert("Your account is inactive. Contact admin.");
          await supabase.auth.signOut();
          return;
        }
        if (profile.role === "admin" || profile.role === "staff" || profile.role === "accountant") {
          finalRole = profile.role;
        }
      }
    } catch (err) {
      console.warn("Profile lookup failed, using allowlist role");
    }

    const nextUser: User = { email: e, role: finalRole };
    setUser(nextUser);

    // landing page by role
    if (finalRole === "staff") setCurrentPage("jobs");
    else if (finalRole === "accountant") setCurrentPage("summary");
    else setCurrentPage("summary");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage("jobs");
  };

  const renderCurrentPage = () => {
    if (!user) return null;
    switch (currentPage) {
      case "jobs":
        return <JobsPage userRole={user.role} />;
      case "summary":
        return <SummaryPage userRole={user.role} />;
      case "expenses":
        return user.role === "admin" ? <ExpensesPage /> : <div className="p-6">Access Denied</div>;
      case "reports":
        return user.role === "admin" || user.role === "accountant" ? (
          <ReportsPage />
        ) : (
          <div className="p-6">Access Denied</div>
        );
      case "audit":
        return user.role === "admin" ? <div className="p-6">Audit Log (Coming Soon)</div> : <div className="p-6">Access Denied</div>;
      case "settings":
        return <div className="p-6">Settings (Coming Soon)</div>;
      default:
        return <JobsPage userRole={user.role} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {!user ? (
          <LoginForm onLogin={handleLogin} />
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
