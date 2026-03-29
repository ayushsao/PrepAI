"use client";

import React from "react";
import { 
  FileText, 
  CircleDollarSign,
  Database,
  BarChart2,
  CloudUpload,
  FileSearch,
  Cpu
} from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";    

const timelineData = [
  {
    id: 1,
    title: "SENTIMENT ANALYSIS",
    date: "Phase 1",
    content: "Live evaluation of emotional resonance and confidence levels during answers.",     
    category: "Analysis",
    icon: FileText,
    relatedIds: [4],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "MARKET ALIGNMENT",
    date: "Phase 2",
    content: "Benchmarking responses against current industry standards and expectations.",
    category: "Market",
    icon: CircleDollarSign,
    relatedIds: [1, 6],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "RESPONSE INTEGRITY",
    date: "Phase 3",
    content: "Verifying factual correctness and structural logic in answers.",  
    category: "Data",
    icon: Database,
    relatedIds: [2],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 4,
    title: "BEHAVIORAL MATCH",
    date: "Phase 4",
    content: "Assessing cultural fit and soft skills based on proven behavioral models.",  
    category: "Behavior",
    icon: BarChart2,
    relatedIds: [1, 6],
    status: "in-progress" as const,
    energy: 80,
  },
  {
    id: 5,
    title: "REAL-TIME STREAM",
    date: "Phase 5",
    content: "Continuous bi-directional processing of audio/video for zero-latency feedback.",  
    category: "Network",
    icon: CloudUpload,
    relatedIds: [3, 7],
    status: "in-progress" as const,
    energy: 70,
  },
  {
    id: 6,
    title: "SKILL CORRELATION",
    date: "Phase 6",
    content: "Mapping stated abilities to demonstrated problem-solving techniques.",  
    category: "Skills",
    icon: FileSearch,
    relatedIds: [4, 7],
    status: "pending" as const,
    energy: 40,
  },
  {
    id: 7,
    title: "ARCHITECTURE SYNC",
    date: "Phase 7",
    content: "Unified state management across all evaluation engines.",  
    category: "System",
    icon: Cpu,
    relatedIds: [5, 6],
    status: "pending" as const,
    energy: 20,
  }
];

export function RadialOrbitalTimelineDemo() {
  return (
    <section className="px-6 py-10 bg-[#090a0c]">
      <div className="h-[800px] w-full rounded-[40px] overflow-hidden relative">
        <RadialOrbitalTimeline timelineData={timelineData} />
      </div>
    </section>
  );
}

export default RadialOrbitalTimelineDemo;
