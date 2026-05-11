import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ClipboardCheck, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/assessments")({
  component: () => <AppLayout><AssessmentsPage /></AppLayout>,
});

function AssessmentsPage() {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ course_id: "", title: "", description: "", due_date: "", max_score: 100 });
  const [submitOpen, setSubmitOpen] = useState<string | null>(null);
  const [submitContent, setSubmitContent] = useState("");

  const { data: assignments } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("assignments")
        .select("*, course:courses(code, title)")
        .order("due_date", { ascending: true, nullsFirst: false });
      return data ?? [];
    },
  });

  const { data: myCourses } = useQuery({
    queryKey: ["my-teaching-courses", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("id, code, title").eq("lecturer_id", user!.id);
      return data ?? [];
    },
    enabled: !!user && (role === "lecturer" || role === "admin"),
  });

  const { data: mySubs } = useQuery({
    queryKey: ["my-submissions", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("submissions").select("assignment_id, score").eq("student_id", user!.id);
      return new Map((data ?? []).map((s) => [s.assignment_id, s]));
    },
    enabled: !!user,
  });

  const create = async () => {
    if (!form.course_id || !form.title) { toast.error("Course and title required"); return; }
    const { error } = await supabase.from("assignments").insert({
      ...form,
      due_date: form.due_date || null,
      max_score: Number(form.max_score),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Assignment created");
    setOpen(false); setForm({ course_id: "", title: "", description: "", due_date: "", max_score: 100 });
    qc.invalidateQueries({ queryKey: ["assignments"] });
  };

  const submit = async (assignmentId: string) => {
    const { error } = await supabase.from("submissions").insert({
      assignment_id: assignmentId, student_id: user!.id, content: submitContent,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Submitted!");
    setSubmitOpen(null); setSubmitContent("");
    qc.invalidateQueries({ queryKey: ["my-submissions"] });
  };

  const canCreate = role === "lecturer" || role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Assessments</h1>
          <p className="text-sm text-muted-foreground">Assignments, quizzes, and submissions.</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-gradient-primary"><Plus className="mr-2 h-4 w-4" /> New Assignment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create assignment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Course</Label>
                  <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Pick a course" /></SelectTrigger>
                    <SelectContent>
                      {myCourses?.map((c) => <SelectItem key={c.id} value={c.id}>{c.code} — {c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Due date</Label><Input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                  <div><Label>Max score</Label><Input type="number" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })} /></div>
                </div>
                <Button onClick={create} className="w-full bg-gradient-primary">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {assignments && assignments.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-16 text-center text-muted-foreground">
          <ClipboardCheck className="mx-auto mb-3 h-10 w-10 opacity-40" /> No assignments yet.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {assignments?.map((a: any) => {
            const sub = mySubs?.get(a.id);
            const overdue = a.due_date && new Date(a.due_date) < new Date();
            return (
              <Card key={a.id} className="shadow-card">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{a.course?.code}</Badge>
                      {overdue && !sub && <Badge variant="destructive">Overdue</Badge>}
                      {sub && <Badge className="bg-success">Submitted</Badge>}
                    </div>
                    <h3 className="mt-1.5 font-semibold">{a.title}</h3>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{a.description}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      {a.due_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {new Date(a.due_date).toLocaleString()}</span>}
                      <span>Max {a.max_score} pts</span>
                      {sub?.score != null && <span className="font-semibold text-foreground">Score: {sub.score}/{a.max_score}</span>}
                    </div>
                  </div>
                  {role === "student" && !sub && (
                    <Dialog open={submitOpen === a.id} onOpenChange={(o) => setSubmitOpen(o ? a.id : null)}>
                      <DialogTrigger asChild><Button>Submit</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Submit: {a.title}</DialogTitle></DialogHeader>
                        <Textarea value={submitContent} onChange={(e) => setSubmitContent(e.target.value)} rows={6} placeholder="Your answer or notes / link…" />
                        <Button onClick={() => submit(a.id)} className="bg-gradient-primary">Submit assignment</Button>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
