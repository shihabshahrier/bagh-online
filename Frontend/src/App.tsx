import { BrowserRouter, Route, Routes } from "react-router-dom";

import SiteLayout from "./components/SiteLayout";
import ChallengesPage from "./pages/ChallengesPage";
import ChallengeDetailPage from "./pages/ChallengeDetailPage";
import LandingPage from "./pages/LandingPage";
import LearnPage from "./pages/LearnPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import { GeminiProvider } from "./context/GeminiContext";

export default function App() {
  return (
    <GeminiProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="playground" element={<PlaygroundPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="challenges/:challengeId" element={<ChallengeDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GeminiProvider>
  );
}
