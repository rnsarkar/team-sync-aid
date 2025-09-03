import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Play, Settings, Trash2, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import ProjectModal from "@/components/ProjectModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  name: string;
  teamsUrl: string;
  prompt: string;
  wikiUrl: string;
  wikiTableTitle: string;
  slackChannel: string;
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

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    setProjects(savedProjects);
  }, []);

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
  };

  const handleSaveProject = (project: Project) => {
    let updatedProjects;
    
    if (editingProject) {
      updatedProjects = projects.map((p) => (p.id === project.id ? project : p));
    } else {
      updatedProjects = [...projects, project];
    }
    
    saveProjects(updatedProjects);
    setEditingProject(null);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    const updatedProjects = projects.filter((p) => p.id !== project.id);
    saveProjects(updatedProjects);
    setDeleteProject(null);
    
    toast({
      title: "Project Deleted",
      description: `Project "${project.name}" has been deleted.`,
    });
  };

  const handleRunProject = (projectId: string) => {
    // Simulate starting a new run
    const newRun: Run = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: "processing",
    };

    const updatedProjects = projects.map((project) => {
      if (project.id === projectId) {
        return {
          ...project,
          runs: [newRun, ...project.runs],
        };
      }
      return project;
    });

    saveProjects(updatedProjects);

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

      const finalProjects = updatedProjects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            runs: project.runs.map((run) =>
              run.id === newRun.id ? completedRun : run
            ),
          };
        }
        return project;
      });

      saveProjects(finalProjects);

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

  const getLastRunDate = (runs: Run[]) => {
    if (runs.length === 0) return "Never";
    return new Date(runs[0].date).toLocaleDateString();
  };

  const getWikiTarget = (project: Project) => {
    if (!project.wikiUrl && !project.wikiTableTitle) return "Not configured";
    return project.wikiTableTitle || "Wiki Page";
  };

  const getSlackGroup = (project: Project) => {
    return project.slackChannel || "Not configured";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background border-b shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">NoteMate</h1>
              <p className="text-muted-foreground mt-1">
                Professional meeting automation and note management
              </p>
            </div>
            <Button 
              onClick={() => {
                setEditingProject(null);
                setModalOpen(true);
              }}
              className="bg-gradient-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Button 
                onClick={() => {
                  setEditingProject(null);
                  setModalOpen(true);
                }}
                className="bg-gradient-primary"
              >
                Create Your First Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const latestRun = project.runs[0];

              return (
                <Card key={project.id} className="shadow-medium hover:shadow-large transition-all duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Last run: {getLastRunDate(project.runs)}
                        </CardDescription>
                      </div>
                      {latestRun && (
                        <div className="flex items-center gap-1 ml-2">
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
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-foreground">Wiki Target:</span>
                          <p className="text-muted-foreground truncate">{getWikiTarget(project)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Slack Group:</span>
                          <p className="text-muted-foreground truncate">{getSlackGroup(project)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleRunProject(project.id)}
                          disabled={latestRun?.status === "processing"}
                          className="bg-gradient-primary flex-1"
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
                          onClick={() => setDeleteProject(project)}
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
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        project={editingProject}
        onSave={handleSaveProject}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProject?.name}"? This action cannot be undone.
              All run history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProject && handleDeleteProject(deleteProject)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;