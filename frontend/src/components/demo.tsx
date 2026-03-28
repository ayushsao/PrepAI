"use client";

import React from "react";
import { Calendar, Code, FileText, User, Clock } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Setup Your Profile",
    date: "Step 1",
    content: "Upload your resume and select the target role. Our AI tailors questions specifically to the industry, seniority level, and company culture.",
    category: "Preparation",
    icon: User,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Live AI Mock Interview",
    date: "Step 2",
    content: "Practice in a realistic environment. Face follow-up questions, technical challenges, and pressure tests designed to sharpen your thinking.",
    category: "Interview",
    icon: Code,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 80,
  },
  {
    id: 3,
    title: "Detailed Feedback Scorecard",
    date: "Step 3",
    content: "Receive a granular report within seconds. We analyze your body language, content quality, and key improvement areas for every single response.",
    category: "Feedback",
    icon: FileText,
    relatedIds: [2],
    status: "pending" as const,
    energy: 40,
  }
];

export function RadialOrbitalTimelineDemo() {
  return (
    <section id="about" className="px-6 py-32 bg-black">
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Your Path to Hiring</h2>
      </div>
      <div className="h-[800px] w-full rounded-[40px] overflow-hidden border border-white/5 relative">
        <RadialOrbitalTimeline timelineData={timelineData} />
      </div>
    </section>
  );
}

export default RadialOrbitalTimelineDemo;
