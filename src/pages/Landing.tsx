import { Smartphone, WifiOff, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

export default function Landing() {
    const { setHasVisited } = useUIStore();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
            {/* Navigation Bar */}
            <header className="py-6 px-4 md:px-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <img src="/pwa-192x192.png" alt="POS Pro Logo" className="w-10 h-10 rounded-xl shadow-sm" />
                    <span className="text-2xl font-black tracking-tight text-primary">POS Pro</span>
                </div>
                <button 
                    onClick={() => setHasVisited(true)}
                    className="hidden sm:flex text-sm font-bold items-center gap-2 hover:text-primary transition-colors"
                >
                    Sign In
                    <ArrowRight size={16} />
                </button>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center text-center px-4 pt-12 md:pt-24 pb-16 max-w-5xl mx-auto w-full">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    Now Available as a Progressive Web App
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6">
                    Run your shop directly from your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">browser.</span>
                </h1>

                <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-8 font-medium leading-relaxed">
                    A lightning-fast, offline-capable Point of Sale system built for modern retailers. No expensive hardware needed.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10">
                    <button 
                        onClick={() => setHasVisited(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg md:text-xl font-bold py-4 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        Get Started for Free
                        <ArrowRight size={24} />
                    </button>
                </div>

                {/* Video / App Preview Mockup */}
                <div className="mt-20 w-full max-w-4xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
                    <div className="bg-card rounded-t-3xl border border-border border-b-0 shadow-2xl overflow-hidden aspect-video flex flex-col relative">
                        <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex-1 bg-muted/10 p-8 flex flex-col gap-4">
                            {/* Mock Dashboard Representation */}
                            <div className="flex gap-4">
                                <div className="h-32 rounded-2xl bg-primary/20 flex-1"></div>
                                <div className="h-32 rounded-2xl bg-card border border-border flex-1"></div>
                                <div className="h-32 rounded-2xl bg-card border border-border flex-1"></div>
                            </div>
                            <div className="flex gap-4 flex-1">
                                <div className="rounded-2xl bg-card border border-border flex-[2] h-full"></div>
                                <div className="rounded-2xl bg-muted/20 border border-border flex-1 h-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Feature Grid */}
            <section className="bg-muted/30 py-24 border-t border-border mt-auto">
                <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black mb-4">Everything you need to succeed</h2>
                        <p className="text-lg text-muted-foreground">Professional tools designed for maximum simplicity.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-background p-8 rounded-3xl border border-border shadow-sm hover:border-primary/50 transition-colors">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                                <WifiOff size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Offline First</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Keep selling even when the internet drops. POS Pro caches everything locally and syncs automatically.
                            </p>
                        </div>
                        
                        <div className="bg-background p-8 rounded-3xl border border-border shadow-sm hover:border-primary/50 transition-colors">
                            <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                                <Smartphone size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Installable App</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Install directly to your device desktop or home screen for a native, full-screen checkout experience.
                            </p>
                        </div>

                        <div className="bg-background p-8 rounded-3xl border border-border shadow-sm hover:border-primary/50 transition-colors">
                            <div className="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
                                <BarChart3 size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Instant Analytics</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Track your daily revenue, total active products, and exact profit margins across all inventory.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-muted-foreground border-t border-border bg-background">
                <p className="font-medium text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Free forever for small merchants.
                </p>
            </footer>
        </div>
    );
}
