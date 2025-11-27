"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MoreVertical,
  TrendingUp,
  FileText,
  Download,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Eye,
} from "lucide-react";
import { AnnouncementList } from "./announcement-list";
import { useState } from "react";

interface Resource {
  name: string;
  type: string;
  url: string;
  date: Date;
  size?: number;
}

interface StreamTabProps {
  classId: string;
  averageGrade?: string;
  latestResource?: Resource | null;
  recentResources?: Resource[];
}

export function StreamTab({ classId, averageGrade, latestResource, recentResources = [] }: StreamTabProps) {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const getFileIcon = (fileType: string, fileName: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    }
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="h-5 w-5 text-orange-600" />;
    }
    if (fileType.startsWith('video/')) {
      return <FileVideo className="h-5 w-5 text-purple-500" />;
    }
    if (fileType.startsWith('audio/')) {
      return <FileAudio className="h-5 w-5 text-pink-500" />;
    }
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) {
      return <FileArchive className="h-5 w-5 text-yellow-600" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Left Sidebar */}
      <div className="hidden md:block md:col-span-1 space-y-4">
        {/* Average Grade Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Class Average</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {averageGrade || "N/A"}
            </div>
          </CardContent>
        </Card>

        {/* Recent Resources Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Recent Resources</h3>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            {recentResources.length > 0 ? (
              <div className="space-y-3">
                {/* Show top 5 resources */}
                <div className="space-y-2">
                  {recentResources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors group"
                    >
                      {getFileIcon(resource.type, resource.name)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate group-hover:text-primary" title={resource.name}>
                          {resource.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(resource.date).toLocaleDateString()}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>

                {/* View All Button */}
                <Sheet open={isResourcesOpen} onOpenChange={setIsResourcesOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-3 w-3 mr-2" />
                      View All Resources
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Class Resources</SheetTitle>
                      <SheetDescription>
                        All files uploaded to this class
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-2">
                      {recentResources.map((resource, idx) => {
                        const isImage = resource.type?.startsWith('image/');

                        return (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all"
                          >
                            {isImage ? (
                              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border">
                                <img
                                  src={resource.url}
                                  alt={resource.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              getFileIcon(resource.type, resource.name)
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                {resource.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{new Date(resource.date).toLocaleDateString()}</span>
                                {resource.size && (
                                  <>
                                    <span>•</span>
                                    <span>{formatFileSize(resource.size)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </a>
                        );
                      })}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No resources uploaded yet
              </p>
            )}
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
        <AnnouncementList classId={classId} />
      </div>
    </div>
  );
}
