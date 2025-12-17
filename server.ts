/* eslint-disable @typescript-eslint/no-floating-promises */
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import type { AppSettings, SettingsLocalScreenState } from "@/types/settings";
import { defaultSettings } from "@/data/settings";
import * as ps from "./server.persistence";
import { SPECIAL_INDEX } from "@/data/special-index";

// --- Server Setup ---
const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let currentIndex = 0;
let currentProjection = 0;
const specialScreen: SettingsLocalScreenState = {
    black: false,
    clear: false,
    transparent: false,
    cover: false,
    stopped: false,
};
const message = {
    message: "",
    isOpen: false,
};
const controllerIds: string[] = [];
let settings = ps.readJsonFile(ps.settingsFP, defaultSettings);

// --- Utility Functions ---
// Returns the index to be sent to the client
// If the special screen is active, returns -1 or -2
// Otherwise, returns the current index
const getPreferredIndex = () => {
    if (specialScreen.stopped) return SPECIAL_INDEX.STOPPED;
    else if (specialScreen.transparent) return SPECIAL_INDEX.TRANSPARENT;
    else if (specialScreen.cover) return SPECIAL_INDEX.COVER;
    else if (specialScreen.black) return SPECIAL_INDEX.BLACK;
    else if (specialScreen.clear) return SPECIAL_INDEX.CLEAR;

    return currentIndex;
};

// Updates the current projection and index for the on-screen display
const screenIndexUpdater = (
    projectionIndex: number,
    index: number,
    isProject?: boolean,
): boolean => {
    if (
        projectionIndex === currentProjection &&
        currentIndex === index &&
        ((isProject && !specialScreen.stopped) || !isProject)
    )
        return false;

    currentProjection = projectionIndex;
    currentIndex = index;

    if (isProject) specialScreen.stopped = false;

    return true;
};

// Removes a controller from the list
const removeController = (id: string) => {
    const index = controllerIds.indexOf(id);
    if (index === -1) return;

    controllerIds.splice(index, 1);
    console.log("Unregistered controller:", id);
};

// Resets the temporary variables if there are no controllers
const resetIfNoController = () => {
    if (controllerIds.length > 0) return;

    message.message = "";
    message.isOpen = false;
};

// --- Main App ---
app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error handling request:", err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    const io = new Server(httpServer, {
        path: "/api/socket_io",
        transports: ["websocket"],
        cors: {
            origin: "*",
        },
    });

    io.on("connection", (socket) => {
        console.log("✅ Client connected:", socket.id);

        // "client:socket:register"
        socket.on("client:socket:register", (id: string) => {
            controllerIds.push(id);
            socket.broadcast.emit("server:socket:hasAny", true);
            console.log("Registered controller:", id);
        });
        // "client:socket:unregister"
        socket.on("client:socket:unregister", (id: string) => {
            removeController(id);
            resetIfNoController();
            socket.broadcast.emit(
                "server:socket:hasAny",
                controllerIds.length > 0,
            );
        });
        // "client:socket:hasAny"
        socket.on("client:socket:hasAny", () => {
            resetIfNoController();
            socket.emit("server:socket:hasAny", controllerIds.length > 0);
        });

        // "client:caster:index:update"
        socket.on(
            "client:caster:index:update",
            (projectionIndex: number, index: number) => {
                if (!screenIndexUpdater(projectionIndex, index)) return;

                io.emit(
                    "server:screen:index:update",
                    projectionIndex,
                    index,
                    getPreferredIndex(),
                    socket.id,
                );
            },
        );
        // "client:caster:index:project"
        socket.on(
            "client:caster:index:project",
            (projectionIndex: number, index: number, isProject: boolean) => {
                if (!screenIndexUpdater(projectionIndex, index, isProject))
                    return;

                socket.emit(
                    "server:screen:index:project",
                    projectionIndex,
                    index,
                );
                io.emit(
                    "server:screen:index:update",
                    projectionIndex,
                    index,
                    getPreferredIndex(),
                    socket.id,
                );
            },
        );
        // "client:caster:specialScreen:set"
        socket.on(
            "client:caster:specialScreen:set",
            (type: keyof SettingsLocalScreenState, active: boolean) => {
                const lastIndex = getPreferredIndex();
                specialScreen[type] = active;

                io.emit("server:caster:specialScreen:sync", specialScreen);

                const index = getPreferredIndex();
                if (index === lastIndex) return;

                io.emit("server:screen:specialScreen:set", index);
            },
        );
        // "client:caster:message:toggle:request"
        socket.on(
            "client:caster:message:toggle:request",
            (message: string, force?: boolean) => {
                io.to(controllerIds[0]!).emit(
                    `server:caster:message:toggle:request`,
                    message,
                    force,
                );
            },
        );
        // "client:caster:message:toggle"
        socket.on(
            "client:caster:message:toggle",
            (_message: string, force?: boolean) => {
                message.message = _message;
                message.isOpen = force ?? !message.isOpen;
                io.emit(
                    "server:screen:message:toggle",
                    message.message,
                    message.isOpen,
                );
            },
        );

        // "client:screen:index:init"
        socket.on("client:screen:index:init", (callback) => {
            callback(
                currentProjection,
                currentIndex,
                getPreferredIndex(),
                specialScreen,
            );
        });

        // "client:screen:message:init:request"
        socket.on("client:screen:message:init:request", () => {
            io.to(controllerIds[0]!).emit("server:screen:message:init:request");
        });
        // "client:screen:message:init"
        socket.on(
            "client:screen:message:init",
            (
                message: string,
                isOpen: boolean,
                remaining: number,
                progress: number,
            ) => {
                io.emit(
                    "server:screen:message:init",
                    message,
                    isOpen,
                    remaining,
                    progress,
                );
            },
        );

        // "client:queue:reorder"
        socket.on("client:queue:reorder", (from: number, to: number) => {
            socket.broadcast.emit("server:queue:reorder", from, to);
        });

        // "client:video:bg:init:request"
        // "client:video:fg:init:request"
        const initRequest = (layer: "bg" | "fg") => () => {
            const requestId = socket.id;
            io.to(controllerIds[0]!).emit(
                `server:video:${layer}:init:request`,
                requestId,
            );
        };
        socket.on("client:video:bg:init:request", initRequest("bg"));
        socket.on("client:video:fg:init:request", initRequest("fg"));
        // "client:video:bg:init:response"
        // "client:video:fg:init:response"
        const initResponse =
            (layer: "bg" | "fg") =>
            (requestId: string, isPlaying: boolean, currentTime: number) => {
                io.to(requestId).emit(
                    `server:video:${layer}:init:response`,
                    isPlaying,
                    currentTime,
                );
            };
        socket.on("client:video:bg:init:response", initResponse("bg"));
        socket.on("client:video:fg:init:response", initResponse("fg"));

        // "client:settings:init"
        socket.on("client:settings:init", () => {
            settings = ps.readJsonFile(ps.settingsFP, defaultSettings);
            socket.emit("server:settings:init", settings);
        });
        // "client:settings:update"
        socket.on("client:settings:update", (s: AppSettings) => {
            settings = s;
            ps.wrtieJsonFile(ps.settingsFP, settings);
            socket.broadcast.emit("server:settings:update", settings);
        });

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
            removeController(socket.id);
            socket.broadcast.emit(
                "server:socket:hasAny",
                controllerIds.length > 0,
            );
        });
    });

    httpServer.listen(port, hostname, () => {
        console.log(
            `> Server listening on all interfaces at http://<your-ip-address>:${port}`,
        );
    });
});
