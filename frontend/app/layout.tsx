import { Outlet } from "react-router-dom";
import { SettingsInitiator } from "@/components/stores/SettingsInitiator";
import { SocketInitiator } from "@/components/stores/SocketInitiator";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
    return (
        <>
            <SocketInitiator />
            <SettingsInitiator />
            <Outlet />
            <Toaster richColors={true} />
        </>
    );
}
