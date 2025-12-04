"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Bell } from "lucide-react";

export function RecentActivity() {
    return (
        <Card className="h-full border-none shadow-sm bg-card/50">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Recent Activity</CardTitle>
                </div>
                <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <div className="p-3 bg-muted rounded-full">
                        <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium">No recent activity</p>
                        <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
