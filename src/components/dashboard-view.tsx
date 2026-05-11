import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users, BookOpen, ClipboardCheck, AlertTriangle, TrendingUp, TrendingDown,
  Megaphone, Upload, FileText, Send, CheckCircle2, Bell,
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

function StatCard({ icon: Icon, label, value, delta, color }: {
  icon: React.ElementType; label: string; value: string | number; delta?: { value: string; up?: boolean }; color: string;
}) {
  return (
    <Card className="shadow-card overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{value}</p>
            {delta && (
              <p className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${delta.up ? "text-success" : "text-destructive"}`}>
                {delta.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {delta.value} from last month
              </p>
            )}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const performanceData = [
  { week: "W1", class: 72, dept: 68 }, { week: "W2", class: 75, dept: 70 },
  { week: "W3", class: 78, dept: 71 }, { week: "W4", class: 76, dept: 72 },
  { week: "W5", class: 82, dept: 73 }, { week: "W6", class: 85, dept: 74 },
];

export function DashboardView() {
  const { user, role, profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeAction, setActiveAction] = useState<"announcement" | "material" | "message" | null>(null);
  const [announcement, setAnnouncement] = useState({ title: "", body: "", course_id: "all" });
  const [material, setMaterial] = useState({ title: "", url: "", course_id: "" });
  const [message, setMessage] = useState({ recipient_id: "", body: "" });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id, role],
    queryFn: async () => {
      const [students, courses, assignments, atRisk, anns] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }).neq("risk_level", "low"),
        supabase.from("announcements").select("id, title, body, created_at").order("created_at", { ascending: false }).limit(4),
      ]);
      return {
        students: students.count ?? 0,
        courses: courses.count ?? 0,
        submissions: assignments.count ?? 0,
        atRisk: atRisk.count ?? 0,
        announcements: anns.data ?? [],
      };
    },
  });

  const { data: atRiskList } = useQuery({
    queryKey: ["at-risk-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, risk_level, student_id")
        .neq("risk_level", "low")
        .limit(5);
      if (error) throw error;
      const studentIds = [...new Set((data ?? []).map((s) => s.student_id).filter((id): id is string => !!id))];
      const { data: profiles } = studentIds.length
        ? await supabase.from("profiles").select("id, full_name").in("id", studentIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((student) => ({ ...student, profiles: profileMap.get(student.student_id) ?? null }));
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["dashboard-action-courses", user?.id, role],
    queryFn: async () => {
      const query = supabase.from("courses").select("id, code, title").order("code");
      const { data, error } = role === "lecturer" ? await query.eq("lecturer_id", user!.id) : await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: contacts } = useQuery({
    queryKey: ["dashboard-message-contacts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, title").neq("id", user!.id).order("full_name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const createAnnouncement = async () => {
    if (!announcement.title.trim() || !announcement.body.trim()) { toast.error("Announcement title and body are required"); return; }
    const { error } = await supabase.from("announcements").insert({
      author_id: user!.id,
      title: announcement.title.trim(),
      body: announcement.body.trim(),
      course_id: announcement.course_id === "all" ? null : announcement.course_id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Announcement posted");
    setAnnouncement({ title: "", body: "", course_id: "all" });
    setActiveAction(null);
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const uploadMaterial = async () => {
    if (role === "student") { toast.error("Only lecturers and admins can upload materials"); return; }
    if (!material.course_id || !material.title.trim()) { toast.error("Pick a course and enter a title"); return; }
    const { error } = await supabase.from("materials").insert({
      course_id: material.course_id,
      title: material.title.trim(),
      url: material.url.trim() || null,
      uploaded_by: user!.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Material saved");
    setMaterial({ title: "", url: "", course_id: "" });
    setActiveAction(null);
  };

  const sendMessage = async () => {
    if (!message.recipient_id || !message.body.trim()) { toast.error("Choose a recipient and write a message"); return; }
    const { error } = await supabase.from("messages").insert({ sender_id: user!.id, recipient_id: message.recipient_id, body: message.body.trim() });
    if (error) { toast.error(error.message); return; }
    toast.success("Message sent");
    setMessage({ recipient_id: "", body: "" });
    setActiveAction(null);
  };

  const generateReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Students", stats?.students ?? 0],
      ["Active Courses", stats?.courses ?? 0],
      ["Submissions", stats?.submissions ?? 0],
      ["At-Risk Students", stats?.atRisk ?? 0],
      [],
      ["Recent Alerts", "Created"],
      ...((stats?.announcements ?? []).map((a: any) => [a.title, new Date(a.created_at).toLocaleString()])),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `waass-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name?.split(" ")[0] || "there"}.</p>
        </div>
        <Badge variant="secondary" className="capitalize gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {role} workspace
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Students" value={stats?.students ?? "—"} delta={{ value: "8.3%", up: true }} color="bg-info" />
        <StatCard icon={BookOpen} label="Active Courses" value={stats?.courses ?? "—"} delta={{ value: "5.1%", up: true }} color="bg-success" />
        <StatCard icon={ClipboardCheck} label="Submissions" value={stats?.submissions ?? "—"} delta={{ value: "12.5%", up: true }} color="bg-warning" />
        <StatCard icon={AlertTriangle} label="At-Risk Students" value={stats?.atRisk ?? "—"} delta={{ value: "3.2%", up: false }} color="bg-destructive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Class Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" />
                  <XAxis dataKey="week" stroke="oklch(0.5 0.03 258)" fontSize={12} />
                  <YAxis stroke="oklch(0.5 0.03 258)" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 255)", background: "white" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="class" stroke="oklch(0.48 0.19 275)" strokeWidth={2.5} name="Class Average" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="dept" stroke="oklch(0.65 0.21 285)" strokeWidth={2} strokeDasharray="5 5" name="Department Average" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => setActiveAction("announcement")} className="w-full justify-start bg-gradient-primary shadow-card"><Megaphone className="mr-2 h-4 w-4" /> Create Announcement</Button>
            <Button onClick={() => setActiveAction("material")} variant="outline" className="w-full justify-start" disabled={role === "student"}><Upload className="mr-2 h-4 w-4" /> Upload Materials</Button>
            <Button onClick={generateReport} variant="outline" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Generate Report</Button>
            <Button onClick={() => setActiveAction("message")} variant="outline" className="w-full justify-start"><Send className="mr-2 h-4 w-4" /> Send Message</Button>

            <div className="mt-4 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-success" /> System Status</div>
              <p className="mt-1 text-xs text-success">All Systems Operational</p>
              <p className="text-[10px] text-muted-foreground">Last updated 10:24 AM</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">At-Risk Students</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/analytics" })}>View All</Button>
          </CardHeader>
          <CardContent>
            {atRiskList && atRiskList.length > 0 ? (
              <ul className="divide-y">
                {atRiskList.map((s: any) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                        {(s.profiles?.full_name ?? "?").slice(0, 1)}
                      </div>
                      <span className="text-sm font-medium">{s.profiles?.full_name ?? "Unknown"}</span>
                    </div>
                    <Badge variant={s.risk_level === "high" ? "destructive" : "secondary"} className="capitalize">
                      {s.risk_level} Risk
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No at-risk students. Great work! 🎉</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Alerts</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/courses" })}>View All</Button>
          </CardHeader>
          <CardContent>
            {stats?.announcements && stats.announcements.length > 0 ? (
              <ul className="space-y-3">
                {stats.announcements.map((a: any) => (
                  <li key={a.id} className="flex gap-3 rounded-lg border p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={activeAction === "announcement"} onOpenChange={(open) => setActiveAction(open ? "announcement" : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create announcement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Course</Label><Select value={announcement.course_id} onValueChange={(v) => setAnnouncement({ ...announcement, course_id: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Everyone</SelectItem>{courses?.map((c) => <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Title</Label><Input value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} placeholder="Exam timetable update" /></div>
            <div><Label>Message</Label><Textarea value={announcement.body} onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })} rows={4} /></div>
            <Button onClick={createAnnouncement} className="w-full bg-gradient-primary">Post announcement</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeAction === "material"} onOpenChange={(open) => setActiveAction(open ? "material" : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload material</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Course</Label><Select value={material.course_id} onValueChange={(v) => setMaterial({ ...material, course_id: v })}><SelectTrigger><SelectValue placeholder="Pick a course" /></SelectTrigger><SelectContent>{courses?.map((c) => <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Title</Label><Input value={material.title} onChange={(e) => setMaterial({ ...material, title: e.target.value })} placeholder="Lecture notes week 3" /></div>
            <div><Label>Link</Label><Input value={material.url} onChange={(e) => setMaterial({ ...material, url: e.target.value })} placeholder="https://..." /></div>
            <Button onClick={uploadMaterial} className="w-full bg-gradient-primary">Save material</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeAction === "message"} onOpenChange={(open) => setActiveAction(open ? "message" : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send message</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Recipient</Label><Select value={message.recipient_id} onValueChange={(v) => setMessage({ ...message, recipient_id: v })}><SelectTrigger><SelectValue placeholder="Choose someone" /></SelectTrigger><SelectContent>{contacts?.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name || "Unnamed"} — {c.title || "Member"}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Message</Label><Textarea value={message.body} onChange={(e) => setMessage({ ...message, body: e.target.value })} rows={4} /></div>
            <Button onClick={sendMessage} className="w-full bg-gradient-primary">Send message</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
