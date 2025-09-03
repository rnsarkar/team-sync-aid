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
  // Simple test to see if React is rendering
  return (
    <div style={{ 
      padding: '40px', 
      fontSize: '24px', 
      color: 'red',
      backgroundColor: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🔥 TEST: NoteMate Dashboard is loading!</h1>
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        border: '3px solid blue',
        backgroundColor: '#f0f0f0',
        fontSize: '18px',
        color: 'blue'
      }}>
        ✅ If you can see this, React is working correctly.
        <br />
        <br />
        <strong>Next steps:</strong> The issue is likely in the complex Dashboard component logic.
      </div>
    </div>
  );
};

export default Dashboard;