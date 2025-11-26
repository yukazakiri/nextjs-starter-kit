"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  Search,
  FileText,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  File,
  Download,
  Eye,
  MoreVertical,
  Trash2,
  Edit,
  FolderOpen,
} from "lucide-react";
import { useState } from "react";

// Mock data for resources
const mockResources = [
  {
    id: 1,
    name: "Week 1 - Introduction to Web Development",
    type: "ppt",
    size: "2.4 MB",
    uploadedBy: "Dr. Sarah Johnson",
    uploadedAt: "2024-01-15",
    downloads: 45,
    category: "Lecture Slides",
  },
  {
    id: 2,
    name: "HTML & CSS Fundamentals",
    type: "pdf",
    size: "1.8 MB",
    uploadedBy: "Dr. Sarah Johnson",
    uploadedAt: "2024-01-16",
    downloads: 42,
    category: "Study Materials",
  },
  {
    id: 3,
    name: "JavaScript Basics Tutorial",
    type: "video",
    size: "45.2 MB",
    uploadedBy: "Dr. Sarah Johnson",
    uploadedAt: "2024-01-18",
    downloads: 38,
    category: "Video Lectures",
  },
  {
    id: 4,
    name: "Week 2 - JavaScript Deep Dive",
    type: "ppt",
    size: "3.1 MB",
    uploadedBy: "Dr. Sarah Johnson",
    uploadedAt: "2024-01-22",
    downloads: 40,
    category: "Lecture Slides",
  },
  {
    id: 5,
    name: "Code Examples - DOM Manipulation",
    type: "zip",
    size: "856 KB",
    uploadedBy: "Dr. Sarah Johnson",
    uploadedAt: "2024-01-23",
    downloads: 35,
    category: "Code Examples",
  },
  {
    id: 6,
    name: "React Component Patterns",
    type: "pdf",
    size: "2.2 MB",
    uploadedBy: "Dr. Sarah Johnson",
    uploadedAt: "2024-01-25",
    downloads: 33,
    category: "Study Materials",
  },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "ppt":
    case "pptx":
      return <FileText className="h-5 w-5 text-orange-500" />;
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "video":
    case "mp4":
      return <FileVideo className="h-5 w-5 text-purple-500" />;
    case "xlsx":
    case "csv":
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case "jpg":
    case "png":
      return <FileImage className="h-5 w-5 text-blue-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
};

const getFileTypeColor = (type: string) => {
  switch (type) {
    case "ppt":
    case "pptx":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";
    case "pdf":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
    case "video":
    case "mp4":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400";
    case "xlsx":
    case "csv":
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
};

export function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Resource Library</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Share study materials, presentations, and resources with your students
            </p>
          </div>
          <Button size="lg">
            <Upload className="h-4 w-4 mr-2" />
            Upload Resource
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="lecture">Lecture Slides</SelectItem>
              <SelectItem value="study">Study Materials</SelectItem>
              <SelectItem value="video">Video Lectures</SelectItem>
              <SelectItem value="code">Code Examples</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mockResources.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
            <p className="text-muted-foreground mb-4">
              Start sharing resources with your students
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload First Resource
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {mockResources.map((resource) => (
              <Card
                key={resource.id}
                className="p-4 hover:shadow-md transition-all border-l-4 border-l-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-muted rounded-lg flex-shrink-0">
                    {getFileIcon(resource.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base mb-1 truncate">
                          {resource.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className={getFileTypeColor(resource.type)}
                          >
                            {resource.type.toUpperCase()}
                          </Badge>
                          <span>{resource.size}</span>
                          <span>•</span>
                          <span>{resource.downloads} downloads</span>
                          <span>•</span>
                          <span>
                            Uploaded on{" "}
                            {new Date(resource.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {resource.category}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
