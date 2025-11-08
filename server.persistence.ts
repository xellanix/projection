import fs from "fs";
import path from "path";

export const readJsonFile = <T>(filePath: string, defaultValue: T): T => {
    const fp = path.join(process.cwd(), filePath);
    try {
        if (fs.existsSync(fp)) {
            const fileContent = fs.readFileSync(fp, "utf-8");
            return JSON.parse(fileContent) as T;
        }
    } catch (error) {
        console.error("Error reading settings file:", error);
    }
    return defaultValue;
};

export const wrtieJsonFile = <T>(filePath: string, value: T) => {
    const fp = path.join(process.cwd(), filePath);
    try {
        fs.writeFileSync(fp, JSON.stringify(value, null, 2));
    } catch (error) {
        console.error("Error writing to settings file:", error);
    }
};

export const settingsFP = "public/_temp/settings.json";
