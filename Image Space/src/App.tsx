import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import DatasetPage from "@/pages/DatasetPage";
import { ImageProvider } from "@/contexts/ImageContext";
import { TagProvider } from "@/contexts/TagContext";
import { ConfigProvider } from "@/contexts/ConfigContext";

export default function App() {
  return (
    <ConfigProvider>
      <TagProvider>
        <ImageProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dataset" element={<DatasetPage />} />
          </Routes>
        </ImageProvider>
      </TagProvider>
    </ConfigProvider>
  );
}
