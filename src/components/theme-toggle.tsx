import { Sun, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/lib/theme-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const meta: Record<Theme, { icon: typeof Sun; label: string; next: string }> = {
  light:  { icon: Sun,      label: "Light",  next: "Switch to purple" },
  purple: { icon: Sparkles, label: "Purple", next: "Switch to dark" },
  dark:   { icon: Moon,     label: "Dark",   next: "Switch to light" },
};

export function ThemeToggle() {
  const { theme, cycle } = useTheme();
  const Icon = meta[theme].icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={cycle} aria-label="Toggle theme">
          <Icon className="h-5 w-5 transition-transform duration-300" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{meta[theme].next}</TooltipContent>
    </Tooltip>
  );
}
