import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import PageTransition from '../../../shared/components/PageTransition';

// Navbar and Footer are now in shared/components and rendered by MainLayout

const Hero = () => (
  // Added negative margin top to compensate for MainLayout padding if needed, 
  // currently MainLayout adds pt-16 (64px). 
  // Landing page hero originally had pt-32 (128px), so we keep some padding but maybe less.
  <section className="pt-16 pb-16 md:pt-32 md:pb-32 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="text-center max-w-4xl mx-auto mb-16">
        <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-6 tracking-wide">
          HEADLESS MENU MANAGEMENT
        </span>
        <h1 className="text-5xl md:text-7xl font-bold text-stone-900 dark:text-white tracking-tight mb-8 leading-tight">
          The Modern Way to <br className="hidden md:block" />
          <span className="text-orange-600">Display Your Menu.</span>
        </h1>
        <p className="text-xl text-stone-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Replace PDF menus with stunning, mobile-first digital experiences. 
          Update prices instantly, track views, and never print a QR code twice.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login?mode=signup"
            className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 btn-press"
          >
            Create Menu Free <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-stone-200 text-stone-700 hover:border-orange-500 hover:text-orange-600 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 btn-press">
            View Live Demo
          </button>
        </div>
      </div>

      {/* 3D Mockup Placeholder */}
      <div className="relative mx-auto mt-16 max-w-5xl">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-stone-900 bg-stone-800 aspect-[16/9] md:aspect-[21/9] transform md:rotate-1 hover:rotate-0 transition-all duration-700 ease-out">
            <iframe 
                src="/menu/demo-restaurant" 
                className="w-full h-full border-0"
                title="Interactive Menu Preview"
            />
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section id="features" className="py-24 bg-white dark:bg-stone-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4 tracking-tight">Everything you need to grow</h2>
        <p className="text-stone-500 dark:text-stone-400 text-lg max-w-2xl mx-auto">
          Built for speed and simplicity. No coding required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <Zap className="w-6 h-6 text-orange-600" />,
            title: "Instant Updates",
            desc: "Change prices, hide sold-out items, and update descriptions in seconds. No reprints needed."
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-orange-600" />,
            title: "QR Code Generator",
            desc: "Download high-quality QR codes for your tables. One scan connects customers to your digital menu."
          },
            {
            icon: <BarChart3 className="w-6 h-6 text-orange-600" />,
            title: "Smart Analytics",
            desc: "Track which categories are most popular and optimize your menu for higher conversion."
          }
        ].map((feature, idx) => (
          <div key={idx} className="p-8 rounded-3xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 hover:bg-white dark:hover:bg-stone-900 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">{feature.title}</h3>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const DemoSection = () => (
    <section className="py-24 bg-stone-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <span className="text-orange-500 font-bold tracking-wider text-sm uppercase mb-2 block">Live Preview</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">See it in action.</h2>
                    <p className="text-stone-400 text-lg mb-8 leading-relaxed">
                        Experience the difference between a static PDF and a dynamic MenuX Digital Menu.
                        Your customers get a seamless, app-like experience without downloading anything.
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                        {['Mobile optimized', 'Search & Filter', 'Category Navigation'].map((item, i) => (
                            <li key={i} className="flex items-center space-x-3 text-stone-300">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <Link to="/menu/demo-restaurant" className="inline-flex items-center text-orange-500 font-bold hover:text-orange-400 transition-colors">
                        Try the demo menu <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
                <div className="relative">
                     {/* Abstract representation of "Editor" vs "Customer" view */}
                     <div className="relative z-10 bg-white rounded-3xl p-2 shadow-2xl rotate-0 md:rotate-3 md:hover:rotate-0 transition-transform duration-500">
                        <div className="bg-stone-100 rounded-2xl overflow-hidden aspect-[9/16] relative border-4 border-stone-200">
                             <iframe 
                                src="/menu/demo-restaurant" 
                                className="w-full h-full border-0"
                                title="Customer View Demo"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
)


const Pricing = () => (
  <section id="pricing" className="py-24 bg-stone-50 dark:bg-stone-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4 tracking-tight">Simple, transparent pricing</h2>
        <p className="text-stone-500 dark:text-stone-400 text-lg max-w-2xl mx-auto">
          Start for free, upgrade as you grow.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Starter</h3>
            <div className="text-4xl font-bold text-stone-900 dark:text-white mb-6">$0<span className="text-lg text-stone-500 dark:text-stone-400 font-medium">/mo</span></div>
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-stone-600 dark:text-stone-300"><CheckCircle2 size={18} className="text-orange-500" /> 1 Business</li>
                <li className="flex items-center gap-3 text-stone-600 dark:text-stone-300"><CheckCircle2 size={18} className="text-orange-500" /> Unlimited Menu Items</li>
                <li className="flex items-center gap-3 text-stone-600 dark:text-stone-300"><CheckCircle2 size={18} className="text-orange-500" /> Basic QR Code</li>
            </ul>
             <Link to="/login?mode=signup" className="w-full py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-bold hover:border-orange-500 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-500 transition-colors text-center">Get Started</Link>
        </div>
        {/* Pro Plan */}
        <div className="bg-stone-900 dark:bg-stone-800 p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden ring-1 ring-stone-900/5 dark:ring-stone-700">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <div className="text-4xl font-bold text-white mb-6">$29<span className="text-lg text-stone-400 font-medium">/mo</span></div>
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-stone-300"><CheckCircle2 size={18} className="text-orange-500" /> 5 Businesses</li>
                <li className="flex items-center gap-3 text-stone-300"><CheckCircle2 size={18} className="text-orange-500" /> Advanced Analytics</li>
                <li className="flex items-center gap-3 text-stone-300"><CheckCircle2 size={18} className="text-orange-500" /> Custom Branding</li>
                <li className="flex items-center gap-3 text-stone-300"><CheckCircle2 size={18} className="text-orange-500" /> Priority Support</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">Start Free Trial</button>
        </div>
        {/* Enterprise Plan */}
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Enterprise</h3>
            <div className="text-4xl font-bold text-stone-900 dark:text-white mb-6">Custom</div>
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-stone-600 dark:text-stone-300"><CheckCircle2 size={18} className="text-stone-400" /> Unlimited Businesses</li>
                <li className="flex items-center gap-3 text-stone-600 dark:text-stone-300"><CheckCircle2 size={18} className="text-stone-400" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-3 text-stone-600 dark:text-stone-300"><CheckCircle2 size={18} className="text-stone-400" /> API Access</li>
            </ul>
             <button className="w-full py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-bold hover:border-black dark:hover:border-white transition-colors">Contact Sales</button>
        </div>
      </div>
    </div>
  </section>
);

export default function LandingPage() {
  return (
    <PageTransition>
      <Hero />
      <Features />
      <Pricing />
      <DemoSection />
    </PageTransition>
  );
}
