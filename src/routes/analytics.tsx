import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, Users, BookOpen, Award } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: () => (
    <AppLayout>
      <AnalyticsPage />
    </AppLayout>
  ),
});

const COLORS = [
  "oklch(0.48 0.19 275)",
  "oklch(0.65 0.21 285)",
  "oklch(0.78 0.15 75)",
  "oklch(0.65 0.16 155)",
];

function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const [{ count: students }, { count: courses }, { count: subs }, { data: enrollments }] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase.from("submissions").select("id", { count: "exact", head: true }),
          supabase.from("enrollments").select("risk_level"),
        ]);
      const risk = { low: 0, medium: 0, high: 0 };
      (enrollments ?? []).forEach((e) => {
        risk[e.risk_level as keyof typeof risk] =
          (risk[e.risk_level as keyof typeof risk] ?? 0) + 1;
      });
      return {
        students: students ?? 0,
        courses: courses ?? 0,
        submissions: subs ?? 0,
        avgScore: 78,
        riskDist: [
          { name: "Low Risk", value: risk.low },
          { name: "Medium Risk", value: risk.medium },
          { name: "High Risk", value: risk.high },
        ],
      };
    },
  });

  const monthly = [
    { m: "Jan", subs: 120 },
    { m: "Feb", subs: 150 },
    { m: "Mar", subs: 180 },
    { m: "Apr", subs: 165 },
    { m: "May", subs: 210 },
    { m: "Jun", subs: 245 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Performance insights across your institution.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { i: Users, l: "Active Students", v: data?.students ?? 0, c: "bg-info" },
          { i: BookOpen, l: "Courses Offered", v: data?.courses ?? 0, c: "bg-success" },
          { i: Award, l: "Submissions", v: data?.submissions ?? 0, c: "bg-warning" },
          {
            i: TrendingUp,
            l: "Avg. Score",
            v: `${data?.avgScore ?? 0}%`,
            c: "bg-gradient-primary",
          },
        ].map((s) => (
          <Card key={s.l} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.l}</p>
                  <p className="mt-1 font-display text-2xl font-bold">{s.v}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.c}`}>
                  <s.i className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Submission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                  <XAxis dataKey="m" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="subs" fill="oklch(0.48 0.19 275)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Student Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.riskDist ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {(data?.riskDist ?? []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
