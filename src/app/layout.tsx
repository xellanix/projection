import { SocketInitiator } from "@/components/stores/SocketInitiator";
import { ProjectionProvider } from "@/context/ProjectionContext";
import "@/styles/globals.css";

import { type Metadata } from "next";

export const metadata: Metadata = {
    title: "Xellanix Projection",
    description: "Xellanix Projection",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <SocketInitiator />
                <ProjectionProvider>{children}</ProjectionProvider>
            </body>
        </html>
    );
}
