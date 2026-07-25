import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import CareerAssessment from "./pages/CareerAssessment";
import AIProjects from "./pages/AIProjects";
import DailyMission from "./pages/DailyMission";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import InterviewSimulator from "./pages/InterviewSimulator";
import CareerRoadmap from "./pages/CareerRoadmap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}

        <Route path="/" element={<Home />} />

        <Route
          path="/onboarding"
          element={<Onboarding />}
        />

        {/* Dashboard pages with Sidebar */}

        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/daily-mission"
            element={<DailyMission />}
          />

          <Route
            path="/ai-projects"
            element={<AIProjects />}
          />

          <Route
            path="/resume-analyzer"
            element={<ResumeAnalyzer />}
          />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/career-assessment"
           element={<CareerAssessment />}
          />
          <Route
            path="/interview-simulator"
            element={<InterviewSimulator />}
          />
          <Route
            path="/career-roadmap"
            element={<CareerRoadmap />}
          />
        </Route>

        {/* Fallback */}

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;