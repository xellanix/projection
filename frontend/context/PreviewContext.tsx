import { createContext, useContext } from "react";

interface Preview {
    isPreview: boolean;
}

const PreviewContext = createContext<Preview>({
    isPreview: false,
});

export const usePreview = () => useContext(PreviewContext);

const preview: Preview = {
    isPreview: true,
};
export function PreviewProvider({ children }: { children: React.ReactNode }) {
    return (
        <PreviewContext.Provider value={preview}>
            {children}
        </PreviewContext.Provider>
    );
}
