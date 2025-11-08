import { SettingsInitiator } from "@/components/stores/SettingsInitiator";
import { SocketInitiator } from "@/components/stores/SocketInitiator";
import { Toaster } from "@/components/ui/sonner";
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
            {process.env.NODE_ENV === "development" && (
                <head>
                    {/*eslint-disable-next-line @next/next/no-sync-scripts*/}
                    <script
                        crossOrigin="anonymous"
                        src="//unpkg.com/react-scan/dist/auto.global.js"
                    />
                </head>
            )}
            <body>
                <SocketInitiator />
                <SettingsInitiator />
                {children}
                <Toaster richColors={true} />
            </body>
        </html>
    );
}
