import { SocketInitiator } from "@/components/stores/SocketInitiator";
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
                {children}
            </body>
        </html>
    );
}
