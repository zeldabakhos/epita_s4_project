// AppShell.jsx
export default function AppShell({ children }) {
    return (
      <div className="min-h-screen bg-pastel-gradient text-ink">
        <Header />
        <main className="container max-w-5xl py-8">{children}</main>
        <Footer />
      </div>
    );
  }
  
  // Header
  function Header(){
    return (
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-line">
        <div className="container max-w-5xl flex items-center justify-between py-3">
          <a className="font-extrabold text-lg tracking-tight">
             <span className="text-brand-accent">Onco</span>Buddy
          </a>
          <nav className="flex items-center gap-2">
            <a className="px-3 py-2 rounded-xl text-sm text-muted hover:bg-pastel-violet">Mood Check</a>
            <a className="px-3 py-2 rounded-xl text-sm text-muted hover:bg-pastel-violet">Resources</a>
            <a className="px-3 py-2 rounded-xl text-sm text-muted hover:bg-pastel-violet">About</a>
            <button className="ml-2 rounded-2xl bg-brand-primary text-white px-4 py-2 text-sm shadow-floaty hover:shadow-lg active:scale-[0.99]">
              Logout
            </button>
          </nav>
        </div>
      </header>
    );
  }
  
  // Footer (matches navbar access rules you set)
  function Footer(){
    return (
      <footer className="mt-16 border-t border-line bg-white/60 backdrop-blur">
        <div className="container max-w-5xl py-8 grid gap-6 md:grid-cols-3">
          <div>
            <div className="font-extrabold">OncoBuddy</div>
            <p className="text-sm text-muted mt-2">your gentle check-in companion.</p>
          </div>
          <div className="flex flex-col gap-2">
            <a className="text-sm text-muted hover:text-ink">Home</a>
            <a className="text-sm text-muted hover:text-ink">Login</a>
            <a className="text-sm text-muted hover:text-ink">Sign up</a>
          </div>
          <div className="flex items-start md:justify-end">
            <span className="text-sm text-muted">© {new Date().getFullYear()} OncoBuddy</span>
          </div>
        </div>
      </footer>
    );
  }
  