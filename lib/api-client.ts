import { treaty } from "@elysiajs/eden";
import type { App } from "@/server";

const client = treaty<App>(
    typeof window === "undefined" 
        ? `http://localhost:${process.env.PORT || 3000}` 
        : window.location.origin
);

export const api = client.api;
