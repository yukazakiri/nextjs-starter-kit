"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreamTab } from "./stream-tab";
import { ClassworkTab } from "./classwork-tab";
import { PeopleTab } from "./people-tab";
import { GradesTab } from "./grades-tab";
import { useParams } from "next/navigation";

export function ClassTabs() {
  const params = useParams();
  const classId = params?.classId as string;

  return (
    <div className="w-full">
      <Tabs defaultValue="stream" className="w-full">
        <div className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-3">
            <TabsList className="h-auto bg-transparent p-0 gap-2 justify-start overflow-x-auto no-scrollbar w-full">
              <TabsTrigger
                value="stream"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                Stream
              </TabsTrigger>
              <TabsTrigger
                value="classwork"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                Classwork
              </TabsTrigger>
              <TabsTrigger
                value="people"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                People
              </TabsTrigger>
              <TabsTrigger
                value="grades"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                Grades
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="py-6">
          <TabsContent value="stream" className="mt-0 animate-in fade-in-50 duration-300">
            <StreamTab classCode={classId} />
          </TabsContent>

          <TabsContent value="classwork" className="mt-0 animate-in fade-in-50 duration-300">
            <ClassworkTab />
          </TabsContent>

          <TabsContent value="people" className="mt-0 animate-in fade-in-50 duration-300">
            <PeopleTab />
          </TabsContent>

          <TabsContent value="grades" className="mt-0 animate-in fade-in-50 duration-300">
            <GradesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

