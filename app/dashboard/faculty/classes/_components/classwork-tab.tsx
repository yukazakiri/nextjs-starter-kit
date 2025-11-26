"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BookOpen, MoreVertical, Calendar, Folder } from "lucide-react";

export function ClassworkTab() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Button className="rounded-full shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Google Calendar
          </Button>
          <Button variant="ghost" size="sm">
            <Folder className="h-4 w-4 mr-2" />
            Class Drive folder
          </Button>
        </div>
      </div>

      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">This is where you'll assign work</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
          You can add assignments, quizzes, and other work for the class.
        </p>
        <Button variant="outline">Create assignment</Button>
      </div>
    </div>
  );
}
