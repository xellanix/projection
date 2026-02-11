"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn, updateObjectFromSource } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings.store";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
    NAVIGATION_LIST,
    NAVIGATION_LOOKUP,
    FOOTER_LIST,
    FOOTER_LOOKUP,
    type NavigationItem,
} from "@/components/dialogs/settings/registry";
import { useSocketStore } from "@/stores/socket.store";

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
    const isLocal = useSocketStore((s) => s.isLocal);

    const _navs = isLocal
        ? NAVIGATION_LIST
        : NAVIGATION_LIST.filter((n) => !n.isLocal);

    return (
        <Sidebar className="h-full">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {_navs.map((nav) => (
                                <DialogSidebarButton key={nav.id} nav={nav} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    {FOOTER_LIST.map((nav) => (
                        <DialogSidebarButton key={nav.id} nav={nav} />
                    ))}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
});

const DialogSidebarButton = memo(function DialogSidebarButton({
    nav,
}: {
    nav: Omit<NavigationItem, "content" | "isLocal">;
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

const SidebarFrameBreadcrumb = memo(function SidebarFrameBreadcrumb() {
    const activePage = useSettingsStore((s) => s.temp.activePage);

    const breadcrumbs = useMemo(() => {
        const arr = activePage.startsWith("f-")
            ? FOOTER_LOOKUP
            : NAVIGATION_LOOKUP;
        const item = arr[activePage];

        if (!item) return ["Settings"];

        return ["Settings", item.title || "Undefined"];
    }, [activePage]);

    return (
        <Breadcrumb>
            <BreadcrumbList className="sm:gap-1.5 md:gap-2.5">
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
    const content = useSettingsStore(
        useShallow((s) => {
            const activePage = s.temp.activePage;

            const arr = activePage.startsWith("f-")
                ? FOOTER_LOOKUP
                : NAVIGATION_LOOKUP;
            return arr[activePage]?.content;
        }),
    );

    return content;
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

export {
    DialogFooter2,
    DialogSidebar,
    SidebarFrameBreadcrumb,
    SidebarFrameContent,
};
