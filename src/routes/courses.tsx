import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, BookOpen, Users } from "lucide-react";
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

export const Route = createFileRoute("/courses")({
  component: () => <AppLayout><CoursesPage /></AppLayout>,
});

function CoursesPage() {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", title: "", description: "", department: "" });

  const { data: courses } = useQuery({
    queryKey: ["courses", user?.id, role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const lecturerIds = [...new Set((data ?? []).map((c) => c.lecturer_id).filter((id): id is string => !!id))];
      const { data: lecturers } = lecturerIds.length
        ? await supabase.from("profiles").select("id, full_name").in("id", lecturerIds)
        : { data: [] };
      const lecturerMap = new Map((lecturers ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((course) => ({ ...course, lecturer: course.lecturer_id ? lecturerMap.get(course.lecturer_id) ?? null : null }));
    },
  });

  const { data: myEnrollments } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("course_id").eq("student_id", user!.id);
      return new Set((data ?? []).map((e) => e.course_id));
    },
    enabled: !!user,
  });

  const create = async () => {
    if (!form.code || !form.title) { toast.error("Code and title required"); return; }
    const { error } = await supabase.from("courses").insert({ ...form, lecturer_id: user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Course created");
    setOpen(false); setForm({ code: "", title: "", description: "", department: "" });
    qc.invalidateQueries({ queryKey: ["courses"] });
  };

  const enroll = async (courseId: string) => {
    const { error } = await supabase.from("enrollments").insert({ course_id: courseId, student_id: user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Enrolled");
    qc.invalidateQueries({ queryKey: ["my-enrollments"] });
  };

  const canCreate = role === "lecturer" || role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My Courses</h1>
          <p className="text-sm text-muted-foreground">Browse and manage academic courses.</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary"><Plus className="mr-2 h-4 w-4" /> New Course</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create course</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CSC 210" /></div>
                  <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" /></div>
                </div>
                <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Data Structures" /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
                <Button onClick={create} className="w-full bg-gradient-primary">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {courses && courses.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-16 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
          No courses yet.
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses?.map((c: any) => {
            const enrolled = myEnrollments?.has(c.id);
            return (
              <Card key={c.id} className="shadow-card overflow-hidden">
                <div className="h-2 bg-gradient-primary" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary">{c.code}</Badge>
                    {c.department && <span className="text-xs text-muted-foreground">{c.department}</span>}
                  </div>
                  <h3 className="mt-3 font-semibold">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description || "No description"}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {c.lecturer?.full_name ?? "Unassigned"}
                    </div>
                    {role === "student" && (
                      enrolled ? <Badge variant="outline" className="border-success text-success">Enrolled</Badge>
                      : <Button size="sm" variant="outline" onClick={() => enroll(c.id)}>Enroll</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
