import fs from "fs";
import path, { dirname, join } from "path";

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

export const readJsonFile = <T>(filePath: string, defaultValue: T): T => {
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, "utf-8");
            return JSON.parse(fileContent) as T;
        }
    } catch (error) {
        console.error("Error reading settings file:", error);
    }
    return defaultValue;
};

export const writeJsonFile = <T>(filePath: string, value: T) => {
    const dirPath = path.dirname(filePath);
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
    } catch (error) {
        console.error("Error writing to settings file:", error);
    }
};

export const settingsFP = publicDir("settings.json");
