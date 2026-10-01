import { Client, Todo, Appointment } from './types'

export const clients: Client[] = [
  { id: 'sofia', name: 'Sofia Bianchi', initials: 'SB', role: 'Avvocata', age: 42, email: 'sofia.bianchi@email.it', phone: '+39 333 456 7890', location: 'Milano, IT', color: 'bg-[#dce9e7] text-[#38645e]' },
  { id: 'marco', name: 'Marco Rossi', initials: 'MR', role: 'Imprenditore', age: 56, email: 'marco.rossi@email.it', phone: '+39 347 123 4567', location: 'Roma, IT', color: 'bg-[#e8e3f1] text-[#65547f]' },
  { id: 'elena', name: 'Elena Conti', initials: 'EC', role: 'Architetta', age: 38, email: 'elena.conti@email.it', phone: '+39 320 987 6543', location: 'Torino, IT', color: 'bg-[#f2e3d8] text-[#946344]' },
  { id: 'luca', name: 'Luca Ferri', initials: 'LF', role: 'Medico', age: 47, email: 'luca.ferri@email.it', phone: '+39 338 234 5678', location: 'Bologna, IT', color: 'bg-[#dde6f1] text-[#4d6581]' },
]

export const initialTodos: Todo[] = [
  { id: 1, text: 'Inviare il riepilogo della riunione', client: 'Sofia Bianchi', due: 'Oggi', done: false, priority: true },
  { id: 2, text: 'Preparare documenti per revisione annuale', client: 'Marco Rossi', due: 'Domani', done: false },
  { id: 3, text: 'Verificare disponibilità per appuntamento', client: 'Elena Conti', due: '8 ott', done: false },
  { id: 4, text: 'Aggiornare le note del progetto', client: 'Luca Ferri', due: '10 ott', done: true },
  { id: 5, text: 'Condividere la nuova analisi', client: 'Sofia Bianchi', due: '15 ott', done: false },
]

export const appointments: Appointment[] = [
  { id: 1, date: '2026-10-02', title: 'Follow-up progetto', detail: 'Verifica dello stato di avanzamento e raccolta dei nuovi punti da approfondire.', client: 'Sofia Bianchi', time: '10:30', duration: 60 },
  { id: 2, date: '2026-10-07', title: 'Revisione documenti', detail: 'Revisione dei documenti contrattuali e verifica delle scadenze legali.', client: 'Marco Rossi', time: '15:00', duration: 60 },
  { id: 3, date: '2026-10-14', title: 'Pianificazione Q4', detail: 'Sessione dedicata alla pianificazione del quarto trimestre e agli obiettivi di fine anno.', client: 'Elena Conti', time: '11:00', duration: 90 },
  { id: 4, date: '2026-10-21', title: 'Analisi portfolio', detail: 'Revisione del portfolio di investimenti e valutazione delle nuove opportunità.', client: 'Luca Ferri', time: '09:30', duration: 60 },
  { id: 5, date: '2026-10-28', title: 'Revisione annuale', detail: 'Abbiamo rivisto insieme gli obiettivi dell\'anno e definito le prossime priorità.', client: 'Sofia Bianchi', time: '14:00', duration: 90 },
  { id: 6, date: '2026-11-04', title: 'Riunione di aggiornamento', detail: 'Aggiornamento sulle attività in corso e definizione dei prossimi passi.', client: 'Marco Rossi', time: '10:00', duration: 60 },
]
