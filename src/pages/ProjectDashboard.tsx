import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Play, Settings, Clock, CheckCircle, AlertCircle } from "lucide-react";

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

const ProjectDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    setProjects(savedProjects);
  }, []);

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

    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

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

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            No Projects Yet
          </h2>
          <p className="text-muted-foreground mb-6">
            Create your first meeting automation project to get started.
          </p>
          <Link to="/create">
            <Button className="bg-gradient-primary">
              Create Your First Project
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your meeting automation projects and view recent runs.
          </p>
        </div>
        <Link to="/create">
          <Button className="bg-gradient-primary">
            Create New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const latestRun = project.runs[0];
          const completedRuns = project.runs.filter((run) => run.status === "completed").length;

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
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground">
                      <strong>Completed Runs:</strong> {completedRuns}
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
                      onClick={() => navigate(`/project/${project.id}/history`)}
                    >
                      View History
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/project/${project.id}/edit`)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDashboard;