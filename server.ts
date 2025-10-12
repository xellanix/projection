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

// --- Utility Functions ---
// Returns the index to be sent to the client
// If the special screen is active, returns -1 or -2
// Otherwise, returns the current index
const getPreferredIndex = () => {
    if (specialScreen.black) return -1;
    else if (specialScreen.clear) return -2;

    return currentIndex;
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

        socket.on(
            "requestUpdateIndex",
            (projectionIndex: number, index: number) => {
                if (
                    projectionIndex === currentProjection &&
                    currentIndex === index
                )
                    return;

                currentProjection = projectionIndex;
                currentIndex = index;
                io.emit(
                    "updateIndex",
                    projectionIndex,
                    index,
                    getPreferredIndex(),
                );
            },
        );

        socket.on("jumpToLastSlide", (callback) => {
            callback(currentProjection, currentIndex, getPreferredIndex());
        });

        socket.on(
            "specialScreen",
            (type: "black" | "clear", active: boolean) => {
                const lastIndex = getPreferredIndex();
                specialScreen[type] = active;

                const index = getPreferredIndex();
                if (index === lastIndex) return;

                io.emit("viewerManipulated", index);
            },
        );

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected:", socket.id);
        });
    });

    httpServer.listen(port, hostname, () => {
        console.log(
            `> Server listening on all interfaces at http://<your-ip-address>:${port}`,
        );
    });
});
