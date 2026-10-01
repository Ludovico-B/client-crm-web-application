import { Check, ChevronRight, FileText, Trash2 } from 'lucide-react'
import { Client, Todo } from '../lib/types'
import { clients } from '../lib/data'

export function Avatar({ client, small = false }: { client: Client; small?: boolean }) {
  return <div className={`${small ? 'size-8 text-[10px]' : 'size-11 text-sm'} ${client.color} flex shrink-0 items-center justify-center rounded-full font-semibold`}>{client.initials}</div>
}

export function StatCard({ label, value, note, icon }: { label: string; value: string | number; note: string; icon: React.ReactNode }) { 
  return <div className="rounded-[14px] border border-[#e1e6eb] bg-white px-5 py-4"><div className="flex items-center gap-2 text-[11px] font-medium text-slate-400"><span className="text-[#7590a6]">{icon}</span>{label}</div><div className="mt-3 flex items-baseline gap-2"><span className="text-[27px] font-semibold tracking-[-0.04em]">{value}</span><span className="text-[11px] text-slate-400">{note}</span></div></div> 
}

export function TodoRow({ todo, onToggle, onOpenProfile }: { todo: Todo; onToggle: (id: number) => void; onOpenProfile: (client: Client) => void }) { 
  const client = clients.find((item) => item.name === todo.client) || clients[0]; 
  return <div className="group flex items-center gap-3 border-b border-[#edf0f3] py-3.5 last:border-0"><button onClick={() => onToggle(todo.id)} className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${todo.done ? 'border-[#729890] bg-[#729890] text-white' : 'border-[#c6d0d9] hover:border-[#7895a9]'}`} aria-label={todo.done ? 'Segna come da fare' : 'Segna come completato'}>{todo.done && <Check className="size-3" strokeWidth={3} />}</button><div className="min-w-0 flex-1"><p className={`truncate text-[13px] ${todo.done ? 'text-slate-400 line-through' : 'text-[#334556]'}`}>{todo.text}</p><button onClick={() => onOpenProfile(client)} className="mt-1 text-[11px] text-[#7890a7] hover:text-[#486a82]">{todo.client}</button></div>{todo.priority && <span className="hidden rounded-full bg-[#fcf0eb] px-2 py-1 text-[10px] font-medium text-[#a36e58] sm:block">Priorità</span>}<span className={`text-[11px] ${todo.due === 'Oggi' ? 'font-semibold text-[#b06d56]' : 'text-slate-400'}`}>{todo.due}</span></div> 
}

export function AppointmentMini({ date, month, title, client, time, clientData, onOpen }: { date: string; month: string; title: string; client: string; time: string; clientData: Client; onOpen: () => void }) { 
  return <button onClick={onOpen} className="flex items-center gap-3 text-left"><div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-[#f1f5f8]"><span className="text-[16px] font-semibold leading-none text-[#40586c]">{date}</span><span className="mt-1 text-[9px] font-bold tracking-wider text-[#8aa0b1]">{month}</span></div><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-[#394c5d]">{title}</p><p className="mt-1 text-[11px] text-slate-400">{client} · {time}</p></div><ChevronRight className="size-4 text-slate-300" /></button> 
}

export function Info({ label, value }: { label: string; value: string }) { 
  return <div><p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate pr-2 text-[11px] font-medium text-slate-600">{value}</p></div> 
}

export function DocumentRow({ name, meta, onDelete }: { name: string; meta: string; onDelete?: () => void }) { 
  return <div className="flex items-center gap-3 rounded-lg border border-[#edf0f3] px-3 py-2.5"><div className="flex size-8 items-center justify-center rounded-md bg-[#eef3f7] text-[#6f879b]"><FileText className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium text-slate-600">{name}</p><p className="mt-0.5 text-[10px] text-slate-400">{meta}</p></div>{onDelete ? <button onClick={onDelete} className="flex size-7 items-center justify-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500" aria-label="Elimina documento"><Trash2 className="size-4" /></button> : null}</div> 
}
