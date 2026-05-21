import { rename } from "fs/promises";
import { dirname, join } from "path";

let EXEC_DIR = "";
let PUBLIC_BASE = "";
const isProd = process.env.NODE_ENV === "production";

export function execDir(...segments: string[]) {
    EXEC_DIR ||= isProd ? dirname(process.execPath) : process.cwd();
    return join(EXEC_DIR, ...segments);
}

export function publicDir(...segments: string[]) {
    if (!PUBLIC_BASE) {
        const publicPath = isProd ? ["public"] : ["public", "__temp"];
        PUBLIC_BASE = execDir(...publicPath);
    }
    return join(PUBLIC_BASE, ...segments);
}

export const readJsonFile = async <T>(filePath: string, defaultValue: T): Promise<T> => {
    try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
            return (await file.json()) as T;
        }
    } catch (error) {
        console.error("Error reading settings file:", error);
    }
    return defaultValue;
};

export const writeJsonFile = async <T>(filePath: string, value: T) => {
    try {
        const tempPath = `${filePath}.tmp`;
        await Bun.write(tempPath, JSON.stringify(value, null, 2));
        // Atomically replace the old file with the new one
        // Tt either succeeds entirely or fails entirely
        await rename(tempPath, filePath);
    } catch (error) {
        console.error("Error writing to settings file:", error);
    }
};

export const settingsFP = publicDir("settings.json");
