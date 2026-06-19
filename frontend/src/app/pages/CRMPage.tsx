import { useState, useEffect } from "react";
import { Users, Calendar as CalendarIcon, FileText, DollarSign, Plus, X, Phone, User, Building, Clock, Trash2, Edit } from "lucide-react";
import type { Page } from "../types";

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  budget: string;
  district: string;
}

interface Appointment {
  id: number;
  clientId: number;
  clientName: string;
  property: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
}

interface Note {
  id: number;
  clientId: number;
  clientName: string;
  text: string;
  date: string;
}

interface Payment {
  id: number;
  amount: string;
  type: "commission" | "deposit" | "fee";
  clientId: number;
  clientName: string;
  notes: string;
  date: string;
}

const CRM_KEY = "uymap_crm_data";

function loadCRM<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(`${CRM_KEY}_${key}`);
    if (data) return JSON.parse(data);
  } catch {}
  return fallback;
}

function saveCRM<T>(key: string, data: T[]) {
  localStorage.setItem(`${CRM_KEY}_${key}`, JSON.stringify(data));
}

const initialClients: Client[] = loadCRM("clients", [
  { id: 1, name: "Anvar Karimov", phone: "+998901234567", email: "anvar@mail.com", notes: "2 xonali kvartira qidirmoqda", budget: "$50,000", district: "Yunusobod" },
  { id: 2, name: "Dilnoza Rahimova", phone: "+998937654321", email: "dilnoza@mail.com", notes: "Uy qidirmoqda", budget: "$80,000", district: "Chilonzor" },
]);

const initialAppointments: Appointment[] = loadCRM("appointments", [
  { id: 1, clientId: 1, clientName: "Anvar Karimov", property: "2 xonali kvartira, Yunusobod", date: "2025-06-20", time: "14:00", duration: "1 soat", notes: "" },
]);

const initialNotes: Note[] = loadCRM("notes", [
  { id: 1, clientId: 1, clientName: "Anvar Karimov", text: "Ipoteka olish imkoniyatini so'radi", date: "2025-06-18" },
]);

const initialPayments: Payment[] = loadCRM("payments", [
  { id: 1, amount: "500", type: "commission", clientId: 1, clientName: "Anvar Karimov", notes: "Shartnoma bo'yicha", date: "2025-06-15" },
]);

function CRMPage({ onNav }: { onNav: (p: Page) => void }) {
  const [tab, setTab] = useState<"clients" | "appointments" | "notes" | "payments">("clients");
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [notesData, setNotesData] = useState<Note[]>(initialNotes);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  useEffect(() => { saveCRM("clients", clients); }, [clients]);
  useEffect(() => { saveCRM("appointments", appointments); }, [appointments]);
  useEffect(() => { saveCRM("notes", notesData); }, [notesData]);
  useEffect(() => { saveCRM("payments", payments); }, [payments]);

  // Modal states
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Client form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [clientBudget, setClientBudget] = useState("");
  const [clientDistrict, setClientDistrict] = useState("");

  // Appointment form
  const [apptClientId, setApptClientId] = useState(0);
  const [apptProperty, setApptProperty] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptDuration, setApptDuration] = useState("1 soat");
  const [apptNotes, setApptNotes] = useState("");

  // Note form
  const [noteClientId, setNoteClientId] = useState(0);
  const [noteText, setNoteText] = useState("");

  // Payment form
  const [payClientId, setPayClientId] = useState(0);
  const [payAmount, setPayAmount] = useState("");
  const [payType, setPayType] = useState<"commission" | "deposit" | "fee">("commission");
  const [payNotes, setPayNotes] = useState("");

  const resetClientForm = () => {
    setClientName(""); setClientPhone(""); setClientEmail(""); setClientNotes(""); setClientBudget(""); setClientDistrict("");
  };

  const addClient = () => {
    const newClient: Client = {
      id: Date.now(),
      name: clientName,
      phone: clientPhone,
      email: clientEmail,
      notes: clientNotes,
      budget: clientBudget,
      district: clientDistrict,
    };
    setClients(prev => [newClient, ...prev]);
    resetClientForm();
    setShowClientModal(false);
  };

  const addAppointment = () => {
    const client = clients.find(c => c.id === apptClientId);
    const newAppt: Appointment = {
      id: Date.now(),
      clientId: apptClientId,
      clientName: client?.name || "",
      property: apptProperty,
      date: apptDate,
      time: apptTime,
      duration: apptDuration,
      notes: apptNotes,
    };
    setAppointments(prev => [newAppt, ...prev]);
    setApptClientId(0); setApptProperty(""); setApptDate(""); setApptTime(""); setApptDuration("1 soat"); setApptNotes("");
    setShowAppointmentModal(false);
  };

  const addNote = () => {
    const client = clients.find(c => c.id === noteClientId);
    const newNote: Note = {
      id: Date.now(),
      clientId: noteClientId,
      clientName: client?.name || "",
      text: noteText,
      date: new Date().toISOString().split("T")[0],
    };
    setNotesData(prev => [newNote, ...prev]);
    setNoteClientId(0); setNoteText("");
    setShowNoteModal(false);
  };

  const addPayment = () => {
    const client = clients.find(c => c.id === payClientId);
    const newPayment: Payment = {
      id: Date.now(),
      amount: payAmount,
      type: payType,
      clientId: payClientId,
      clientName: client?.name || "",
      notes: payNotes,
      date: new Date().toISOString().split("T")[0],
    };
    setPayments(prev => [newPayment, ...prev]);
    setPayClientId(0); setPayAmount(""); setPayType("commission"); setPayNotes("");
    setShowPaymentModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Agent CRM</h1>
          <p className="text-sm text-gray-400">Mijozlar, uchrashuvlar va to'lovlarni boshqaring</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit overflow-x-auto">
          {[
            { id: "clients", label: "Mijozlar", icon: Users, count: clients.length },
            { id: "appointments", label: "Uchrashuvlar", icon: CalendarIcon, count: appointments.length },
            { id: "notes", label: "Eslatmalar", icon: FileText, count: notesData.length },
            { id: "payments", label: "To'lovlar", icon: DollarSign, count: payments.length },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id as typeof tab)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                tab === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} /> {label}
              <span className="text-[10px] bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">{count}</span>
            </button>
          ))}
        </div>

        {/* Clients Tab */}
        {tab === "clients" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Barcha mijozlar</h3>
              <button onClick={() => { resetClientForm(); setShowClientModal(true); }}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                <Plus size={13} /> Mijoz qo'shish
              </button>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-16">
                <Users size={44} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-700">Hozircha mijozlar yo'q</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone size={10} /> {c.phone}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>Budget: {c.budget}</span>
                        <span>·</span>
                        <Building size={10} /> {c.district}
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      <Edit size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {tab === "appointments" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Uchrashuvlar</h3>
              <button onClick={() => setShowAppointmentModal(true)}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                <Plus size={13} /> Yangi uchrashuv
              </button>
            </div>
            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <CalendarIcon size={44} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-700">Uchrashuvlar yo'q</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => (
                  <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                          <CalendarIcon size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{a.clientName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{a.property}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-gray-700">{a.date}</div>
                        <div className="text-xs text-gray-400">{a.time} · {a.duration}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {tab === "notes" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Eslatmalar</h3>
              <button onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                <Plus size={13} /> Eslatma qo'shish
              </button>
            </div>
            {notesData.length === 0 ? (
              <div className="text-center py-16">
                <FileText size={44} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-700">Eslatmalar yo'q</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {notesData.map((n) => (
                  <div key={n.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={13} className="text-green-500" />
                        <span className="font-bold text-sm text-gray-900">{n.clientName}</span>
                        <span className="text-xs text-gray-400">{n.date}</span>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">{n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {tab === "payments" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">To'lovlar</h3>
              <button onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                <Plus size={13} /> To'lov qo'shish
              </button>
            </div>
            {payments.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign size={44} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-700">To'lovlar yo'q</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => {
                  const typeLabels = { commission: "Komissiya", deposit: "Depozit", fee: "Yig'im" };
                  const typeColors = { commission: "text-green-600 bg-green-50", deposit: "text-blue-600 bg-blue-50", fee: "text-amber-600 bg-amber-50" };
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                            p.type === "commission" ? "bg-green-100 text-green-600" : p.type === "deposit" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                          }`}>
                            <DollarSign size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{p.clientName}</div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[p.type]}`}>
                              {typeLabels[p.type]}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-gray-900">${p.amount}</div>
                          <div className="text-[10px] text-gray-400">{p.date}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowClientModal(false); resetClientForm(); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Yangi mijoz</h3>
              <button onClick={() => { setShowClientModal(false); resetClientForm(); }} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Ism" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <input type="tel" placeholder="Telefon" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <input type="email" placeholder="Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <input type="text" placeholder="Budget" value={clientBudget} onChange={e => setClientBudget(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <input type="text" placeholder="Tuman afzalligi" value={clientDistrict} onChange={e => setClientDistrict(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <textarea placeholder="Eslatmalar" value={clientNotes} onChange={e => setClientNotes(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-20" />
              <button onClick={addClient} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAppointmentModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Yangi uchrashuv</h3>
              <button onClick={() => setShowAppointmentModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <select value={apptClientId} onChange={e => setApptClientId(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white">
                <option value={0}>Mijozni tanlang</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Mulk nomi" value={apptProperty} onChange={e => setApptProperty(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <input type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <input type="text" placeholder="Davomiyligi (masalan: 1 soat)" value={apptDuration} onChange={e => setApptDuration(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <textarea placeholder="Eslatmalar" value={apptNotes} onChange={e => setApptNotes(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-16" />
              <button onClick={addAppointment} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNoteModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Yangi eslatma</h3>
              <button onClick={() => setShowNoteModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <select value={noteClientId} onChange={e => setNoteClientId(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white">
                <option value={0}>Mijozni tanlang</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea placeholder="Eslatma matni" value={noteText} onChange={e => setNoteText(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-24" />
              <button onClick={addNote} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Yangi to'lov</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <select value={payClientId} onChange={e => setPayClientId(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white">
                <option value={0}>Mijozni tanlang</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" placeholder="Summa ($)" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <div className="grid grid-cols-3 gap-2">
                {(["commission", "deposit", "fee"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPayType(t)}
                    className={`border rounded-xl py-2 text-xs font-semibold transition-colors ${
                      payType === t
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-green-300"
                    }`}
                  >
                    {t === "commission" ? "Komissiya" : t === "deposit" ? "Depozit" : "Yig'im"}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Eslatma" value={payNotes} onChange={e => setPayNotes(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
              <button onClick={addPayment} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CRMPage;
