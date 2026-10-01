import { useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, ClipboardList, Plus, Users, StickyNote, ChevronDown, Paperclip, Mail, MoreHorizontal, Check, Trash2 } from 'lucide-react'
import { Appointment, Client, DocumentItem, Todo } from '../lib/types'
import { Avatar, StatCard, TodoRow, AppointmentMini, Info, DocumentRow } from './Shared'

// ---------- helpers ----------

function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseISODate(iso: string) {
  return new Date(`${iso}T00:00:00`)
}

function startOfWeekMonday(d: Date) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  const dow = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - dow)
  return copy
}

function addDays(d: Date, n: number) {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

function getMonthCells(cursor: Date) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const start = startOfWeekMonday(first)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

function getWeekDays(cursor: Date) {
  const start = startOfWeekMonday(cursor)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

function capitalize(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function endTime(time: string, duration: number) {
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return ''
  const total = h * 60 + m + duration
  const eh = Math.floor(total / 60) % 24
  const em = total % 60
  return `${`${eh}`.padStart(2, '0')}:${`${em}`.padStart(2, '0')}`
}

function lastMeetingLabel(clientName: string, appointments: Appointment[]) {
  const mine = appointments.filter((a) => a.client === clientName).sort((a, b) => b.date.localeCompare(a.date))
  if (mine.length === 0) return 'Nessun incontro'
  const d = parseISODate(mine[0].date)
  return `Ultimo incontro: ${d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

function badgeDate(iso: string) {
  const d = parseISODate(iso)
  return {
    day: `${d.getDate()}`,
    month: d.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '').toUpperCase(),
  }
}

const inputCls = 'h-9 w-full rounded-lg border border-[#e0e5eb] bg-[#fafbfc] px-3 text-[12px] outline-none focus:border-[#90a8bd]'
const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400'

// ---------- HOME ----------

export function HomeView({ todos, appointments, clients, onToggle, onAddTodo, onOpenProfile, onClients, onGoCalendar }: {
  todos: Todo[]
  appointments: Appointment[]
  clients: Client[]
  onToggle: (id: number) => void
  onAddTodo: (text: string, client: string, due: string, priority: boolean) => void
  onOpenProfile: (client: Client) => void
  onClients: () => void
  onGoCalendar: () => void
}) {
  const pending = todos.filter((todo) => !todo.done)
  const now = new Date()
  const rawToday = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const todayLabel = rawToday.charAt(0).toUpperCase() + rawToday.slice(1)
  const hour = now.getHours()
  const greeting = hour < 6 ? 'Buonanotte' : hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  const todayISO = toISODate(now)
  const inAWeek = toISODate(addDays(now, 7))
  const upcoming = useMemo(() => [...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).filter((a) => a.date >= todayISO), [appointments, todayISO])
  const weekCount = upcoming.filter((a) => a.date <= inAWeek).length
  const nextTwo = upcoming.slice(0, 2)

  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const [client, setClient] = useState(clients[0]?.name ?? '')
  const [due, setDue] = useState('Oggi')
  const [priority, setPriority] = useState(false)

  const submitTodo = () => {
    if (!text.trim()) return
    onAddTodo(text.trim(), client || clients[0]?.name || '', due.trim() || 'Oggi', priority)
    setText(''); setDue('Oggi'); setPriority(false); setShowForm(false)
  }

  const clientFor = (name: string) => clients.find((c) => c.name === name) ?? clients[0]

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7890a7]">{todayLabel}</p>
          <h1 className="text-[30px] font-semibold tracking-[-0.045em] text-[#1e2b3a] sm:text-[34px]">{greeting}, Andrea</h1>
          <p className="mt-2 text-[13px] text-slate-500">Ecco cosa richiede la tua attenzione oggi.</p>
        </div>
        <button onClick={onClients} className="flex h-10 items-center justify-center gap-2 rounded-[9px] border border-[#dce2e8] bg-white px-4 text-[12px] font-semibold text-[#526a80] shadow-sm hover:bg-slate-50"><Users className="size-4" /> Vedi tutti i clienti</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Da completare" value={pending.length} note="attività aperte" icon={<ClipboardList className="size-4" />} />
        <StatCard label="Appuntamenti" value={weekCount} note="nei prossimi 7 giorni" icon={<CalendarDays className="size-4" />} />
        <StatCard label="Clienti attivi" value={clients.length} note="nel gestionale" icon={<Users className="size-4" />} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><h2 className="text-[15px] font-semibold">Le tue attività</h2><p className="mt-1 text-[12px] text-slate-400">Tutto ciò che hai da ricordare, in un unico posto.</p></div>
            <button onClick={() => setShowForm((v) => !v)} className="flex size-8 items-center justify-center rounded-lg border border-[#e1e6eb] text-slate-500 hover:bg-slate-50" aria-label="Aggiungi attività"><Plus className="size-4" /></button>
          </div>
          {showForm && (
            <div className="mb-4 rounded-[10px] border border-[#e1e6eb] bg-[#f7f9fb] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className={labelCls}>Attività</label><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitTodo() }} placeholder="Es. Inviare il riepilogo..." className={inputCls} /></div>
                <div><label className={labelCls}>Cliente</label>
                  <select value={client} onChange={(e) => setClient(e.target.value)} className={inputCls}>
                    {clients.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Scadenza</label><input value={due} onChange={(e) => setDue(e.target.value)} placeholder="Oggi" className={inputCls} /></div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-[12px] text-slate-600"><input type="checkbox" checked={priority} onChange={(e) => setPriority(e.target.checked)} className="size-4 accent-[#b76d58]" /> Priorità</label>
                <div className="flex gap-2">
                  <button onClick={() => setShowForm(false)} className="h-8 rounded-lg px-3 text-[12px] font-semibold text-slate-500 hover:bg-slate-100">Annulla</button>
                  <button onClick={submitTodo} className="h-8 rounded-lg bg-[#203b55] px-4 text-[12px] font-semibold text-white">Aggiungi</button>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col">
            {todos.length === 0 && <p className="py-6 text-center text-[12px] text-slate-400">Nessuna attività. Aggiungine una con il +.</p>}
            {todos.map((todo) => <TodoRow key={todo.id} todo={todo} onToggle={onToggle} onOpenProfile={onOpenProfile} />)}
          </div>
        </section>

        <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div><h2 className="text-[15px] font-semibold">Prossimi appuntamenti</h2><p className="mt-1 text-[12px] text-slate-400">I tuoi prossimi incontri.</p></div>
            <button onClick={onGoCalendar} className="text-[11px] font-semibold text-[#5b7890] hover:underline">Vedi calendario</button>
          </div>
          <div className="flex flex-col gap-5">
            {nextTwo.length === 0 && <p className="py-4 text-center text-[12px] text-slate-400">Nessun appuntamento futuro.</p>}
            {nextTwo.map((a) => {
              const b = badgeDate(a.date)
              const c = clientFor(a.client)
              if (!c) return null
              return <AppointmentMini key={a.id} date={b.day} month={b.month} title={a.title} client={a.client} time={`${a.time} – ${endTime(a.time, a.duration)}`} clientData={c} onOpen={() => onOpenProfile(c)} />
            })}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-[#f5f8fb] px-3 py-3 text-[11px] text-slate-500"><Clock3 className="size-4 text-[#7890a7]" /> Hai {weekCount} appuntament{weekCount === 1 ? 'o' : 'i'} questa settimana</div>
        </section>
      </div>
    </div>
  )
}

// ---------- CLIENTS ----------

export function ClientsView({ clients, appointments, onOpenProfile, onAddClient, onDeleteClient }: {
  clients: Client[]
  appointments: Appointment[]
  onOpenProfile: (client: Client) => void
  onAddClient: (input: { name: string; role: string; email: string; phone: string; location: string; age: number }) => void
  onDeleteClient: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [age, setAge] = useState('')

  const filtered = clients.filter((c) => `${c.name} ${c.role} ${c.email}`.toLowerCase().includes(filter.toLowerCase()))

  const submit = () => {
    if (!name.trim()) return
    onAddClient({ name, role, email, phone, location, age: parseInt(age, 10) || 30 })
    setName(''); setRole(''); setEmail(''); setPhone(''); setLocation(''); setAge(''); setShowForm(false)
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7890a7]">Workspace</p><h1 className="text-[32px] font-semibold tracking-[-0.045em]">Clienti</h1><p className="mt-2 text-[13px] text-slate-500">Gestisci e ritrova velocemente tutte le tue relazioni.</p></div>
        <button onClick={() => setShowForm((v) => !v)} className="flex h-10 items-center gap-2 rounded-[9px] bg-[#203b55] px-4 text-[12px] font-semibold text-white shadow-sm hover:bg-[#2c4d6e]"><Plus className="size-4" /> Nuovo cliente</button>
      </div>

      {showForm && (
        <section className="mb-6 rounded-[14px] border border-[#e1e6eb] bg-white p-5 sm:p-6">
          <h2 className="text-[14px] font-semibold">Nuovo cliente</h2>
          <p className="mt-1 text-[12px] text-slate-400">Compila i campi e salva. Solo il nome è obbligatorio.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><label className={labelCls}>Nome e cognome *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Mario Verdi" className={inputCls} /></div>
            <div><label className={labelCls}>Professione</label><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Es. Consulente" className={inputCls} /></div>
            <div><label className={labelCls}>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@email.it" className={inputCls} /></div>
            <div><label className={labelCls}>Telefono</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+39 ..." className={inputCls} /></div>
            <div><label className={labelCls}>Località</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Milano, IT" className={inputCls} /></div>
            <div><label className={labelCls}>Età</label><input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" placeholder="30" className={inputCls} /></div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="h-9 rounded-lg px-4 text-[12px] font-semibold text-slate-500 hover:bg-slate-100">Annulla</button>
            <button onClick={submit} disabled={!name.trim()} className="h-9 rounded-lg bg-[#203b55] px-4 text-[12px] font-semibold text-white disabled:opacity-40">Salva cliente</button>
          </div>
        </section>
      )}

      <div className="mb-4">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtra per nome, ruolo, email..." className="h-10 w-full rounded-[10px] border border-[#e0e5eb] bg-white px-4 text-[12px] outline-none placeholder:text-slate-400 focus:border-[#90a8bd] sm:max-w-[320px]" />
      </div>

      {filtered.length === 0 && <p className="rounded-[14px] border border-[#e1e6eb] bg-white p-8 text-center text-[13px] text-slate-400">Nessun cliente trovato.</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((client) => (
          <div key={client.id} className="relative rounded-[14px] border border-[#e1e6eb] bg-white p-5 text-left transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <button onClick={() => onOpenProfile(client)} className="flex items-center gap-3 text-left">
                <Avatar client={client} />
                <span><span className="block text-[14px] font-semibold">{client.name}</span><span className="mt-1 block text-[11px] text-slate-400">{client.role}</span></span>
              </button>
              <div className="relative">
                <button onClick={() => { setMenuId(menuId === client.id ? null : client.id); setConfirmId(null) }} className="rounded-md p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500" aria-label="Opzioni cliente"><MoreHorizontal className="size-4" /></button>
                {menuId === client.id && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl border border-[#e2e7ec] bg-white p-1.5 shadow-lg">
                    {confirmId === client.id ? (
                      <div className="p-1.5">
                        <p className="text-[11px] font-medium text-slate-600">Eliminare {client.name}?</p>
                        <div className="mt-2 flex gap-1.5">
                          <button onClick={() => { onDeleteClient(client.id); setMenuId(null); setConfirmId(null) }} className="h-7 flex-1 rounded-md bg-red-600 text-[11px] font-semibold text-white">Sì</button>
                          <button onClick={() => setConfirmId(null)} className="h-7 flex-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">No</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => { onOpenProfile(client); setMenuId(null) }} className="flex h-8 w-full items-center rounded-lg px-2.5 text-[12px] text-slate-600 hover:bg-slate-100">Apri scheda</button>
                        <button onClick={() => setConfirmId(client.id)} className="flex h-8 w-full items-center rounded-lg px-2.5 text-[12px] text-red-600 hover:bg-red-50">Elimina</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => onOpenProfile(client)} className="mt-6 flex w-full flex-col gap-2 border-t border-[#edf0f3] pt-4 text-left text-[11px] text-slate-500">
              <span className="flex items-center gap-2"><Mail className="size-3.5 text-slate-400" />{client.email}</span>
              <span className="flex items-center gap-2"><CalendarDays className="size-3.5 text-slate-400" />{lastMeetingLabel(client.name, appointments)}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- PROFILE ----------

export function ProfileView({ client, todos, appointments, documents, onBack, onToggle, newNote, setNewNote, addNote, notes, onDeleteClient, onDuplicateClient, onAddAppointment, onAddDocument, onDeleteDocument }: {
  client: Client
  todos: Todo[]
  appointments: Appointment[]
  documents: DocumentItem[]
  onBack: () => void
  onToggle: (id: number) => void
  newNote: string
  setNewNote: (value: string) => void
  addNote: () => void
  notes: string[]
  onDeleteClient: (id: string) => void
  onDuplicateClient: (client: Client) => void
  onAddAppointment: (input: { title: string; client: string; date: string; time: string; duration: number; detail?: string }) => void
  onAddDocument: (name: string, client: string) => void
  onDeleteDocument: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(0)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showApptForm, setShowApptForm] = useState(false)
  const [apptTitle, setApptTitle] = useState('')
  const [apptDate, setApptDate] = useState(() => toISODate(new Date()))
  const [apptTime, setApptTime] = useState('10:00')
  const [showDocForm, setShowDocForm] = useState(false)
  const [docName, setDocName] = useState('')
  const noteRef = useRef<HTMLInputElement>(null)

  const firstName = client.name.split(' ')[0]
  const sortedAppts = useMemo(() => [...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)), [appointments])

  const submitAppt = () => {
    if (!apptTitle.trim() || !apptDate || !apptTime) return
    onAddAppointment({ title: apptTitle.trim(), client: client.name, date: apptDate, time: apptTime, duration: 60 })
    setApptTitle(''); setShowApptForm(false)
  }

  const submitDoc = () => {
    if (!docName.trim()) return
    onAddDocument(docName.trim(), client.name)
    setDocName(''); setShowDocForm(false)
  }

  return (
    <div className="animate-in fade-in duration-300">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-[12px] font-medium text-[#71879a] hover:text-[#3f5d73]"><ChevronLeft className="size-4" /> Torna ai clienti</button>

      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#e2e7ec] pb-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4"><Avatar client={client} /><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9baa]">Scheda cliente</p><h1 className="text-[28px] font-semibold tracking-[-0.04em]">{client.name}</h1><p className="mt-1 text-[12px] text-slate-500">{client.role} · Cliente dal 2019</p></div></div>
        <div className="relative">
          <button onClick={() => { setActionsOpen((v) => !v); setConfirmDelete(false) }} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-[#dce2e8] bg-white px-3 text-[12px] font-semibold text-[#526a80]"><MoreHorizontal className="size-4" /> Azioni</button>
          {actionsOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-[#e2e7ec] bg-white p-1.5 shadow-lg">
              {confirmDelete ? (
                <div className="p-1.5">
                  <p className="text-[11px] font-medium text-slate-600">Eliminare {client.name}?</p>
                  <div className="mt-2 flex gap-1.5">
                    <button onClick={() => { onDeleteClient(client.id); onBack() }} className="h-7 flex-1 rounded-md bg-red-600 text-[11px] font-semibold text-white">Sì</button>
                    <button onClick={() => setConfirmDelete(false)} className="h-7 flex-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">No</button>
                  </div>
                </div>
              ) : (
                <>
                  <button onClick={() => { onDuplicateClient(client); setActionsOpen(false) }} className="flex h-8 w-full items-center rounded-lg px-2.5 text-[12px] text-slate-600 hover:bg-slate-100">Duplica cliente</button>
                  <button onClick={() => setConfirmDelete(true)} className="flex h-8 w-full items-center rounded-lg px-2.5 text-[12px] text-red-600 hover:bg-red-50">Elimina cliente</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.45fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-5">
            <h2 className="mb-4 text-[14px] font-semibold">Informazioni personali</h2>
            <div className="grid grid-cols-2 gap-y-4"><Info label="Età" value={`${client.age} anni`} /><Info label="Professione" value={client.role} /><Info label="Email" value={client.email} /><Info label="Telefono" value={client.phone} /><Info label="Località" value={client.location} /><Info label="Cliente dal" value="2019" /></div>
          </section>

          <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-[14px] font-semibold">Appunti e cose da fare</h2><button onClick={() => noteRef.current?.focus()} className="flex size-7 items-center justify-center rounded-md border border-[#e1e6eb] text-slate-500 hover:bg-slate-50" aria-label="Scrivi appunto"><Plus className="size-3.5" /></button></div>
            <div className="mb-4 flex gap-2">
              <input ref={noteRef} value={newNote} onChange={(event) => setNewNote(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addNote() }} placeholder="Scrivi un appunto veloce..." className="h-9 min-w-0 flex-1 rounded-lg border border-[#e0e5eb] bg-[#fafbfc] px-3 text-[11px] outline-none focus:border-[#90a8bd]" />
              <button onClick={addNote} className="rounded-lg bg-[#203b55] px-3 text-[11px] font-semibold text-white">Salva</button>
            </div>
            <div className="flex flex-col gap-1">
              {notes.map((note, index) => <div key={`${note}-${index}`} className="flex gap-2.5 rounded-lg bg-[#f7f9fb] px-3 py-2.5 text-[11px] text-slate-600"><StickyNote className="mt-0.5 size-3.5 shrink-0 text-[#88a0b2]" />{note}</div>)}
              {todos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-2.5 py-2 text-[11px] text-slate-600">
                  <button onClick={() => onToggle(todo.id)} className={`flex size-4 items-center justify-center rounded-full border ${todo.done ? 'border-[#729890] bg-[#729890] text-white' : 'border-[#c6d0d9]'}`}>{todo.done && <Check className="size-2.5" />}</button>
                  <span className={todo.done ? 'text-slate-400 line-through' : ''}>{todo.text}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <div><h2 className="text-[14px] font-semibold">Schedario appuntamenti</h2><p className="mt-1 text-[11px] text-slate-400">Lo storico degli incontri con {firstName}.</p></div>
              <button onClick={() => setShowApptForm((v) => !v)} className="flex size-7 items-center justify-center rounded-md border border-[#e1e6eb] text-slate-500 hover:bg-slate-50" aria-label="Nuovo appuntamento"><Plus className="size-3.5" /></button>
            </div>
            {showApptForm && (
              <div className="mb-4 rounded-[10px] border border-[#e1e6eb] bg-[#f7f9fb] p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="sm:col-span-2"><input value={apptTitle} onChange={(e) => setApptTitle(e.target.value)} placeholder="Titolo appuntamento" className={inputCls} /></div>
                  <input type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} className={inputCls} />
                  <input type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} className={inputCls} />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <button onClick={() => setShowApptForm(false)} className="h-8 rounded-lg px-3 text-[11px] font-semibold text-slate-500 hover:bg-slate-100">Annulla</button>
                  <button onClick={submitAppt} className="h-8 rounded-lg bg-[#203b55] px-3 text-[11px] font-semibold text-white">Salva</button>
                </div>
              </div>
            )}
            {sortedAppts.length === 0 && <p className="py-4 text-center text-[11px] text-slate-400">Nessun appuntamento con {firstName}. Aggiungine uno con il +.</p>}
            <div className="relative ml-2 border-l border-[#dce4e9]">
              {sortedAppts.map((appointment, index) => (
                <div key={appointment.id} className="relative pb-6 pl-6 last:pb-1">
                  <span className="absolute -left-[5px] top-1 size-[9px] rounded-full border-2 border-white bg-[#7894a8] ring-1 ring-[#cdd9e1]" />
                  <button onClick={() => setExpanded(expanded === index ? -1 : index)} className="flex w-full items-start justify-between text-left">
                    <div><p className="text-[10px] font-bold tracking-[0.14em] text-[#88a0b0]">{parseISODate(appointment.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })} · {appointment.time}</p><p className="mt-1 text-[13px] font-semibold text-[#3d5060]">{appointment.title}</p></div>
                    <ChevronDown className={`mt-1 size-4 text-slate-400 transition-transform ${expanded === index ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded === index && <p className="mt-3 rounded-lg bg-[#f7f9fb] px-3 py-3 text-[11px] leading-relaxed text-slate-500">{appointment.detail}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <div><h2 className="text-[14px] font-semibold">Cartella appunti e note</h2><p className="mt-1 text-[11px] text-slate-400">Documenti e materiali condivisi.</p></div>
              <button onClick={() => setShowDocForm((v) => !v)} className="flex size-7 items-center justify-center rounded-md border border-[#e1e6eb] text-slate-500 hover:bg-slate-50" aria-label="Allega documento"><Paperclip className="size-3.5" /></button>
            </div>
            {showDocForm && (
              <div className="mb-3 flex gap-2">
                <input value={docName} onChange={(e) => setDocName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitDoc() }} placeholder="Nome file (es. contratto.pdf)" className={inputCls} />
                <button onClick={submitDoc} className="shrink-0 rounded-lg bg-[#203b55] px-3 text-[11px] font-semibold text-white">Aggiungi</button>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {documents.length === 0 && <p className="py-3 text-center text-[11px] text-slate-400">Nessun documento per {firstName}.</p>}
              {documents.map((d) => <DocumentRow key={d.id} name={d.name} meta={d.meta} onDelete={() => onDeleteDocument(d.id)} />)}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// ---------- CALENDAR ----------

type CalendarMode = 'mese' | 'settimana' | 'lista'

export function CalendarView({ clients, appointments, onOpenProfile, onAddAppointment }: {
  clients: Client[]
  appointments: Appointment[]
  onOpenProfile: (client: Client) => void
  onAddAppointment: (input: { title: string; client: string; date: string; time: string; duration: number; detail?: string }) => void
}) {
  const [mode, setMode] = useState<CalendarMode>('mese')
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(() => toISODate(new Date()))
  const todayISO = toISODate(new Date())

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState(clients[0]?.name ?? '')
  const [date, setDate] = useState(() => toISODate(new Date()))
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState('60')

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const a of appointments) {
      const list = map.get(a.date) ?? []
      list.push(a)
      map.set(a.date, list)
    }
    for (const list of map.values()) list.sort((x, y) => x.time.localeCompare(y.time))
    return map
  }, [appointments])

  const sortedAll = useMemo(() => [...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)), [appointments])

  const monthCells = useMemo(() => getMonthCells(cursor), [cursor])
  const weekDays = useMemo(() => getWeekDays(cursor), [cursor])

  const monthLabel = capitalize(cursor.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }))
  const weekLabel = (() => {
    const s = weekDays[0]
    const e = weekDays[6]
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    return `${capitalize(s.toLocaleDateString('it-IT', opts))} – ${capitalize(e.toLocaleDateString('it-IT', { ...opts, year: 'numeric' }))}`
  })()

  const goPrev = () => setCursor((c) => mode === 'settimana' ? addDays(c, -7) : new Date(c.getFullYear(), c.getMonth() - 1, 1))
  const goNext = () => setCursor((c) => mode === 'settimana' ? addDays(c, 7) : new Date(c.getFullYear(), c.getMonth() + 1, 1))
  const goToday = () => { const n = new Date(); setCursor(n); setSelectedDay(toISODate(n)) }

  const clientFor = (name: string) => clients.find((c) => c.name === name) ?? clients[0]
  const selectedAppointments = byDate.get(selectedDay) ?? []
  const selectedLabel = capitalize(parseISODate(selectedDay).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }))

  const submit = () => {
    if (!title.trim() || !date || !time) return
    onAddAppointment({ title: title.trim(), client: clientName || clients[0]?.name || '', date, time, duration: parseInt(duration, 10) || 60 })
    setTitle(''); setShowForm(false)
  }

  const modes: { id: CalendarMode; label: string }[] = [{ id: 'mese', label: 'Mese' }, { id: 'settimana', label: 'Settimana' }, { id: 'lista', label: 'Lista' }]

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7890a7]">Workspace</p>
          <h1 className="text-[32px] font-semibold tracking-[-0.045em]">Calendario</h1>
          <p className="mt-2 text-[13px] text-slate-500">I tuoi appuntamenti futuri e passati.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowForm((v) => !v)} className="flex h-10 items-center gap-2 rounded-[9px] bg-[#203b55] px-4 text-[12px] font-semibold text-white shadow-sm hover:bg-[#2c4d6e]"><Plus className="size-4" /> Nuovo appuntamento</button>
          <div className="flex h-10 w-fit items-center gap-1 rounded-[10px] border border-[#dce2e8] bg-white p-1 shadow-sm">
            {modes.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} className={`h-8 rounded-lg px-3 text-[12px] font-semibold transition-colors ${mode === m.id ? 'bg-[#203b55] text-white' : 'text-[#526a80] hover:bg-slate-100'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <section className="mb-4 rounded-[14px] border border-[#e1e6eb] bg-white p-5">
          <h2 className="text-[14px] font-semibold">Nuovo appuntamento</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className={labelCls}>Titolo *</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Follow-up progetto" className={inputCls} /></div>
            <div><label className={labelCls}>Cliente</label>
              <select value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputCls}>
                {clients.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Durata</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls}>
                <option value="30">30 minuti</option>
                <option value="60">1 ora</option>
                <option value="90">1 ora e mezza</option>
                <option value="120">2 ore</option>
              </select>
            </div>
            <div><label className={labelCls}>Data *</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Ora *</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} /></div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="h-9 rounded-lg px-4 text-[12px] font-semibold text-slate-500 hover:bg-slate-100">Annulla</button>
            <button onClick={submit} disabled={!title.trim()} className="h-9 rounded-lg bg-[#203b55] px-4 text-[12px] font-semibold text-white disabled:opacity-40">Salva appuntamento</button>
          </div>
        </section>
      )}

      {mode !== 'lista' && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[14px] font-semibold text-[#1e2b3a]">{mode === 'mese' ? monthLabel : weekLabel}</p>
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="flex size-8 items-center justify-center rounded-lg border border-[#dce2e8] bg-white text-slate-500 shadow-sm hover:bg-slate-50" aria-label="Precedente"><ChevronLeft className="size-4" /></button>
            <button onClick={goToday} className="h-8 rounded-lg border border-[#dce2e8] bg-white px-3 text-[12px] font-semibold text-[#526a80] shadow-sm hover:bg-slate-50">Oggi</button>
            <button onClick={goNext} className="flex size-8 items-center justify-center rounded-lg border border-[#dce2e8] bg-white text-slate-500 shadow-sm hover:bg-slate-50" aria-label="Successivo"><ChevronRight className="size-4" /></button>
          </div>
        </div>
      )}

      {mode === 'mese' && (
        <>
          <section className="overflow-hidden rounded-[14px] border border-[#e1e6eb] bg-white">
            <div className="grid grid-cols-7 border-b border-[#edf0f3] bg-[#f7f9fb]">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
                <p key={d} className="px-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-[#8a9baa]">{d}</p>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthCells.map((d) => {
                const iso = toISODate(d)
                const isOutside = d.getMonth() !== cursor.getMonth()
                const isToday = iso === todayISO
                const isSelected = iso === selectedDay
                const items = byDate.get(iso) ?? []
                return (
                  <button
                    key={iso}
                    onClick={() => { setSelectedDay(iso); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)) }}
                    className={`flex min-h-[64px] flex-col items-start gap-1 border-b border-r border-[#f0f3f6] p-1.5 text-left transition-colors last:border-b-0 hover:bg-slate-50 sm:min-h-[92px] sm:p-2 [&:nth-last-child(-n+7)]:border-b-0 ${isOutside ? 'bg-slate-50/50' : 'bg-white'} ${isSelected ? 'bg-[#eef4f1]' : ''}`}
                  >
                    <span className={`flex size-6 items-center justify-center rounded-full text-[11px] font-semibold sm:text-[12px] ${isToday ? 'bg-[#203b55] text-white' : isOutside ? 'text-slate-300' : 'text-[#40586c]'}`}>
                      {d.getDate()}
                    </span>
                    <span className="hidden w-full flex-col gap-1 sm:flex">
                      {items.slice(0, 2).map((a) => (
                        <span key={a.id} className="truncate rounded-md bg-[#f1f5f8] px-1.5 py-0.5 text-[10px] font-medium text-[#40586c]">{a.time} {a.title}</span>
                      ))}
                      {items.length > 2 && <span className="px-1 text-[10px] font-semibold text-[#7890a7]">+{items.length - 2} altri</span>}
                    </span>
                    <span className="flex w-full justify-center gap-1 sm:hidden">
                      {items.slice(0, 3).map((a) => (
                        <span key={a.id} className="size-1.5 rounded-full bg-[#38645e]" />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
          <section className="mt-4 rounded-[14px] border border-[#e1e6eb] bg-white p-5 sm:p-6">
            <h2 className="text-[14px] font-semibold text-[#1e2b3a]">{selectedLabel}</h2>
            <p className="mt-1 text-[12px] text-slate-400">{selectedAppointments.length === 0 ? 'Nessun appuntamento in questo giorno.' : `${selectedAppointments.length} appuntamento${selectedAppointments.length > 1 ? 'i' : ''}`}</p>
            <div className="mt-4 flex flex-col gap-4">
              {selectedAppointments.map((a) => {
                const b = badgeDate(a.date)
                const c = clientFor(a.client)
                if (!c) return null
                return (
                  <AppointmentMini
                    key={a.id}
                    date={b.day}
                    month={b.month}
                    title={a.title}
                    client={a.client}
                    time={`${a.time} – ${endTime(a.time, a.duration)}`}
                    clientData={c}
                    onOpen={() => onOpenProfile(c)}
                  />
                )
              })}
            </div>
          </section>
        </>
      )}

      {mode === 'settimana' && (
        <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-4 sm:p-5">
          <div className="grid grid-flow-col auto-cols-[minmax(200px,1fr)] gap-3 overflow-x-auto pb-1 lg:grid-flow-row lg:grid-cols-7 lg:overflow-visible">
            {weekDays.map((d) => {
              const iso = toISODate(d)
              const items = byDate.get(iso) ?? []
              const isToday = iso === todayISO
              return (
                <div key={iso} className={`flex min-h-[160px] flex-col rounded-[10px] border p-3 ${isToday ? 'border-[#203b55] bg-[#f4f7f9]' : 'border-[#edf0f3] bg-[#fbfcfd]'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-[#203b55]' : 'text-slate-400'}`}>
                    {d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '')} {d.getDate()}
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {items.length === 0 && <p className="text-[11px] text-slate-300">—</p>}
                    {items.map((a) => (
                      <button key={a.id} onClick={() => onOpenProfile(clientFor(a.client))} className="rounded-lg bg-white p-2 text-left shadow-xs ring-1 ring-slate-200/70 hover:ring-[#90a8bd]">
                        <p className="text-[11px] font-semibold text-[#1e2b3a]">{a.title}</p>
                        <p className="mt-1 text-[10px] text-slate-500">{a.time} · {a.client}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {mode === 'lista' && (
        <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-5 sm:p-6">
          {sortedAll.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-slate-400">Nessun appuntamento.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {sortedAll.map((a) => {
                const b = badgeDate(a.date)
                const c = clientFor(a.client)
                if (!c) return null
                return (
                  <AppointmentMini
                    key={a.id}
                    date={b.day}
                    month={b.month}
                    title={a.title}
                    client={a.client}
                    time={`${a.time} – ${endTime(a.time, a.duration)}`}
                    clientData={c}
                    onOpen={() => onOpenProfile(c)}
                  />
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ---------- DOCUMENTS ----------

export function DocumentsView({ documents, clients, onAddDocument, onDeleteDocument }: {
  documents: DocumentItem[]
  clients: Client[]
  onAddDocument: (name: string, client: string) => void
  onDeleteDocument: (id: number) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState(clients[0]?.name ?? '')

  const filtered = documents.filter((d) => `${d.name} ${d.meta} ${d.client}`.toLowerCase().includes(search.toLowerCase()))

  const submit = () => {
    if (!name.trim()) return
    onAddDocument(name.trim(), clientName || clients[0]?.name || '')
    setName(''); setShowForm(false)
  }

  const download = (doc: DocumentItem) => {
    const blob = new Blob([`${doc.name}\n${doc.meta}`], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7890a7]">Gestione</p><h1 className="text-[32px] font-semibold tracking-[-0.045em]">Documenti</h1><p className="mt-2 text-[13px] text-slate-500">Archivio globale dei file.</p></div>
        <button onClick={() => setShowForm((v) => !v)} className="flex h-10 items-center gap-2 rounded-[9px] bg-[#203b55] px-4 text-[12px] font-semibold text-white shadow-sm hover:bg-[#2c4d6e]"><Plus className="size-4" /> Nuovo documento</button>
      </div>

      {showForm && (
        <section className="mb-4 rounded-[14px] border border-[#e1e6eb] bg-white p-5">
          <h2 className="text-[14px] font-semibold">Nuovo documento</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><label className={labelCls}>Nome file *</label><input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit() }} placeholder="Es. contratto.pdf" className={inputCls} /></div>
            <div><label className={labelCls}>Cliente</label>
              <select value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputCls}>
                {clients.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Oppure scegli un file</label>
              <input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) setName(f.name) }} className="text-[12px] text-slate-500" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="h-9 rounded-lg px-4 text-[12px] font-semibold text-slate-500 hover:bg-slate-100">Annulla</button>
            <button onClick={submit} disabled={!name.trim()} className="h-9 rounded-lg bg-[#203b55] px-4 text-[12px] font-semibold text-white disabled:opacity-40">Salva documento</button>
          </div>
        </section>
      )}

      <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-5 sm:p-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca documenti..." className="mb-4 h-10 w-full rounded-[10px] border border-[#e0e5eb] bg-white px-4 text-[12px] outline-none placeholder:text-slate-400 focus:border-[#90a8bd] sm:max-w-[320px]" />
        {filtered.length === 0 && <p className="py-6 text-center text-[12px] text-slate-400">Nessun documento trovato.</p>}
        <div className="flex flex-col gap-2">
          {filtered.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <button onClick={() => download(d)} className="min-w-0 flex-1 text-left" title="Scarica">
                <DocumentRow name={d.name} meta={d.meta} />
              </button>
              <button onClick={() => onDeleteDocument(d.id)} className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500" aria-label="Elimina documento"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ---------- NOTES ----------

export function NotesView({ notes, onAddNote, onDeleteNote }: {
  notes: string[]
  onAddNote: (text: string) => void
  onDeleteNote: (index: number) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')

  const submit = () => {
    if (!text.trim()) return
    onAddNote(text.trim())
    setText(''); setShowForm(false)
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7890a7]">Gestione</p><h1 className="text-[32px] font-semibold tracking-[-0.045em]">Note salvate</h1><p className="mt-2 text-[13px] text-slate-500">Tutti i tuoi appunti rapidi.</p></div>
        <button onClick={() => setShowForm((v) => !v)} className="flex h-10 items-center gap-2 rounded-[9px] bg-[#203b55] px-4 text-[12px] font-semibold text-white shadow-sm hover:bg-[#2c4d6e]"><Plus className="size-4" /> Nuova nota</button>
      </div>

      {showForm && (
        <section className="mb-4 rounded-[14px] border border-[#e1e6eb] bg-white p-5">
          <label className={labelCls}>Nuova nota</label>
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit() }} placeholder="Scrivi un appunto veloce..." className={inputCls} />
            <button onClick={submit} disabled={!text.trim()} className="shrink-0 rounded-lg bg-[#203b55] px-4 text-[12px] font-semibold text-white disabled:opacity-40">Salva</button>
          </div>
        </section>
      )}

      <section className="rounded-[14px] border border-[#e1e6eb] bg-white p-5 sm:p-6">
        {notes.length === 0 && <p className="py-6 text-center text-[12px] text-slate-400">Nessuna nota. Aggiungine una con il pulsante sopra.</p>}
        <div className="flex flex-col gap-3">
          {notes.map((note, i) => (
            <div key={`${note}-${i}`} className="flex gap-3 rounded-[10px] border border-[#edf0f3] bg-[#f7f9fb] p-4 text-[12px] text-slate-600">
              <StickyNote className="mt-0.5 size-4 shrink-0 text-[#88a0b2]" />
              <p className="min-w-0 flex-1 font-medium text-[#1e2b3a]">{note}</p>
              <button onClick={() => onDeleteNote(i)} className="flex size-7 shrink-0 items-center justify-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500" aria-label="Elimina nota"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
