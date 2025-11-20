import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface ComingSoonProps {
    title: string;
    description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Construction className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription>
                        {description || "This feature is currently under development and will be available soon."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">
                        We&apos;re working hard to bring you this feature. Check back later!
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
