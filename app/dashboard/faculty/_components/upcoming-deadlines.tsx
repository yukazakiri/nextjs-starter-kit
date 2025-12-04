"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function UpcomingDeadlines() {
    return (
        <Card className="h-full border-none shadow-sm bg-card/50">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Upcoming Deadlines</CardTitle>
                </div>
                <CardDescription>Tasks due soon</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <div className="p-3 bg-muted rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium">No upcoming deadlines</p>
                        <p className="text-sm text-muted-foreground">Great job staying on top of things!</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
