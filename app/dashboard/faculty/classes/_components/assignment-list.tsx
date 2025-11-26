import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AssignmentList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Assignments</CardTitle>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-12">
          <p>No assignments created yet.</p>
          <p className="text-sm">Click "Create Assignment" to get started.</p>
        </div>
      </CardContent>
    </Card>
  );
}
