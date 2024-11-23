import Hero from "../components/Hero";
import Launchpad from "../components/Launchpad";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a061e] bg-gradient-to-br from-[#351A88] via-[#150c35] to-[#0a061e]">
      <Navbar/>
      <Hero/>
      <Launchpad/>
    </div>
  )
}