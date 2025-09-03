import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, X } from "lucide-react";

interface RunProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: (updatedUrl: string, callName: string) => void;
  project: {
    id: string;
    name: string;
    teamsUrl: string;
  } | null;
  isProcessing?: boolean;
}

const RunProjectModal = ({ isOpen, onClose, onRun, project, isProcessing = false }: RunProjectModalProps) => {
  const [callName, setCallName] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  // Update local state when project changes
  useEffect(() => {
    if (project) {
      setMeetingUrl(project.teamsUrl);
      setCallName("");
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingUrl.trim() && callName.trim()) {
      onRun(meetingUrl.trim(), callName.trim());
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Run Meeting Analysis
          </DialogTitle>
          <DialogDescription>
            Update the Teams meeting URL for "{project.name}" before processing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="callName">Call Name *</Label>
            <Input
              id="callName"
              placeholder="e.g., Q4 Planning Meeting, Weekly Standup..."
              value={callName}
              onChange={(e) => setCallName(e.target.value)}
              required
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              Give this meeting run a descriptive name to identify it later.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingUrl">Teams Meeting URL *</Label>
            <Input
              id="meetingUrl"
              type="url"
              placeholder="https://teams.microsoft.com/..."
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              required
              disabled={isProcessing}
            />
            <p className="text-sm text-muted-foreground">
              This will be used to fetch the meeting recording and transcript.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!meetingUrl.trim() || !callName.trim() || isProcessing}
              className="bg-gradient-primary"
            >
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Start Analysis"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RunProjectModal;