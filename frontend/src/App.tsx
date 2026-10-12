import { Navigate, Routes, Route } from "react-router-dom";
import SiteShell from "@/components/SiteShell";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Insights from "@/pages/Insights";
// /solutions and /resources are full pages (src/pages/Solutions.tsx, src/pages/Resources.tsx).
// Keep /insights alive for preserved deep links to the Market Insights page.
// The old Services page is gone; /services now forwards to Solutions so old links still land.
import Solutions from "@/pages/Solutions";
import Resources from "@/pages/Resources";
import Rewards from "@/pages/Rewards";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Legal from "@/pages/Legal";
import NotFound from "@/pages/NotFound";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return <SiteShell><Routes><Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/services" element={<Navigate to="/solutions" replace />} /><Route path="/solutions" element={<Solutions />} /><Route path="/resources" element={<Resources />} /><Route path="/rewards" element={<Rewards />} /><Route path="/insights" element={<Insights />} /><Route path="/insights/:slug" element={<Navigate to="/insights" replace />} /><Route path="/contact" element={<Contact />} /><Route path="/login" element={<Login />} /><Route path="/privacy" element={<Legal type="privacy" />} /><Route path="/terms" element={<Legal type="terms" />} /><Route path="/compliance" element={<Legal type="compliance" />} /><Route path="*" element={<NotFound />} /></Routes></SiteShell>;
}
