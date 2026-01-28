import version from "@/data/version.json";

export function releaseTime() {
    const date = new Date(version.date);

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}
