import {
    FrameContainer,
    FrameDescription,
    FrameHeader,
} from "@/components/SettingsFrame";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { openWeb } from "@/lib/utils";
import { useRemoteStore } from "@/stores/remote.store";
import { useSocketStore } from "@/stores/socket.store";
import type { TunnelStatus } from "@/types/tunnel";
import { Alert02Icon, Idea01Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useCallback, useEffect, useState } from "react";

const isValidUrl = (url?: string) => {
    try {
        if (!url) return false;

        const _ = new URL(url);
        return _.protocol === "http:" || _.protocol === "https:";
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
        return false;
    }
};

export const RemoteSetting = memo(function RemoteSetting() {
    return (
        <FrameContainer>
            <FrameHeader>
                <FrameDescription>
                    Manage the projection remote control. With this remote
                    control, you can control the live projection from anywhere,
                    as long as you are connected to the network.
                </FrameDescription>
                <Alert>
                    <HugeiconsIcon icon={Idea01Icon} strokeWidth={1.75} />
                    <AlertDescription>
                        <span>
                            Any changes made to these settings will be saved
                            automatically.
                        </span>
                        <span>
                            The Cancel button will not cancel these settings.
                        </span>
                    </AlertDescription>
                </Alert>
            </FrameHeader>

            <ItemGroup className="*:not-first:rounded-t-none *:not-first:border-t-0 *:not-last:rounded-b-none">
                <Item variant={"outline"}>
                    <ItemContent>
                        <ItemTitle>Remote Control</ItemTitle>
                        <ItemDescription>
                            Enable or disable remote control.
                        </ItemDescription>
                    </ItemContent>
                    <RemoteAction />
                </Item>
                <Alert>
                    <HugeiconsIcon icon={Idea01Icon} strokeWidth={1.75} />
                    <AlertDescription>
                        Once you enable the remote control, the system will
                        generate a temporary remote control link. It will expire
                        when the remote control is disabled, and a new temporary
                        link will be generated when it is re-enabled.
                    </AlertDescription>
                </Alert>
                <Alert>
                    <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.75} />
                    <AlertDescription>
                        Only share the link with trusted users.
                    </AlertDescription>
                </Alert>
            </ItemGroup>

            <ItemGroup className="*:not-first:rounded-t-none *:not-first:border-t-0 *:not-last:rounded-b-none">
                <Item variant={"outline"}>
                    <ItemContent>
                        <RemoteLink />
                        <ItemDescription>
                            The generated remote control link.
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <OpenRemoteLink />
                        <CopyRemoteLink />
                    </ItemActions>
                </Item>
            </ItemGroup>
        </FrameContainer>
    );
});

const RemoteAction = memo(function RemoteAction() {
    const isActive = useRemoteStore((s) => isValidUrl(s.url));
    const [loading, setLoading] = useState(false);

    const changeCurrent = useCallback(() => {
        const socket = useSocketStore.getState().socket;
        if (!socket) return;

        const isOn = isValidUrl(useRemoteStore.getState().url);
        socket.emit("client:tunnel:toggle", !isOn);
    }, []);

    useEffect(() => {
        const socket = useSocketStore.getState().socket;
        if (!socket) return;

        const tunnelStatus = (status: TunnelStatus) => {
            setLoading(status.active === undefined);
            const resolved = (status.active && status.url) || undefined;

            useRemoteStore.getState().setUrl(resolved);
        };

        socket.on("server:tunnel:status", tunnelStatus);
        socket.emit("client:tunnel:status");

        return () => {
            socket.off("server:tunnel:status", tunnelStatus);
        };
    }, []);

    return (
        <ItemActions>
            {loading && <Spinner className="text-muted-foreground" />}
            <span className="text-muted-foreground">
                {loading ? "Loading..." : isActive ? "Enabled" : "Disabled"}
            </span>
            <Switch
                checked={isActive}
                onCheckedChange={changeCurrent}
                disabled={loading}
            />
        </ItemActions>
    );
});

const RemoteLink = memo(function RemoteLink() {
    const url = useRemoteStore(
        (s) => s.url ?? "Remote Control Link Not Available",
    );

    return <ItemTitle>{url}</ItemTitle>;
});
const OpenRemoteLink = memo(function RemoteLinkAction() {
    const open = useCallback(() => {
        const url = useRemoteStore.getState().url;
        if (!isValidUrl(url)) return;

        openWeb(url!);
    }, []);

    return (
        <Button
            variant={"outline"}
            aria-label="Open Generated Link"
            onClick={open}
        >
            Open
        </Button>
    );
});
const CopyRemoteLink = memo(function RemoteLinkAction() {
    const [status, setStatus] = useState(0);

    const copy = useCallback(async () => {
        const url = useRemoteStore.getState().url;
        if (!isValidUrl(url)) return;

        setStatus(1);
        await navigator.clipboard.writeText(url!);
        setTimeout(() => setStatus(0), 1000);
    }, []);

    return (
        <Button
            variant={"outline"}
            aria-label="Copy Generated Link"
            onClick={copy}
            disabled={status !== 0}
        >
            {status === 0 ? "Copy" : "Copied!"}
        </Button>
    );
});
