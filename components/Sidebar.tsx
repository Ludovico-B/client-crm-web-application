import { CalendarDays, FileText, LayoutDashboard, Sparkles, StickyNote, Users, X } from 'lucide-react'

export type ViewType = 'home' | 'clients' | 'profile' | 'calendar' | 'documents' | 'notes'

type SidebarProps = {
  view: ViewType
  setView: (v: ViewType) => void
  mobileNav: boolean
  setMobileNav: (v: boolean) => void
  pendingCount: number
}

export function Sidebar({ view, setView, mobileNav, setMobileNav, pendingCount }: SidebarProps) {
  return (
    <aside className={`${mobileNav ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-20 flex w-[258px] flex-col border-r border-[#e6e9ee] bg-white px-5 py-6 transition-transform lg:translate-x-0`}>
      <div className="mb-12 flex items-center justify-between px-2"><div className="flex items-center gap-2.5"><div className="flex size-8 items-center justify-center rounded-[10px] bg-[#203b55] text-white"><Sparkles className="size-4" /></div><span className="text-[17px] font-semibold tracking-[-0.03em]">Linea</span></div><button onClick={() => setMobileNav(false)} className="lg:hidden" aria-label="Chiudi menu"><X className="size-5 text-slate-400" /></button></div>
      <nav className="flex flex-col gap-1" aria-label="Navigazione principale">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
        <button onClick={() => { setView('home'); setMobileNav(false) }} className={`nav-item ${view === 'home' ? 'nav-active' : ''}`}><LayoutDashboard className="size-[17px]" />Homepage <span className="ml-auto rounded-full bg-[#e8eef5] px-2 py-0.5 text-[11px] font-semibold text-[#60758a]">{pendingCount}</span></button>
        <button onClick={() => { setView('clients'); setMobileNav(false) }} className={`nav-item ${view === 'clients' ? 'nav-active' : ''}`}><Users className="size-[17px]" />Clienti</button>
        <button onClick={() => { setView('calendar'); setMobileNav(false) }} className={`nav-item ${view === 'calendar' ? 'nav-active' : ''}`}><CalendarDays className="size-[17px]" />Calendario</button>
        <div className="my-5 h-px bg-[#edf0f3]" />
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Gestione</p>
        <button onClick={() => { setView('documents'); setMobileNav(false) }} className={`nav-item ${view === 'documents' ? 'nav-active' : ''}`}><FileText className="size-[17px]" />Documenti</button>
        <button onClick={() => { setView('notes'); setMobileNav(false) }} className={`nav-item ${view === 'notes' ? 'nav-active' : ''}`}><StickyNote className="size-[17px]" />Note salvate</button>
      </nav>
    </aside>
  )
}
