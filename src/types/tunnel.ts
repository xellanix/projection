export type TunnelStatus = {
    active: boolean | undefined; // undefined = loading
    url: string | null;
    error?: string;
};
