'use client'

import { useMemo, useState } from 'react'
import { Appointment, Client, DocumentItem, Todo } from '../lib/types'
import { appointments as initialAppointments, clients as initialClients, initialTodos } from '../lib/data'
import { Sidebar, ViewType } from '../components/Sidebar'
import { Header } from '../components/Header'
import { HomeView, ClientsView, ProfileView, CalendarView, DocumentsView, NotesView } from '../components/Views'

const AVATAR_COLORS = [
  'bg-[#dce9e7] text-[#38645e]',
  'bg-[#e8e3f1] text-[#65547f]',
  'bg-[#f2e3d8] text-[#946344]',
  'bg-[#dde6f1] text-[#4d6581]',
  'bg-[#e5eeda] text-[#5a7346]',
  'bg-[#f3e2e2] text-[#8a4f4f]',
]

const INITIAL_DOCUMENTS: DocumentItem[] = [
  { id: 1, name: 'Riepilogo revisione annuale.pdf', meta: '24 mag 2024 · 2.4 MB', client: 'Sofia Bianchi' },
  { id: 2, name: 'Analisi progetto 2024.docx', meta: '12 gen 2024 · 840 KB', client: 'Marco Rossi' },
  { id: 3, name: 'Note incontro settembre.txt', meta: '18 set 2023 · 12 KB', client: 'Elena Conti' },
]

function initialsOf(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase()
}

export default function Page() {
  const [view, setView] = useState<ViewType>('home')
  const [clientList, setClientList] = useState<Client[]>(initialClients)
  const [selectedClient, setSelectedClient] = useState<Client>(initialClients[0])
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [appointmentList, setAppointmentList] = useState<Appointment[]>(initialAppointments)
  const [query, setQuery] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState<string[]>(['Chiedere aggiornamento sul nuovo progetto di studio.', 'Ricordare di inviare il riepilogo entro venerdì.'])
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS)

  const visibleTodos = useMemo(() => query ? todos.filter((todo) => `${todo.text} ${todo.client}`.toLowerCase().includes(query.toLowerCase())) : todos, [query, todos])
  const pendingCount = useMemo(() => todos.filter((todo) => !todo.done).length, [todos])

  const openProfile = (client: Client) => {
    const current = clientList.find((c) => c.id === client.id) ?? client
    setSelectedClient(current); setView('profile'); setMobileNav(false)
  }
  const openClientByName = (name: string) => {
    const found = clientList.find((c) => c.name.toLowerCase() === name.toLowerCase())
    if (found) openProfile(found)
  }
  const toggleTodo = (id: number) => setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo))

  const addTodo = (text: string, client: string, due: string, priority: boolean) => {
    const id = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1
    setTodos((current) => [{ id, text, client, due: due || 'Oggi', done: false, priority }, ...current])
  }

  const addClient = (input: { name: string; role: string; email: string; phone: string; location: string; age: number }) => {
    const name = input.name.trim()
    if (!name) return
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now() % 10000}`
    const client: Client = {
      id,
      name,
      initials: initialsOf(name),
      role: input.role.trim() || 'Cliente',
      age: input.age || 30,
      email: input.email.trim() || '—',
      phone: input.phone.trim() || '—',
      location: input.location.trim() || '—',
      color: AVATAR_COLORS[clientList.length % AVATAR_COLORS.length],
    }
    setClientList((current) => [...current, client])
    setSelectedClient(client)
  }

  const deleteClient = (id: string) => {
    const next = clientList.filter((c) => c.id !== id)
    setClientList(next)
    if (selectedClient.id === id) setSelectedClient(next[0] ?? initialClients[0])
  }

  const duplicateClient = (client: Client) => {
    const copy: Client = { ...client, id: `${client.id}-copia-${Date.now() % 10000}`, name: `${client.name} (copia)` }
    setClientList((current) => [...current, copy])
  }

  const addAppointment = (input: { title: string; client: string; date: string; time: string; duration: number; detail?: string }) => {
    if (!input.title.trim() || !input.date || !input.time) return
    const id = appointmentList.length > 0 ? Math.max(...appointmentList.map((a) => a.id)) + 1 : 1
    const appt: Appointment = {
      id,
      title: input.title.trim(),
      client: input.client,
      date: input.date,
      time: input.time,
      duration: input.duration || 60,
      detail: input.detail?.trim() || 'Nessun dettaglio aggiuntivo.',
    }
    setAppointmentList((current) => [...current, appt].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)))
  }

  const addNote = () => { if (!newNote.trim()) return; setNotes((current) => [newNote.trim(), ...current]); setNewNote('') }
  const addNoteText = (text: string) => { if (!text.trim()) return; setNotes((current) => [text.trim(), ...current]) }
  const deleteNote = (index: number) => setNotes((current) => current.filter((_, i) => i !== index))

  const addDocument = (name: string, client: string) => {
    const clean = name.trim()
    if (!clean) return
    const id = documents.length > 0 ? Math.max(...documents.map((d) => d.id)) + 1 : 1
    const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
    setDocuments((current) => [{ id, name: clean, meta: `${today} · ${client}`, client }, ...current])
  }
  const deleteDocument = (id: number) => setDocuments((current) => current.filter((d) => d.id !== id))

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1e2b3a]">
      <Sidebar view={view} setView={setView} mobileNav={mobileNav} setMobileNav={setMobileNav} pendingCount={pendingCount} />

      <div className="lg:pl-[258px]">
        <Header
          query={query}
          setQuery={setQuery}
          setMobileNav={setMobileNav}
          todos={todos}
          onToggleTodo={toggleTodo}
          onOpenClientByName={openClientByName}
        />

        <main className="mx-auto max-w-[1230px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
          {view === 'home' && (
            <HomeView
              todos={visibleTodos}
              appointments={appointmentList}
              clients={clientList}
              onToggle={toggleTodo}
              onAddTodo={addTodo}
              onOpenProfile={openProfile}
              onClients={() => setView('clients')}
              onGoCalendar={() => setView('calendar')}
            />
          )}
          {view === 'clients' && (
            <ClientsView
              clients={clientList}
              appointments={appointmentList}
              onOpenProfile={openProfile}
              onAddClient={addClient}
              onDeleteClient={deleteClient}
            />
          )}
          {view === 'profile' && (
            <ProfileView
              client={selectedClient}
              todos={todos.filter((todo) => todo.client === selectedClient.name)}
              appointments={appointmentList.filter((a) => a.client === selectedClient.name)}
              documents={documents.filter((d) => d.client === selectedClient.name)}
              onBack={() => setView('clients')}
              onToggle={toggleTodo}
              newNote={newNote}
              setNewNote={setNewNote}
              addNote={addNote}
              notes={notes}
              onDeleteClient={deleteClient}
              onDuplicateClient={duplicateClient}
              onAddAppointment={addAppointment}
              onAddDocument={addDocument}
              onDeleteDocument={deleteDocument}
            />
          )}
          {view === 'calendar' && (
            <CalendarView
              clients={clientList}
              appointments={appointmentList}
              onOpenProfile={openProfile}
              onAddAppointment={addAppointment}
            />
          )}
          {view === 'documents' && (
            <DocumentsView
              documents={documents}
              clients={clientList}
              onAddDocument={addDocument}
              onDeleteDocument={deleteDocument}
            />
          )}
          {view === 'notes' && (
            <NotesView notes={notes} onAddNote={addNoteText} onDeleteNote={deleteNote} />
          )}
        </main>
      </div>
    </div>
  )
}
