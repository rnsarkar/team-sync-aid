import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    teamsUrl: "",
    prompt: "",
    wikiUrl: "",
    wikiTableTitle: "",
    slackChannel: "",
  });

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

    // Save project (in real app, this would be an API call)
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const newProject = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      runs: [],
    };
    
    projects.push(newProject);
    localStorage.setItem("projects", JSON.stringify(projects));

    toast({
      title: "Project Created",
      description: `Project "${formData.name}" has been created successfully.`,
    });

    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create New Project</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new meeting automation project with all the required configuration.
        </p>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Project Configuration</CardTitle>
          <CardDescription>
            Configure your meeting automation workflow below. Required fields are marked with *.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                Create Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProject;