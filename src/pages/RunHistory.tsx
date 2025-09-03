import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, CheckCircle, AlertCircle, Clock, User } from "lucide-react";

interface Project {
  id: string;
  name: string;
  runs: Run[];
}

interface Run {
  id: string;
  date: string;
  status: "processing" | "completed" | "failed";
  summary?: string;
  actionItems?: Array<{ item: string; owner: string }>;
}

const RunHistory = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const foundProject = projects.find((p: Project) => p.id === projectId);
    setProject(foundProject || null);
  }, [projectId]);

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

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Project Not Found
        </h2>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Run History</h1>
          <p className="text-muted-foreground mt-1">
            {project.name}
          </p>
        </div>
      </div>

      {project.runs.length === 0 ? (
        <Card className="shadow-medium">
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Runs Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              This project hasn't been run yet. Start your first meeting processing run.
            </p>
            <Link to="/">
              <Button className="bg-gradient-primary">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {project.runs.map((run) => (
            <Card key={run.id} className="shadow-medium">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(run.status)}
                      Meeting Run
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(run.date).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={getStatusColor(run.status)}>
                    {run.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {run.status === "processing" && (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Processing meeting...</p>
                  </div>
                )}

                {run.status === "failed" && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">Processing Failed</p>
                    <p className="text-muted-foreground">
                      There was an issue processing this meeting. Please try again.
                    </p>
                  </div>
                )}

                {run.status === "completed" && run.summary && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Meeting Summary</h4>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-foreground">{run.summary}</p>
                      </div>
                    </div>

                    {run.actionItems && run.actionItems.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">Action Items</h4>
                          <div className="space-y-3">
                            {run.actionItems.map((item, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-foreground font-medium">{item.item}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{item.owner}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">Wiki Updated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">Slack Notified</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RunHistory;