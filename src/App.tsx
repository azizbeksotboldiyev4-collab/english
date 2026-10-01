import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PremiumProvider } from "./contexts/PremiumContext";
import { HeartsProvider } from "./contexts/HeartsContext";
import { DailyMissionsProvider } from "./contexts/DailyMissionsContext";
import { ProgressProvider } from "./hooks/useProgress";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Levels from "./pages/Levels";
import LevelDetail from "./pages/LevelDetail";
import Lesson from "./pages/Lesson";
import Leaderboard from "./pages/Leaderboard";
import AiTutor from "./pages/AiTutor";
import TensesGame from "./pages/TensesGame";
import Games from "./pages/Games";
import WordHunt from "./pages/games/WordHunt";
import SpeedChallenge from "./pages/games/SpeedChallenge";
import MemoryCards from "./pages/games/MemoryCards";
import DragMatch from "./pages/games/DragMatch";
import Pronunciation from "./pages/games/Pronunciation";
import Adventure from "./pages/games/Adventure";
import ListeningHub from "./pages/ListeningHub";
import SpeakingHub from "./pages/SpeakingHub";
import VoiceChat from "./pages/VoiceChat";
import Simulation from "./pages/Simulation";
import Admin from "./pages/Admin";
import DbLesson from "./pages/DbLesson";
import TopicalVocabulary from "./pages/TopicalVocabulary";
import EssayChecker from "./pages/EssayChecker";
import Translator from "./pages/Translator";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <PremiumProvider>
              <ProgressProvider>
                <HeartsProvider>
                  <DailyMissionsProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Layout><Index /></Layout>} />
                  <Route path="/dashboard" element={<Layout><ProtectedRoute><Dashboard /></ProtectedRoute></Layout>} />
                  <Route path="/profile" element={<Layout><ProtectedRoute><Profile /></ProtectedRoute></Layout>} />
                  <Route path="/levels" element={<Layout><Levels /></Layout>} />
                  <Route path="/levels/:levelId" element={<Layout><LevelDetail /></Layout>} />
                  <Route path="/lesson/:id" element={<Layout><Lesson /></Layout>} />
                  <Route path="/db-lesson/:id" element={<Layout><DbLesson /></Layout>} />
                  <Route path="/listening" element={<Layout><ListeningHub /></Layout>} />
                  <Route path="/speaking" element={<Layout><SpeakingHub /></Layout>} />
                  <Route path="/voice-chat" element={<Layout><ProtectedRoute><VoiceChat /></ProtectedRoute></Layout>} />
                  <Route path="/simulation" element={<Layout><ProtectedRoute><Simulation /></ProtectedRoute></Layout>} />
                  <Route path="/games" element={<Layout><Games /></Layout>} />
                  <Route path="/games/word-hunt" element={<Layout><WordHunt /></Layout>} />
                  <Route path="/games/speed" element={<Layout><SpeedChallenge /></Layout>} />
                  <Route path="/games/memory" element={<Layout><MemoryCards /></Layout>} />
                  <Route path="/games/drag-match" element={<Layout><DragMatch /></Layout>} />
                  <Route path="/games/pronunciation" element={<Layout><Pronunciation /></Layout>} />
                  <Route path="/games/adventure" element={<Layout><Adventure /></Layout>} />
                  <Route path="/topical-vocabulary" element={<Layout><TopicalVocabulary /></Layout>} />
                  <Route path="/tenses-game" element={<Layout><TensesGame /></Layout>} />
                  <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
                  <Route path="/essay" element={<Layout><EssayChecker /></Layout>} />
                  <Route path="/translator" element={<Layout><Translator /></Layout>} />
                  <Route path="/analytics" element={<Layout><ProtectedRoute><Analytics /></ProtectedRoute></Layout>} />
                  <Route path="/yordamchi-ustoz" element={<Layout><ProtectedRoute><AiTutor /></ProtectedRoute></Layout>} />
                  <Route path="/admin" element={<Layout><ProtectedRoute><Admin /></ProtectedRoute></Layout>} />
                  <Route path="*" element={<Layout><NotFound /></Layout>} />
                </Routes>
                  </DailyMissionsProvider>
                </HeartsProvider>
              </ProgressProvider>
            </PremiumProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
