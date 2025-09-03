import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormData {
  name: string;
  teamsUrl: string;
  prompt: string;
  wikiUrl: string;
  wikiTableTitle: string;
  slackChannel: string;
}

interface Project extends ProjectFormData {
  id: string;
  createdAt: string;
  runs: Run[];
}

interface Run {
  id: string;
  date: string;
  status: "processing" | "completed" | "failed";
  summary?: string;
  actionItems?: Array<{ item: string; owner: string }>;
}

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSave: (project: Project) => void;
}

const ProjectModal = ({ open, onOpenChange, project, onSave }: ProjectModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    teamsUrl: "",
    prompt: "",
    wikiUrl: "",
    wikiTableTitle: "",
    slackChannel: "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        teamsUrl: project.teamsUrl,
        prompt: project.prompt,
        wikiUrl: project.wikiUrl,
        wikiTableTitle: project.wikiTableTitle,
        slackChannel: project.slackChannel,
      });
    } else {
      setFormData({
        name: "",
        teamsUrl: "",
        prompt: "",
        wikiUrl: "",
        wikiTableTitle: "",
        slackChannel: "",
      });
    }
  }, [project, open]);

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.teamsUrl || !formData.prompt) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const savedProject: Project = {
      id: project?.id || Date.now().toString(),
      ...formData,
      createdAt: project?.createdAt || new Date().toISOString(),
      runs: project?.runs || [],
    };

    onSave(savedProject);

    toast({
      title: project ? "Project Updated" : "Project Created",
      description: `Project "${formData.name}" has been ${project ? "updated" : "created"} successfully.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription>
            Configure your meeting automation workflow. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Weekly Team Sync"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamsUrl">Teams Meeting URL *</Label>
            <Input
              id="teamsUrl"
              type="url"
              placeholder="https://teams.microsoft.com/..."
              value={formData.teamsUrl}
              onChange={(e) => handleInputChange("teamsUrl", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Summarization Prompt *</Label>
            <Textarea
              id="prompt"
              placeholder="Please summarize this meeting focusing on key decisions, action items, and next steps..."
              rows={4}
              value={formData.prompt}
              onChange={(e) => handleInputChange("prompt", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wikiUrl">Wiki Page URL</Label>
            <Input
              id="wikiUrl"
              type="url"
              placeholder="https://wiki.company.com/page"
              value={formData.wikiUrl}
              onChange={(e) => handleInputChange("wikiUrl", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wikiTableTitle">Wiki Table Title</Label>
            <Input
              id="wikiTableTitle"
              placeholder="Meeting Notes"
              value={formData.wikiTableTitle}
              onChange={(e) => handleInputChange("wikiTableTitle", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slackChannel">Slack Channel / Group</Label>
            <Input
              id="slackChannel"
              placeholder="#team-updates or @user.name"
              value={formData.slackChannel}
              onChange={(e) => handleInputChange("slackChannel", e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {project ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;