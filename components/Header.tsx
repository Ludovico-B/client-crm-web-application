'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCircle2, Circle, Clock, AlertCircle, Sparkles, X, ChevronRight } from 'lucide-react'
import { Todo } from '../lib/types'

type HeaderProps = {
  query: string
  setQuery: (q: string) => void
  setMobileNav: (v: boolean) => void
  todos: Todo[]
  onToggleTodo: (id: number) => void
  onOpenClientByName?: (clientName: string) => void
}

export function Header({
  query,
  setQuery,
  setMobileNav,
  todos = [],
  onToggleTodo,
  onOpenClientByName
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Priorità del giorno: compiti con scadenza 'Oggi' o contrassegnati come prioritari
  const todayPriorities = todos.filter(
    (t) => t.due?.toLowerCase() === 'oggi' || t.priority
  )
  const pendingCount = todayPriorities.filter((t) => !t.done).length

  // Chiudi cliccando fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e6e9ee] bg-[#f7f8fa]/95 px-5 backdrop-blur-md sm:px-8 lg:px-12">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-1 text-slate-600 hover:text-slate-900"
          onClick={() => setMobileNav(true)}
          aria-label="Apri menu"
        >
          <span className="sr-only">Apri menu</span>
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="relative hidden w-[290px] sm:block">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca attività..."
            className="h-10 w-full rounded-[10px] border border-[#e0e5eb] bg-white pl-4 pr-3 text-[12px] outline-none placeholder:text-slate-400 focus:border-[#90a8bd]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative sm:hidden">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca..."
            aria-label="Cerca attività"
            className="h-10 w-[150px] rounded-[10px] border border-[#e0e5eb] bg-white pl-3 pr-2 text-[12px] outline-none placeholder:text-slate-400 focus:border-[#90a8bd]"
          />
        </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative rounded-xl p-2.5 transition-all duration-200 ${
            isOpen
              ? 'bg-white shadow-sm ring-1 ring-slate-200 text-[#1e2b3a]'
              : 'text-slate-500 hover:bg-white hover:text-slate-800'
          }`}
          aria-label="Notifiche priorità del giorno"
          aria-expanded={isOpen}
        >
          <Bell className="size-[19px]" />
          {pendingCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b76d58] px-1 text-[10px] font-semibold text-white shadow-sm ring-2 ring-[#f7f8fa]">
              {pendingCount}
            </span>
          ) : (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-emerald-500" />
          )}
        </button>

        {/* Dropdown Notifiche: Priorità del Giorno */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] rounded-2xl border border-[#e2e7ec] bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#b76d58]/10 text-[#b76d58]">
                  <AlertCircle className="size-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1e2b3a]">Priorità del Giorno</h3>
                  <p className="text-[11px] text-slate-500">
                    {pendingCount === 0
                      ? 'Nessuna attività pendente per oggi'
                      : `${pendingCount} ${pendingCount === 1 ? 'attività urgente' : 'attività urgenti'} da completare`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1">
              {todayPriorities.length === 0 ? (
                <div className="py-8 text-center">
                  <Sparkles className="mx-auto size-8 text-emerald-400" />
                  <p className="mt-2 text-[13px] font-medium text-slate-700">Tutto tranquillo per oggi!</p>
                  <p className="text-[11px] text-slate-400">Non ci sono scadenze o priorità fissate per la giornata.</p>
                </div>
              ) : (
                todayPriorities.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative flex items-start gap-3 rounded-xl border p-3 transition-all ${
                      item.done
                        ? 'border-slate-100 bg-slate-50/60 opacity-60'
                        : 'border-[#edf1f5] bg-[#fbfcfd] hover:border-[#ccd7e2] hover:bg-white hover:shadow-xs'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTodo(item.id)}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-[#b76d58] transition-colors"
                      title={item.done ? 'Riapri attività' : 'Segna come fatta'}
                    >
                      {item.done ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <Circle className="size-4 text-slate-400 group-hover:text-[#b76d58]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[12.5px] font-medium leading-snug ${
                          item.done ? 'line-through text-slate-400' : 'text-[#1e2b3a]'
                        }`}
                      >
                        {item.text}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        {item.client && (
                          <button
                            onClick={() => {
                              if (onOpenClientByName) {
                                onOpenClientByName(item.client)
                                setIsOpen(false)
                              }
                            }}
                            className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600 hover:bg-[#38645e]/10 hover:text-[#38645e] transition-colors"
                          >
                            <span>{item.client}</span>
                            <ChevronRight className="size-3" />
                          </button>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${
                            item.due?.toLowerCase() === 'oggi'
                              ? 'bg-[#b76d58]/10 text-[#b76d58]'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <Clock className="size-2.5" />
                          {item.due || 'Priorità'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {todayPriorities.length > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-2.5 text-center">
                <span className="text-[11px] text-slate-400">
                  {todayPriorities.filter((t) => t.done).length} di {todayPriorities.length} completate
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </header>
  )
}

