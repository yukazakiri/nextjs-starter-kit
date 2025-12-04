import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClassData, LaravelApiHelpers } from "@/lib/laravel-api";
import { cn } from "@/lib/utils";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { ClassActionsDropdown } from "./class-actions-dropdown";

interface ClassCardProps {
    classItem: ClassData;
    onActionComplete?: () => void;
}

export function ClassCard({ classItem, onActionComplete }: ClassCardProps) {
    // Extract data using helpers or direct access
    const { subjectCode, subjectName, section, schoolYear, semester, semesterFormatted } = LaravelApiHelpers.formatClassInfoForClassData(classItem);

    const status = LaravelApiHelpers.getClassStatus({ data: classItem } as any);
    const enrollmentCount = LaravelApiHelpers.getClassEnrollmentCount({ data: classItem } as any);
    const maxSlots = classItem.class_information.maximum_slots;
    const progress = maxSlots > 0 ? (enrollmentCount / maxSlots) * 100 : 0;

    // Get theme colors/images from settings
    const bannerImage = classItem.settings?.visual?.banner_image;
    const themeColor = classItem.settings?.visual?.theme || "blue"; // Default fallback
    const accentColor = classItem.settings?.visual?.accent_color;

    // Determine background style
    const backgroundStyle = bannerImage
        ? { backgroundImage: `url(${bannerImage})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { background: accentColor || `var(--${themeColor}-500, #3b82f6)` }; // Fallback to accent or theme color

    // Schedule display
    const scheduleDisplay = LaravelApiHelpers.getClassScheduleDisplay({ data: classItem } as any);

    return (
        <Link href={`/dashboard/faculty/classes/${classItem.id}`} className="block group h-full">
            <Card className="h-full flex flex-col overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card group-hover:-translate-y-1 ring-1 ring-border/50">
                {/* Visual Header (Banner) */}
                <div
                    className="relative h-36 w-full p-5 flex flex-col justify-between transition-all duration-500 group-hover:brightness-110"
                    style={backgroundStyle}
                >
                    {/* Overlay for readability if using image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                    <div className="relative z-10 flex justify-between items-start">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md shadow-sm font-medium tracking-wide">
                            {subjectCode}
                        </Badge>

                        {/* Pass classItem as any to bypass type check for now, or we need to update ClassActionsDropdown */}
                        <div onClick={e => e.preventDefault()}>
                            <ClassActionsDropdown classItem={classItem as any} onActionComplete={onActionComplete} />
                        </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-end">
                        <Badge
                            variant="secondary"
                            className="bg-white/90 text-black hover:bg-white font-semibold shadow-sm backdrop-blur-sm"
                        >
                            Section {section}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col gap-4">
                    {/* Subject Name & Semester */}
                    <div className="space-y-1">
                        <h3
                            className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2"
                            title={subjectName}
                        >
                            {subjectName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {schoolYear} • {semesterFormatted}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar (Capacity) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span
                                className={cn(
                                    "font-medium",
                                    status.isFull ? "text-destructive" : "text-muted-foreground"
                                )}
                            >
                                {status.isFull ? "Class Full" : "Capacity"}
                            </span>
                            <span className="text-muted-foreground">
                                <span
                                    className={cn("font-semibold text-foreground", status.isFull && "text-destructive")}
                                >
                                    {enrollmentCount}
                                </span>
                                <span className="mx-0.5">/</span>
                                {maxSlots}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    status.isFull ? "bg-destructive" : "bg-primary"
                                )}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="h-px w-full bg-border/50" />

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 gap-2 text-sm">
                        {/* Schedule Summary */}
                        <div className="flex items-start gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 mt-0.5 text-primary/70" />
                            <span className="line-clamp-2 text-xs leading-relaxed">
                                {scheduleDisplay.schedules.length > 0
                                    ? `${scheduleDisplay.schedules.length} schedule${scheduleDisplay.schedules.length > 1 ? "s" : ""} set`
                                    : "No schedule set"}
                            </span>
                        </div>

                        {/* Room Info (Take first room if available) */}
                        {scheduleDisplay.schedules.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary/70" />
                                <span className="text-xs truncate">{scheduleDisplay.schedules[0].room.name}</span>
                            </div>
                        )}

                        {/* Credits (Placeholder as it's not in new ClassData explicitly, using course info if possible or static) */}
                        {/* Assuming credits might be part of course info or not available, omitting for now to keep clean or adding if found */}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
