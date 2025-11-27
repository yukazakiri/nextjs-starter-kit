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
  X,
  Loader2,
  FileText,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Download,
  Info,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

interface AnnouncementListProps {
  classId: string;
}

interface Announcement {
  id: string;
  content: string;
  authorName: string;
  date: Date | string;
  attachments: Array<{
    name: string;
    type: string;
    url: string;
    size?: number;
  }>;
}

export function AnnouncementList({ classId }: AnnouncementListProps) {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileInfo, setShowFileInfo] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filePreviews, setFilePreviews] = useState<Map<number, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [classId]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`/api/faculty/classes/${classId}/announcements`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Supported file types and their max sizes
  const SUPPORTED_FILE_TYPES = {
    // Images
    'image/jpeg': { maxSize: 10 * 1024 * 1024, label: 'JPEG Image' },
    'image/jpg': { maxSize: 10 * 1024 * 1024, label: 'JPG Image' },
    'image/png': { maxSize: 10 * 1024 * 1024, label: 'PNG Image' },
    'image/gif': { maxSize: 10 * 1024 * 1024, label: 'GIF Image' },
    'image/webp': { maxSize: 10 * 1024 * 1024, label: 'WebP Image' },
    // Documents
    'application/pdf': { maxSize: 20 * 1024 * 1024, label: 'PDF Document' },
    'application/msword': { maxSize: 20 * 1024 * 1024, label: 'Word Document' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxSize: 20 * 1024 * 1024, label: 'Word Document' },
    'application/vnd.ms-excel': { maxSize: 20 * 1024 * 1024, label: 'Excel Spreadsheet' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxSize: 20 * 1024 * 1024, label: 'Excel Spreadsheet' },
    'application/vnd.ms-powerpoint': { maxSize: 20 * 1024 * 1024, label: 'PowerPoint Presentation' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { maxSize: 20 * 1024 * 1024, label: 'PowerPoint Presentation' },
    'text/plain': { maxSize: 5 * 1024 * 1024, label: 'Text File' },
    // Archives
    'application/zip': { maxSize: 50 * 1024 * 1024, label: 'ZIP Archive' },
    'application/x-rar-compressed': { maxSize: 50 * 1024 * 1024, label: 'RAR Archive' },
    // Video
    'video/mp4': { maxSize: 100 * 1024 * 1024, label: 'MP4 Video' },
    'video/quicktime': { maxSize: 100 * 1024 * 1024, label: 'MOV Video' },
    // Audio
    'audio/mpeg': { maxSize: 20 * 1024 * 1024, label: 'MP3 Audio' },
    'audio/wav': { maxSize: 20 * 1024 * 1024, label: 'WAV Audio' },
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const fileType = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES];

    if (!fileType) {
      return {
        valid: false,
        error: `File type "${file.type || 'unknown'}" is not supported. Only images, documents, videos, audio, and archives are allowed.`
      };
    }

    if (file.size > fileType.maxSize) {
      return {
        valid: false,
        error: `File "${file.name}" is too large. Maximum size for ${fileType.label} is ${formatFileSize(fileType.maxSize)}.`
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const invalidFiles: string[] = [];

      const validFiles = files.filter(file => {
        const validation = validateFile(file);
        if (!validation.valid) {
          invalidFiles.push(validation.error!);
          return false;
        }
        return true;
      });

      if (invalidFiles.length > 0) {
        setError(invalidFiles[0]); // Show first error
      } else {
        setError(null);
      }

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const invalidFiles: string[] = [];

      const validFiles = files.filter(file => {
        const validation = validateFile(file);
        if (!validation.valid) {
          invalidFiles.push(validation.error!);
          return false;
        }
        return true;
      });

      if (invalidFiles.length > 0) {
        setError(invalidFiles[0]); // Show first error
      } else {
        setError(null);
      }

      if (validFiles.length > 0) {
        const startIndex = selectedFiles.length;
        setSelectedFiles((prev) => [...prev, ...validFiles]);

        // Generate previews for image files
        validFiles.forEach((file, idx) => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setFilePreviews((prev) => {
                const newPreviews = new Map(prev);
                newPreviews.set(startIndex + idx, reader.result as string);
                return newPreviews;
              });
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      const newPreviews = new Map(prev);
      newPreviews.delete(index);
      return newPreviews;
    });
  };

  const handlePost = async () => {
    if (!newAnnouncement.trim() && selectedFiles.length === 0) return;

    setIsPosting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("content", newAnnouncement);

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/faculty/classes/${classId}/announcements`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setNewAnnouncement("");
        setSelectedFiles([]);
        setFilePreviews(new Map());
        setError(null);
        fetchAnnouncements();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to post announcement");
        console.error("Failed to post announcement:", errorData);
      }
    } catch (error) {
      setError("An error occurred while posting the announcement");
      console.error("Error posting announcement:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const getTimeAgo = (date: string | Date) => {
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    // Images
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    // PDFs
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    // Word documents
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    // Excel spreadsheets
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    }
    // PowerPoint
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="h-5 w-5 text-orange-600" />;
    }
    // Videos
    if (fileType.startsWith('video/')) {
      return <FileVideo className="h-5 w-5 text-purple-500" />;
    }
    // Audio
    if (fileType.startsWith('audio/')) {
      return <FileAudio className="h-5 w-5 text-pink-500" />;
    }
    // Archives
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) {
      return <FileArchive className="h-5 w-5 text-yellow-600" />;
    }
    // Text files
    if (fileType === 'text/plain') {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
    // Code files
    if (fileName.endsWith('.js') || fileName.endsWith('.ts') || fileName.endsWith('.py') ||
        fileName.endsWith('.java') || fileName.endsWith('.cpp') || fileName.endsWith('.c')) {
      return <FileCode className="h-5 w-5 text-indigo-500" />;
    }
    // Default
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : "T";

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Post Announcement Input */}
      <div className="flex gap-4 items-start">
        <Avatar className="h-10 w-10 border mt-1">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 transition-all duration-200 ${isExpanded ? 'w-full' : ''}`}>
          {!isExpanded ? (
            <div 
              className="w-full rounded-2xl border bg-background/50 hover:bg-background/80 transition-all cursor-text py-3 px-4 text-muted-foreground text-sm shadow-sm hover:shadow-md"
              onClick={() => setIsExpanded(true)}
            >
              Announce something to your class...
            </div>
          ) : (
            <div className="flex flex-col rounded-2xl border bg-background shadow-lg animate-in fade-in-50 zoom-in-95 duration-200 overflow-hidden ring-1 ring-primary/5">
              {/* Input Area */}
              <div 
                className={`relative transition-all ${isDragging ? 'bg-primary/5' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Textarea
                  placeholder="Announce something to your class..."
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  className="min-h-[120px] w-full resize-none border-0 bg-transparent p-4 placeholder:text-muted-foreground focus-visible:ring-0 text-base"
                  autoFocus
                />
                
                {isDragging && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-2 text-primary font-medium animate-bounce">
                      <Download className="h-8 w-8" />
                      <p>Drop files to attach</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 p-2 text-xs text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    <Info className="h-3 w-3" />
                    {error}
                  </div>
                </div>
              )}

              {/* Selected Files Grid */}
              {selectedFiles.length > 0 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, idx) => {
                      const isImage = file.type.startsWith('image/');
                      const preview = filePreviews.get(idx);

                      return (
                        <div
                          key={idx}
                          className="group relative flex items-center gap-2 p-1.5 pr-2 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors max-w-[200px]"
                        >
                          {isImage && preview ? (
                            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border bg-background">
                              <img
                                src={preview}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
                              {getFileIcon(file.type, file.name)}
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate text-foreground/90">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>

                          <button
                            className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                            onClick={() => removeFile(idx)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* File Info Panel */}
              {showFileInfo && (
                <div className="px-4 pb-2">
                  <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        Supported File Types
                      </p>
                      <button 
                        className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full p-1"
                        onClick={() => setShowFileInfo(false)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-blue-600/80 dark:text-blue-400/80">
                      <p>• Documents (PDF, Word, Excel, PPT) - 20MB</p>
                      <p>• Images (JPG, PNG, WebP) - 10MB</p>
                      <p>• Video (MP4, MOV) - 100MB</p>
                      <p>• Archives (ZIP, RAR) - 50MB</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="p-3 flex items-center justify-between border-t bg-muted/5">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.mp4,.mov,.mp3,.wav"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                    title="Attach files"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFileInfo(!showFileInfo)}
                    className={`h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full ${showFileInfo ? 'bg-primary/10 text-primary' : ''}`}
                    title="File info"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsExpanded(false);
                      setNewAnnouncement("");
                      setSelectedFiles([]);
                      setError(null);
                    }}
                    className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePost}
                    disabled={(!newAnnouncement.trim() && selectedFiles.length === 0) || isPosting}
                    size="sm"
                    className="h-8 px-4 text-xs font-medium rounded-full"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
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
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
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
                        {announcement.attachments.map((attachment, idx) => {
                          const isImage = attachment.type?.startsWith('image/');

                          return (
                            <a
                              key={idx}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer"
                            >
                              {isImage ? (
                                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border">
                                  <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to icon if image fails to load
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-muted">' +
                                        getFileIcon(attachment.type, attachment.name) +
                                        '</div>';
                                    }}
                                  />
                                </div>
                              ) : (
                                getFileIcon(attachment.type, attachment.name)
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                  {attachment.name}
                                </p>
                                {attachment.size && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                )}
                              </div>
                              <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                          );
                        })}
                      </div>
                    )}
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
