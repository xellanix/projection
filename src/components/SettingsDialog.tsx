"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn, updateObjectFromSource } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings.store";
import { MaximizeScreenIcon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { memo, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { v4 as uuidv4 } from "uuid";
import { SettingsSync } from "@/components/stores/SettingsSync";
import { toast } from "sonner";

import { BackdropSetting } from "@/components/BackdropSetting";
import { CoverSetting } from "@/components/CoverSetting";
import { RemapSetting } from "@/components/RemapSetting";

type NavigationItem = {
    id: string;
    title: string;
    icon: IconSvgElement;
    content: React.ReactNode;
};

const navs: NavigationItem[] = [
    {
        id: "1",
        title: "Backdrop",
        icon: MaximizeScreenIcon,
        content: <BackdropSetting />,
    },
    {
        id: "2",
        title: "Cover Screen",
        icon: MaximizeScreenIcon,
        content: <CoverSetting />,
    },
    {
        id: "3",
        title: "Screen Remapping",
        icon: MaximizeScreenIcon,
        content: <RemapSetting />,
    },
];

export const SettingsDialog = memo(function SettingsDialog() {
    return (
        <DialogContent className="overflow-hidden p-0 md:h-[80dvh] md:max-h-[80dvh] md:max-w-[80dvw] lg:max-w-[90dvw]">
            <SettingsSync />
            <div className="flex flex-col overflow-hidden">
                <DialogTitle className="absolute opacity-0 select-none">
                    Settings
                </DialogTitle>
                <SidebarProvider className="size-full min-h-0">
                    <DialogSidebar />

                    <SidebarFrame />
                </SidebarProvider>
                <DialogFooter2 />
            </div>
        </DialogContent>
    );
});

const DialogFooter2 = memo(function DialogFooter2() {
    const set = useSettingsStore((s) => s.set);

    const cancel = useCallback(() => {
        set((s) => {
            Object.assign(s.temp, s.global);
        });
    }, [set]);

    const save = useCallback(() => {
        set((s) => {
            updateObjectFromSource(s.global, s.temp);
            s.global.__internal.id = uuidv4();
        });
        toast.success("Settings saved.");
    }, [set]);

    return (
        <DialogFooter className="flex-row justify-end p-6">
            <DialogClose asChild>
                <Button variant={"outline"} onClick={cancel}>
                    Cancel
                </Button>
            </DialogClose>
            <DialogClose asChild>
                <Button onClick={save}>Save</Button>
            </DialogClose>
        </DialogFooter>
    );
});

const DialogSidebar = memo(function DialogSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navs.map((nav) => (
                                <DialogSidebarButton key={nav.id} nav={nav} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
});

const DialogSidebarButton = memo(function DialogSidebarButton({
    nav,
}: {
    nav: NavigationItem;
}) {
    const [isActive, setActivePage] = useSettingsStore(
        useShallow((s) => [s.temp.activePage === nav.id, s.setActivePage]),
    );

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isActive}
                onClick={() => setActivePage(nav.id)}
                className={cn(
                    "before:bg-brand relative before:absolute before:top-full before:bottom-full before:left-0 before:z-10 before:w-0.75 before:rounded-full before:transition-all before:duration-133 before:ease-out",
                    { "before:top-2.5 before:bottom-2.5": isActive },
                )}
            >
                <HugeiconsIcon icon={nav.icon} strokeWidth={2} />
                {nav.title}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
});

const SidebarFrame = memo(function SidebarFrame() {
    return (
        <main className="flex size-full flex-col">
            <header className="bg-background flex shrink-0 items-center border-b">
                <SidebarTrigger className="m-2" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <SidebarFrameBreadcrumb />
            </header>
            <section className="flex size-full flex-col overflow-hidden">
                <ScrollArea className="size-full px-4">
                    <SidebarFrameContent />
                </ScrollArea>
            </section>
        </main>
    );
});

const SidebarFrameBreadcrumb = memo(function SidebarFrameBreadcrumb() {
    const currentPage = useSettingsStore((s) =>
        navs.findIndex((n) => n.id === s.temp.activePage),
    );

    const breadcrumbs = useMemo(() => {
        if (currentPage === -1) {
            return ["Settings"];
        }

        return ["Settings", navs[currentPage]?.title ?? "Undefined"];
    }, [currentPage]);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                    <BreadcrumbPair
                        key={index}
                        index={index}
                        breadcrumb={breadcrumb}
                        length={breadcrumbs.length}
                    />
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
});

const SidebarFrameContent = memo(function SidebarFrameContent() {
    const currentPage = useSettingsStore((s) =>
        navs.findIndex((n) => n.id === s.temp.activePage),
    );

    return navs[currentPage]?.content;
});

export const FrameContainer = memo(function FrameContainer({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-col gap-4 pt-4">{children}</div>;
});

export const FrameHeader = memo(function FrameHeader({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="flex flex-col gap-2">{children}</div>;
});

export const FrameDescription = memo(function FrameDescription({
    children,
}: {
    children: React.ReactNode;
}) {
    return <p className="text-muted-foreground text-sm">{children}</p>;
});

const BreadcrumbPair = memo(function BreadcrumbPair({
    index,
    breadcrumb,
    length,
}: {
    index: number;
    breadcrumb: React.ReactNode;
    length: number;
}) {
    const isLast = index === length - 1;

    if (isLast) {
        return (
            <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
            </BreadcrumbItem>
        );
    }

    return (
        <>
            <BreadcrumbItem>{breadcrumb}</BreadcrumbItem>
            <BreadcrumbSeparator />
        </>
    );
});
