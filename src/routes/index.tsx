import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GraduationCap, ArrowRight, BarChart3, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elevated">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">WAASS</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
          <Button asChild className="bg-gradient-primary"><Link to="/signup">Get started</Link></Button>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 py-20 md:px-12 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-[0.07]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Wesley AI Academic Support System
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold tracking-tight md:text-7xl">
            Smarter teaching.<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Better outcomes.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            One platform for lecturers, students, and admins to manage courses, track performance,
            spot at-risk students early, and stay connected.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-elevated">
              <Link to="/signup">Create account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline"><Link to="/login">I have an account</Link></Button>
          </div>
        </div>

        <div className="relative mx-auto mt-20 grid max-w-5xl gap-4 md:grid-cols-3">
          {[
            { icon: Users, title: "Multi-role", body: "Lecturers, students and admins each get a tailored workspace." },
            { icon: BarChart3, title: "Live analytics", body: "Track class performance and submissions as they happen." },
            { icon: Shield, title: "At-risk alerts", body: "Spot students who need support before it becomes a problem." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
