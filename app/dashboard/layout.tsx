import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Chatbot from "./_components/chatbot";
import { SemesterProvider } from "@/contexts/semester-context";
import AcademicPeriodSelector from "./_components/academic-period-selector";
import { ImpersonationBanner } from "@/components/impersonation-banner";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SemesterProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1" />
            <AcademicPeriodSelector />
          </header>
          <ImpersonationBanner />
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          <Chatbot />
        </SidebarInset>
      </SidebarProvider>
    </SemesterProvider>
  );
}
