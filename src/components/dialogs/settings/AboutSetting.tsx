import { BrandHorizontal } from "@/components/core/Brand";
import { FrameContainer } from "@/components/dialogs/settings/SettingsDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemHeader,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import version from "@/data/version.json";
import { releaseTime } from "@/lib/date";
import { openWeb } from "@/lib/utils";
import {
    Alert02Icon,
    ArrowUpRight01Icon,
    CheckmarkBadge01Icon,
    DiplomaIcon,
    PackageIcon,
    SystemUpdate02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { memo, useCallback, useState } from "react";

type Dependency = {
    name: string;
    version?: string;
    license: string;
    website?: string;
};

const deps: Dependency[] = [
    {
        name: "Hugeicons",
        license: "Hugeicons Pro",
        website: "https://hugeicons.com/",
    },
    {
        name: "Radix UI",
        license: "MIT",
        website: "https://www.radix-ui.com/",
    },
    {
        name: "Motion",
        version: "12.34.0-alpha.0",
        license: "MIT",
        website: "https://motion.dev/",
    },
    {
        name: "Next.js",
        version: "16.0.10",
        license: "MIT",
        website: "https://nextjs.org/",
    },
    {
        name: "PostCSS",
        version: "^8.5.3",
        license: "MIT",
        website: "https://postcss.org/",
    },
    {
        name: "React",
        version: "^19.2.3",
        license: "MIT",
        website: "https://react.dev/",
    },
    {
        name: "Socket.IO",
        version: "^4.8.1",
        license: "MIT",
        website: "https://socket.io/",
    },
    {
        name: "Tailwind CSS",
        version: "^4.0.15",
        license: "MIT",
        website: "https://tailwindcss.com/",
    },
    {
        name: "TypeScript",
        version: "^5.8.2",
        license: "Apache-2.0",
        website: "https://www.typescriptlang.org/",
    },
    {
        name: "Zod",
        version: "4.2.1",
        license: "MIT",
        website: "https://zod.dev/",
    },
    {
        name: "Zustand",
        version: "^5.0.8",
        license: "MIT",
        website: "https://zustand.docs.pmnd.rs/",
    },
];

export const AboutSetting = memo(function AboutSetting() {
    return (
        <FrameContainer>
            <ItemGroup className="*:not-first:rounded-t-none *:not-first:border-t-0 *:not-last:rounded-b-none">
                <Item variant={"outline"}>
                    <ItemHeader>
                        <BrandHorizontal className="aspect-[131/28] h-auto w-full max-w-48" />
                    </ItemHeader>
                    <ItemContent>
                        <ItemTitle>Xellanix Projection</ItemTitle>
                        <ItemDescription className="line-clamp-none">
                            Version {version.version}
                            <br />
                            Commit{" "}
                            <a
                                href={`https://github.com/xellanix/projection/commit/${version.commit}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 !no-underline"
                            >
                                {version.commit.slice(0, 7)}
                                <HugeiconsIcon
                                    icon={ArrowUpRight01Icon}
                                    strokeWidth={2}
                                    className="size-4"
                                />
                            </a>
                            <br />
                            Released on {releaseTime()}
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant={"outline"}>
                    <ItemMedia>
                        <HugeiconsIcon icon={DiplomaIcon} strokeWidth={1.75} />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>
                            <span>
                                Licensed under the{" "}
                                <span className="text-brand">
                                    BSD 2-Clause License
                                </span>
                            </span>
                        </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                        <Button
                            variant={"outline"}
                            aria-label="View License"
                            onClick={() =>
                                openWeb(
                                    "https://github.com/xellanix/projection/blob/main/LICENSE",
                                )
                            }
                        >
                            View
                        </Button>
                    </ItemActions>
                </Item>
            </ItemGroup>

            <ItemGroup className="*:not-first:rounded-t-none *:not-first:border-t-0 *:not-last:rounded-b-none">
                <Item variant={"outline"}>
                    <ItemMedia>
                        <HugeiconsIcon
                            icon={SystemUpdate02Icon}
                            strokeWidth={1.75}
                        />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Check for updates</ItemTitle>
                    </ItemContent>
                    <UpdateActions />
                </Item>
                <Alert>
                    <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.75} />
                    <AlertDescription>
                        Self-updating is not available in browser mode. You
                        still need to use the utilities app (Windows) or run the
                        commands manually to install the update.
                    </AlertDescription>
                </Alert>
                <Alert>
                    <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.75} />
                    <AlertDescription>
                        After the update is applied, you need to rebuild this
                        project in order to see the changes when using
                        production mode.
                    </AlertDescription>
                </Alert>
            </ItemGroup>

            <div className="flex flex-col gap-2">
                <span className="font-medium">Core Dependencies</span>
                <ItemGroup className="*:not-first:rounded-t-none *:not-first:border-t-0 *:not-last:rounded-b-none">
                    {deps.map((dep) => (
                        <DependencyItem key={dep.name} {...dep} />
                    ))}
                </ItemGroup>
            </div>
        </FrameContainer>
    );
});

const UpdateActions = memo(function UpdateActions() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<typeof version | null>(null);

    const check = useCallback(async () => {
        try {
            setLoading(true);
            setData(null);
            const res = await fetch(
                `https://raw.githubusercontent.com/xellanix/projection/main/src/data/version.json`,
            );
            setData(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    if (data === null || data.version === version.version) {
        return (
            <ItemActions>
                {loading && <Spinner className="text-muted-foreground" />}
                {!loading && !!data && (
                    <div className="text-muted-foreground flex items-center gap-0.5">
                        <HugeiconsIcon
                            icon={CheckmarkBadge01Icon}
                            strokeWidth={2}
                            className="size-4"
                        />
                        <span>No updates available</span>
                    </div>
                )}
                <Button
                    variant={"outline"}
                    aria-label="Check for Updates"
                    onClick={check}
                    disabled={loading}
                >
                    Check
                </Button>
            </ItemActions>
        );
    }

    return (
        <ItemActions className="flex-wrap">
            {!loading && (
                <div className="text-muted-foreground flex items-center gap-0.5">
                    <HugeiconsIcon
                        icon={ArrowUpRight01Icon}
                        strokeWidth={2}
                        className="size-4"
                    />
                    <span>{data.version}</span>
                </div>
            )}
            <Button
                variant={"outline"}
                aria-label="View Release Notes"
                onClick={() =>
                    openWeb(
                        `https://github.com/xellanix/projection/releases/tag/v${data.version}`,
                    )
                }
            >
                Release Notes
            </Button>
        </ItemActions>
    );
});

const DependencyItem = memo(function DependencyItem({
    name,
    version,
    license,
    website,
}: Dependency) {
    return (
        <Item variant={"outline"}>
            <ItemMedia>
                <HugeiconsIcon icon={PackageIcon} strokeWidth={1.75} />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>{name}</ItemTitle>
                <ItemDescription>
                    {version && `${version} • `}
                    {license} License
                </ItemDescription>
            </ItemContent>
            {website && (
                <ItemActions>
                    <Button
                        variant={"outline"}
                        size={"icon"}
                        aria-label={`Go to ${name} Homepage`}
                        onClick={() => openWeb(website)}
                    >
                        <HugeiconsIcon
                            icon={ArrowUpRight01Icon}
                            strokeWidth={2.25}
                        />
                    </Button>
                </ItemActions>
            )}
        </Item>
    );
});
