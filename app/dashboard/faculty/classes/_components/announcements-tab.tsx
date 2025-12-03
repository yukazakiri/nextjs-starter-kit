"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Send, Pin } from "lucide-react";
import { format } from "date-fns";

interface AnnouncementsTabProps {
  classId: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  pinned: boolean;
}

export function AnnouncementsTab({ classId }: AnnouncementsTabProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "Welcome to the Class!",
      content: "Welcome to our class. Please check the syllabus for the course outline.",
      createdAt: new Date(),
      pinned: true,
    },
    {
      id: "2",
      title: "Assignment #1 Posted",
      content: "Please see the assignment in the classwork section. Due next week.",
      createdAt: new Date(Date.now() - 86400000),
      pinned: false,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleCreateAnnouncement = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      createdAt: new Date(),
      pinned: false,
    };

    setAnnouncements(prev => [announcement, ...prev]);
    setNewTitle("");
    setNewContent("");
    setIsCreating(false);
  };

  const handleTogglePin = (id: string) => {
    setAnnouncements(prev =>
      prev.map(ann =>
        ann.id === id ? { ...ann, pinned: !ann.pinned } : ann
      )
    );
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Announcements</h2>
          <p className="text-sm text-muted-foreground">Keep your students informed</p>
        </div>

        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Announcement title..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What would you like to announce?"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewTitle("");
                  setNewContent("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement} className="gap-2">
                <Send className="h-4 w-4" />
                Post Announcement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Announcements Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first announcement to keep students informed.
              </p>
              <Button onClick={() => setIsCreating(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      {announcement.pinned && (
                        <Badge variant="secondary" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(announcement.createdAt, "PPp")}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePin(announcement.id)}
                    className="shrink-0"
                  >
                    <Pin className={`h-4 w-4 ${announcement.pinned ? 'fill-primary' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
