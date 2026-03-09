import { Link, useNavigate } from "react-router-dom";
import { Car, ShieldCheck, Zap, Wallet, ArrowRight, Navigation } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const handleDriverClick = (e) => {
    const driverId = localStorage.getItem("driverId");
    if (driverId) {
      e.preventDefault();
      navigate("/driver/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 selection:bg-emerald-100">
      
      {/* Navbar - Sticky & Glassmorphism */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-emerald-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Navigation className="text-white" size={20} fill="currentColor" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-800 uppercase">
            Cab<span className="text-emerald-600">Book</span>
          </h1>
        </div>

        <div className="hidden md:flex gap-6 items-center">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">Rider</Link>
          <Link to="/driver/login" onClick={handleDriverClick} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">Driver</Link>
          <Link
            to="/login"
            className="ml-4 px-5 py-2.5 rounded-full font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition shadow-lg shadow-slate-200"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6 bg-[#fcfcfd]">
        {/* Subtle Background Decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">
            Available in 50+ Cities
          </span>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
            Move safely, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              whenever you need.
            </span>
          </h1>

          <p className="max-w-2xl text-slate-500 text-lg md:text-xl mb-10 leading-relaxed">
            Experience the next generation of ride-sharing. Fast pickups, 
            vetted professional drivers, and flat-rate pricing you can trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-2xl shadow-slate-300"
            >
              <Car size={22} />
              Book a Ride
            </Link>

            <Link
              to="/driver/login"
              onClick={handleDriverClick}
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold bg-white text-slate-900 border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all hover:-translate-y-1"
            >
              Drive With Us
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Designed for modern travel
            </h2>
            <p className="text-slate-500">Simple, reliable, and secure — just how transportation should be.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div className="group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={28} fill="currentColor" className="opacity-20" />
              <Zap size={28} className="absolute" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Dispatch</h3>
            <p className="text-slate-500 leading-relaxed">
              Our advanced algorithm connects you to the nearest driver in seconds, reducing wait times by up to 40%.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={28} fill="currentColor" className="opacity-20" />
              <ShieldCheck size={28} className="absolute" />
            </div>
            <h3 className="text-xl font-bold mb-3">Safety First</h3>
            <p className="text-slate-500 leading-relaxed">
              Real-time GPS tracking and 24/7 incident support. Every driver undergoes a rigorous background check.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wallet size={28} fill="currentColor" className="opacity-20" />
              <Wallet size={28} className="absolute" />
            </div>
            <h3 className="text-xl font-bold mb-3">Honest Pricing</h3>
            <p className="text-slate-500 leading-relaxed">
              No surge pricing surprises. Know exactly what you'll pay before you even request your ride.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark Mode Card */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to get moving?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md">
              Join thousands of riders who choose CabBook for their daily commute.
            </p>
            <Link
              to="/login"
              className="px-10 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-900/20"
            >
              Get Started Now
            </Link>
          </div>
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 border-[40px] border-white/5 rounded-full" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 p-1.5 rounded-md">
                <Navigation className="text-white" size={16} fill="currentColor" />
              </div>
              <span className="font-black uppercase tracking-tighter">CabBook</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-500">
              <Link to="#" className="hover:text-slate-900">Privacy</Link>
              <Link to="#" className="hover:text-slate-900">Terms</Link>
              <Link to="#" className="hover:text-slate-900">Support</Link>
            </div>
          </div>
          <p className="text-center text-slate-400 text-xs">
            © {new Date().getFullYear()} CabBook Technologies Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}