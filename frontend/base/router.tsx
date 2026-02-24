import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/app/layout";
import HomePage from "@/app";
import ViewerPage from "@/app/view";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="view" element={<ViewerPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
