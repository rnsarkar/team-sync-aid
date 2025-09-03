import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Play, Settings, Clock, CheckCircle, AlertCircle, Plus, Trash2, LayoutGrid, List } from "lucide-react";
import RunProjectModal from "@/components/RunProjectModal";

interface Project {
  id: string;
  name: string;
  teamsUrl: string;
  prompt: string;
  wikiUrl: string;
  wikiTableTitle: string;
  slackChannel: string;
  slackMessage: string;
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

interface ProjectFormData {
  name: string;
  teamsUrl: string;
  prompt: string;
  wikiUrl: string;
  wikiTableTitle: string;
  slackChannel: string;
  slackMessage: string;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"cards" | "list">("cards");
  const [runModalProject, setRunModalProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    teamsUrl: "",
    prompt: "",
    wikiUrl: "",
    wikiTableTitle: "",
    slackChannel: "",
    slackMessage: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    setProjects(savedProjects);
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      teamsUrl: "",
      prompt: "",
      wikiUrl: "",
      wikiTableTitle: "",
      slackChannel: "",
      slackMessage: "",
    });
    setShowCreateForm(false);
    setEditingProject(null);
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateProject = () => {
    setShowCreateForm(true);
    setEditingProject(null);
    setFormData({
      name: "",
      teamsUrl: "",
      prompt: "",
      wikiUrl: "",
      wikiTableTitle: "",
      slackChannel: "",
      slackMessage: "",
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project.id);
    setFormData({
      name: project.name,
      teamsUrl: project.teamsUrl,
      prompt: project.prompt,
      wikiUrl: project.wikiUrl,
      wikiTableTitle: project.wikiTableTitle,
      slackChannel: project.slackChannel,
      slackMessage: project.slackMessage || "",
    });
    setShowCreateForm(true);
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    
    toast({
      title: "Project Deleted",
      description: "Project has been removed successfully.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.teamsUrl || !formData.prompt) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingProject) {
      // Update existing project
      const updatedProjects = projects.map(project => 
        project.id === editingProject 
          ? { ...project, ...formData }
          : project
      );
      setProjects(updatedProjects);
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
      
      toast({
        title: "Project Updated",
        description: `Project "${formData.name}" has been updated successfully.`,
      });
    } else {
      // Create new project
      const newProject = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        runs: [],
      };
      
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem("projects", JSON.stringify(updatedProjects));

      toast({
        title: "Project Created",
        description: `Project "${formData.name}" has been created successfully.`,
      });
    }

    resetForm();
  };

  const handleRunProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setRunModalProject(project);
    }
  };

  const handleRunConfirm = (updatedUrl: string) => {
    if (!runModalProject) return;

    // Update project with new URL if changed
    const updatedProjects = projects.map(project => 
      project.id === runModalProject.id 
        ? { ...project, teamsUrl: updatedUrl }
        : project
    );
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    const newRun: Run = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: "processing",
    };

    const projectsWithRun = updatedProjects.map((project) => {
      if (project.id === runModalProject.id) {
        return {
          ...project,
          runs: [newRun, ...project.runs],
        };
      }
      return project;
    });

    setProjects(projectsWithRun);
    localStorage.setItem("projects", JSON.stringify(projectsWithRun));
    setRunModalProject(null);

    toast({
      title: "Processing Started",
      description: "Your meeting is being processed. This may take a few minutes.",
    });

    // Simulate completion after 3 seconds
    setTimeout(() => {
      const completedRun: Run = {
        ...newRun,
        status: "completed",
        summary: "Meeting focused on Q4 planning, budget discussions, and team restructuring. Key decisions made regarding new product launches.",
        actionItems: [
          { item: "Finalize Q4 budget proposal", owner: "Sarah Johnson" },
          { item: "Schedule team restructuring meeting", owner: "Mike Chen" },
          { item: "Review new product roadmap", owner: "Alex Williams" },
        ],
      };

      const finalProjects = projectsWithRun.map((project) => {
        if (project.id === runModalProject.id) {
          return {
            ...project,
            runs: project.runs.map((run) =>
              run.id === newRun.id ? completedRun : run
            ),
          };
        }
        return project;
      });

      setProjects(finalProjects);
      localStorage.setItem("projects", JSON.stringify(finalProjects));

      toast({
        title: "Meeting Processed",
        description: "Summary and action items have been generated successfully.",
      });
    }, 3000);
  };

  const getStatusIcon = (status: Run["status"]) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Run["status"]) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
    }
  };

  if (showCreateForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {editingProject ? "Edit Project" : "Create New Project"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {editingProject ? "Update your project configuration below." : "Set up a new meeting automation project with all the required configuration."}
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

              <div className="space-y-2">
                <Label htmlFor="slackMessage">Slack Message Template</Label>
                <Textarea
                  id="slackMessage"
                  placeholder="Meeting summary for {date}: {summary}. Action items: {actionItems}"
                  rows={3}
                  value={formData.slackMessage}
                  onChange={(e) => handleInputChange("slackMessage", e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary">
                  {editingProject ? "Update Project" : "Create Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MeetingWise Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your meeting automation projects and view recent runs.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewType === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleCreateProject} className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              No Projects Yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first meeting automation project to get started.
            </p>
            <Button onClick={handleCreateProject} className="bg-gradient-primary">
              Create Your First Project
            </Button>
          </div>
        </div>
      ) : viewType === "cards" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const latestRun = project.runs[0];
            const completedRuns = project.runs.filter((run) => run.status === "completed").length;
            const totalRuns = project.runs.length;

            return (
              <Card key={project.id} className="shadow-medium hover:shadow-large transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {latestRun && (
                      <div className="flex items-center gap-1">
                        {getStatusIcon(latestRun.status)}
                        <Badge variant="outline" className={getStatusColor(latestRun.status)}>
                          {latestRun.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Teams URL:</strong> {project.teamsUrl.substring(0, 50)}...</p>
                      {project.slackChannel && (
                        <p><strong>Slack:</strong> {project.slackChannel}</p>
                      )}
                      {project.wikiUrl && (
                        <p><strong>Wiki:</strong> {project.wikiTableTitle || "Meeting Notes"}</p>
                      )}
                    </div>

                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        <strong>Usage:</strong> {totalRuns} runs ({completedRuns} completed)
                      </p>
                    </div>

                    {latestRun && latestRun.status === "completed" && (
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-2">Latest Summary:</p>
                        <p className="text-foreground line-clamp-3">
                          {latestRun.summary}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleRunProject(project.id)}
                        disabled={latestRun?.status === "processing"}
                        className="bg-gradient-primary"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        {latestRun?.status === "processing" ? "Processing..." : "Run"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProject(project)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Integrations</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const latestRun = project.runs[0];
                const completedRuns = project.runs.filter((run) => run.status === "completed").length;
                const totalRuns = project.runs.length;
                const integrations = [
                  project.slackChannel && "Slack",
                  project.wikiUrl && "Wiki"
                ].filter(Boolean);

                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {project.teamsUrl}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{totalRuns} total</div>
                        <div className="text-muted-foreground">{completedRuns} completed</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {latestRun ? new Date(latestRun.date).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      {latestRun ? (
                        <div className="flex items-center gap-2">
                          {getStatusIcon(latestRun.status)}
                          <Badge variant="outline" className={getStatusColor(latestRun.status)}>
                            {latestRun.status}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline">Ready</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {integrations.map((integration) => (
                          <Badge key={integration} variant="secondary" className="text-xs">
                            {integration}
                          </Badge>
                        ))}
                        {integrations.length === 0 && (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleRunProject(project.id)}
                          disabled={latestRun?.status === "processing"}
                          className="bg-gradient-primary"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProject(project)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <RunProjectModal
        isOpen={!!runModalProject}
        onClose={() => setRunModalProject(null)}
        onRun={handleRunConfirm}
        project={runModalProject}
        isProcessing={runModalProject?.runs[0]?.status === "processing"}
      />
    </div>
  );
};

export default Dashboard;