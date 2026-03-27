import { Routes, Route, HashRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
// import HomePage from "./pages/home/HomePage";
import RadicalIndexPage from "./pages/RadicalIndexPage";
import TransitionLayout from "./layouts/TransitionLayout";
import TopPage from "./layouts/TopPage";
import CharsByResidualPage from "./pages/CharsByResidualPage";
import RouteStateEffects from "./store/effects/RouteStateEffects";
import CharEntryPage from "./pages/CharEntryPage";
import HomePage from "./pages/HomePage";
import HomoPhonesPage from "./pages/HomophonesPage";
import RubyToolPage from "./pages/RubyToolPage";
import SyllableIndexPage from "./pages/SyllableIndexPage";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import BottomSheetMenu from "./components/ui/BottomSheetMenu";

export default function App() {

  return (
    <>
      <RouteStateEffects />
      <Routes>
        <Route element={<RootLayout />}>
          <Route element={<TopPage />}>
            <Route element={<TransitionLayout />}>
              {/* <Route path="/radical/:id/:radset" element={<CharsByResidualPage />} /> */}
              <Route path="/radical/:id" element={<CharsByResidualPage />} />
              <Route path="/radicals" element={<RadicalIndexPage />} />
              <Route path="/syllabary" element={<SyllableIndexPage />} />
              <Route path="/char/:char" element={<CharEntryPage />} />
              <Route path="/homophones" element={<HomoPhonesPage />} />
              <Route path="/rubytool" element={<RubyToolPage />} />
              <Route index element={<HomePage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      <BottomSheetMenu />
    </>
  );
}