"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  MoreVertical,
  Edit,
  Trash2,
  Paperclip,
  Send,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

// Mock data for announcements
const mockAnnouncements = [
  {
    id: 1,
    content:
      "Reminder: The midterm examination will be held on February 15th, 2024. Please arrive 15 minutes early. Topics covered will include Chapters 1-5.",
    authorName: "Dr. Sarah Smith",
    authorAvatar: null,
    date: "2024-01-28T10:30:00",
    attachments: [],
    comments: 3,
  },
  {
    id: 2,
    content:
      "Great work on the recent project submissions! I'm impressed with the quality of work. Keep it up! 🎉",
    authorName: "Dr. Sarah Smith",
    authorAvatar: null,
    date: "2024-01-25T14:20:00",
    attachments: [],
    comments: 8,
  },
  {
    id: 3,
    content:
      "We have a special guest lecturer next week who will discuss web security best practices. Attendance is mandatory. Please review the attached reading material before class.",
    authorName: "Dr. Sarah Smith",
    authorAvatar: null,
    date: "2024-01-22T09:15:00",
    attachments: [{ name: "Web_Security_Basics.pdf", type: "pdf" }],
    comments: 5,
  },
];

export function AnnouncementList() {
  const { user } = useUser();
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = () => {
    if (!newAnnouncement.trim()) return;
    setIsPosting(true);
    // TODO: Implement API call to post announcement
    setTimeout(() => {
      setNewAnnouncement("");
      setIsPosting(false);
    }, 1000);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return past.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : "T";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Post Announcement Card */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Announce something to your class"
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Image
                  </Button>
                </div>
                <Button
                  onClick={handlePost}
                  disabled={!newAnnouncement.trim() || isPosting}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      {mockAnnouncements.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
            <p className="text-sm text-muted-foreground">
              Post your first announcement to notify students
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={announcement.authorAvatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {announcement.authorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {announcement.authorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getTimeAgo(announcement.date)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm whitespace-pre-wrap mb-3">
                      {announcement.content}
                    </p>

                    {announcement.attachments.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {announcement.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                          >
                            <File className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm flex-1">
                              {attachment.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Bell className="h-4 w-4 mr-2" />
                        {announcement.comments}{" "}
                        {announcement.comments === 1 ? "comment" : "comments"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
