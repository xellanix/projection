/* eslint-disable @typescript-eslint/no-floating-promises */
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

// --- Server Setup ---
const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let currentIndex = 0;
let currentProjection = 0;
const specialScreen = {
    black: false,
    clear: false,
};
const controllerIds: string[] = [];

// --- Utility Functions ---
// Returns the index to be sent to the client
// If the special screen is active, returns -1 or -2
// Otherwise, returns the current index
const getPreferredIndex = () => {
    if (specialScreen.black) return -1;
    else if (specialScreen.clear) return -2;

    return currentIndex;
};

// Removes a controller from the list
const removeController = (id: string) => {
    const index = controllerIds.indexOf(id);
    if (index !== -1) controllerIds.splice(index, 1);

    console.log("Unregistered controller:", id);
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
            socket.broadcast.emit(
                "server:socket:hasAny",
                controllerIds.length > 0,
            );
        });
        // "client:socket:hasAny"
        socket.on("client:socket:hasAny", () => {
            socket.emit("server:socket:hasAny", controllerIds.length > 0);
        });

        // "client:caster:index:update"
        socket.on(
            "client:caster:index:update",
            (projectionIndex: number, index: number) => {
                if (
                    projectionIndex === currentProjection &&
                    currentIndex === index
                )
                    return;

                currentProjection = projectionIndex;
                currentIndex = index;
                io.emit(
                    "server:screen:index:update",
                    projectionIndex,
                    index,
                    getPreferredIndex(),
                );
            },
        );
        // "client:caster:specialScreen:set"
        socket.on(
            "client:caster:specialScreen:set",
            (type: "black" | "clear", active: boolean) => {
                const lastIndex = getPreferredIndex();
                specialScreen[type] = active;

                const index = getPreferredIndex();
                if (index === lastIndex) return;

                io.emit("server:screen:specialScreen:set", index);
            },
        );

        // "client:screen:index:init"
        socket.on("client:screen:index:init", (callback) => {
            callback(currentProjection, currentIndex, getPreferredIndex());
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

        socket.on("disconnect", () => {
            removeController(socket.id);
            socket.broadcast.emit(
                "server:socket:hasAny",
                controllerIds.length > 0,
            );
            console.log("❌ Client disconnected:", socket.id);
        });
    });

    httpServer.listen(port, hostname, () => {
        console.log(
            `> Server listening on all interfaces at http://<your-ip-address>:${port}`,
        );
    });
});
