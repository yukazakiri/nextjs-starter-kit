import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Phone, HelpCircle } from "lucide-react";

export default async function HelpPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Help & Support
                </h1>
                <p className="text-muted-foreground mt-2">
                    Get assistance with your student portal account and services.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            <CardTitle>Email Support</CardTitle>
                        </div>
                        <CardDescription>
                            Send us an email and we&apos;ll get back to you within 24 hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            support@studentportal.edu
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" />
                            <CardTitle>Phone Support</CardTitle>
                        </div>
                        <CardDescription>
                            Call us during business hours (Mon-Fri, 9AM-5PM).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            +1 (555) 123-4567
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            <CardTitle>Live Chat</CardTitle>
                        </div>
                        <CardDescription>
                            Chat with our support team in real-time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            Start Chat
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            <CardTitle>FAQ</CardTitle>
                        </div>
                        <CardDescription>
                            Browse frequently asked questions and guides.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            View FAQ
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Common Issues</CardTitle>
                    <CardDescription>
                        Quick solutions to common problems
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                            <h4 className="font-medium mb-1">How do I reset my password?</h4>
                            <p className="text-sm text-muted-foreground">
                                Click on your profile icon, go to Settings, and select &quot;Change Password&quot;.
                            </p>
                        </div>
                        <div className="border-l-4 border-primary pl-4">
                            <h4 className="font-medium mb-1">Where can I view my grades?</h4>
                            <p className="text-sm text-muted-foreground">
                                Navigate to the Grades section from the sidebar to view all your course grades.
                            </p>
                        </div>
                        <div className="border-l-4 border-primary pl-4">
                            <h4 className="font-medium mb-1">How do I submit assignments?</h4>
                            <p className="text-sm text-muted-foreground">
                                Go to the Assignments page, select the assignment, and click &quot;Submit&quot; to upload your work.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
