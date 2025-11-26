"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { AnnouncementList } from "./announcement-list";

interface StreamTabProps {
  classCode: string;
}

export function StreamTab({ classCode }: StreamTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Left Sidebar */}
      <div className="hidden md:block md:col-span-1 space-y-4">
        {/* Class Code Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Class code</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-2xl font-bold text-primary">{classCode}</div>
          </CardContent>
        </Card>

        {/* Upcoming Work Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Upcoming</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No work due soon
            </p>
            <Button variant="link" className="p-0 h-auto text-sm font-semibold">
              View all
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Stream Feed */}
      <div className="md:col-span-3">
        <AnnouncementList />
      </div>
    </div>
  );
}
