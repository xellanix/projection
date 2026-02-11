import type { IncomingMessage } from "node:http";

export function isTrulyLocal(req: IncomingMessage): boolean {
    const headers = req.headers;
    const ip = req.socket.remoteAddress;

    // Check IP: If it's not 127.0.0.1 (or IPv6 equiv), it's definitely remote.
    // This handles the "0.0.0.0" case.
    const isLocalIP =
        ip && ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip);
    if (!isLocalIP) return false;

    // Check Proxy Headers: If ANY of these exist, it's a Tunnel.
    const proxyHeaders = [
        "x-forwarded-for", // Standard
        "x-real-ip", // Standard
        "cf-connecting-ip", // Cloudflare
        "true-client-ip", // Cloudflare / Akamai
        "fastly-client-ip", // Fastly
        "x-cluster-client-ip", // Rackspace / Riverbed
        "x-forwarded", // General
        "forwarded-for", // General
        "foward", // General
        "ngrok-skip-browser-warning", // Ngrok
    ];

    const hasProxyHeader = proxyHeaders.some(
        (header) => headers[header] !== undefined,
    );

    // It is only "True Local" if it has a Local IP AND No Proxy Headers
    return !hasProxyHeader;
}
