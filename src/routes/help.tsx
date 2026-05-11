import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Mail, BookOpen, MessageCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  component: () => <AppLayout><HelpPage /></AppLayout>,
});

const faqs = [
  { q: "How do I enroll in a course?", a: "Go to My Courses, find the course you want, and click Enroll. Your lecturer will be notified." },
  { q: "How do I submit an assignment?", a: "Open Assessments, find the assignment, and click Submit. You can paste your work or include a link." },
  { q: "Why can't I see Admin Tools?", a: "Admin Tools are only visible to admin users. Contact your administrator if you need elevated access." },
  { q: "How are at-risk students identified?", a: "Risk levels are set by lecturers and admins based on submissions, attendance, and performance." },
];

function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
          <LifeBuoy className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Help & Support</h1>
          <p className="text-sm text-muted-foreground">Find answers or reach our team.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { i: BookOpen, t: "Documentation", d: "Browse user guides" },
          { i: MessageCircle, t: "Community", d: "Discuss with peers" },
          { i: Mail, t: "Email support", d: "support@waass.edu" },
        ].map((c) => (
          <Card key={c.t} className="shadow-card transition hover:shadow-elevated cursor-pointer">
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"><c.i className="h-5 w-5" /></div>
              <h3 className="mt-3 font-semibold">{c.t}</h3>
              <p className="text-sm text-muted-foreground">{c.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
