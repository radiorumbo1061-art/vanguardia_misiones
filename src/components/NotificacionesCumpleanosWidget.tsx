import React, { useState, useMemo } from 'react';
import { 
  DirectorioItem 
} from '../data/initialData';
import { 
  getActiveBirthdayNotifications, 
  BirthdayRecord 
} from '../utils/birthdayUtils';
import { 
  Cake, 
  PartyPopper, 
  Calendar, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Bell, 
  ExternalLink,
  Award,
  Vote
} from 'lucide-react';

interface NotificacionesCumpleanosWidgetProps {
  directorio: DirectorioItem[];
  variant?: 'inline-dashboard' | 'sidebar-drawer' | 'compact-card';
  onSelectCandidate?: (dni: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const NotificacionesCumpleanosWidget: React.FC<NotificacionesCumpleanosWidgetProps> = ({
  directorio,
  variant = 'inline-dashboard',
  onSelectCandidate,
  isOpen = true,
  onClose
}) => {
  const [filterMun, setFilterMun] = useState<string>('TODOS');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const { records, weekRangeText, todayCount } = useMemo(() => {
    return getActiveBirthdayNotifications(directorio);
  }, [directorio]);

  // Municipalities present in birthdays
  const availableMunicipalities = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => set.add(r.item.municipio));
    return Array.from(set).sort();
  }, [records]);

  // Filtered by municipality
  const filteredRecords = useMemo(() => {
    if (filterMun === 'TODOS') return records;
    return records.filter(r => r.item.municipio === filterMun);
  }, [records, filterMun]);

  const handleCopyGreeting = (rec: BirthdayRecord) => {
    const greeting = `¡Hola ${rec.item.nombreApellido}! 🎂 Te enviamos un muy feliz cumpleaños desde el Comando de Campaña Provincial de Misiones. Que disfrutes este gran día junto a tus seres queridos y sigamos construyendo juntos el futuro de ${rec.item.municipio}. ¡Felicidades! 🎉🎈`;
    navigator.clipboard.writeText(greeting);
    setCopiedId(rec.item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (variant === 'sidebar-drawer') {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
          {/* Drawer Header */}
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white p-5 shrink-0 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <Cake className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base tracking-tight">Notificaciones</h2>
                    <span className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/30">
                      {records.length} en la semana
                    </span>
                  </div>
                  <p className="text-xs text-amber-100 font-medium mt-0.5">
                    Cumpleaños en el Directorio General
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                title="Cerrar panel lateral"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-200" />
                {weekRangeText}
              </span>
              {todayCount > 0 && (
                <span className="bg-amber-300 text-amber-950 font-bold px-2 py-0.5 rounded-full text-[11px] shadow-xs">
                  🎉 {todayCount} HOY
                </span>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-medium shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Municipio:
            </span>
            <select
              value={filterMun}
              onChange={(e) => setFilterMun(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium text-slate-700"
            >
              <option value="TODOS">Todos los municipios ({records.length})</option>
              {availableMunicipalities.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Record List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Cake className="w-12 h-12 mx-auto text-slate-300 mb-2 opacity-50" />
                <p className="font-medium text-sm text-slate-600">No hay cumpleaños en este municipio</p>
                <p className="text-xs text-slate-400 mt-1">Prueba seleccionando "Todos los municipios".</p>
              </div>
            ) : (
              filteredRecords.map((rec) => (
                <div key={rec.item.id} className="pt-3.5 first:pt-0">
                  <div className={`p-4 rounded-2xl border transition-all ${
                    rec.isToday 
                      ? 'bg-gradient-to-br from-amber-50 via-rose-50/40 to-orange-50 border-amber-300 shadow-sm ring-1 ring-amber-400/30' 
                      : rec.isTomorrow
                      ? 'bg-sky-50/70 border-sky-200'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}>
                    {/* Header: Status Badge & Age */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {rec.isToday ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs animate-pulse">
                            <PartyPopper className="w-3.5 h-3.5" />
                            ¡CUMPLEAÑOS HOY!
                          </span>
                        ) : rec.isTomorrow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-600 text-white shadow-xs">
                            ⏳ MAÑANA ({rec.dayName})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {rec.dayName} {rec.dateFormatted}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/90 px-2.5 py-0.5 rounded-lg border border-amber-200/60">
                        Cumple {rec.ageTurning} años
                      </span>
                    </div>

                    {/* Candidate Details */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                        <span>{rec.item.nombreApellido}</span>
                      </h3>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        DNI {rec.item.dni} • Nac. {rec.item.fechaNacimiento}
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md border border-slate-200">
                          {rec.item.rolPrincipal}
                        </span>
                        <span className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {rec.item.municipio}
                        </span>
                      </div>

                      {rec.item.detalleSubRol && (
                        <p className="text-[11px] text-slate-600 mt-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {rec.item.detalleSubRol}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <a
                        href={rec.whatsappGreetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
                        title="Enviar felicitación por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Felicitar WhatsApp</span>
                      </a>

                      <button
                        onClick={() => handleCopyGreeting(rec)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Copiar saludo pre-armado"
                      >
                        {copiedId === rec.item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {onSelectCandidate && (
                        <button
                          onClick={() => {
                            onSelectCandidate(rec.item.dni);
                            onClose?.();
                          }}
                          className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
                          title="Ubicar en la tabla del Directorio"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
            Campañas electorales cercanas a la gente • Provincia de Misiones
          </div>
        </div>
      </div>
    );
  }

  // Variant: 'inline-dashboard' (Prominent Banner in Directorio or Dashboard)
  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-500/10 border border-amber-300/70 rounded-3xl p-5 shadow-xs transition-all relative overflow-hidden mb-6">
      {/* Decorative background circle */}
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Cake className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Notificaciones: Cumpleaños de la Semana</span>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {records.length} celebraciones
                </span>
              </h2>
              {todayCount > 0 && (
                <span className="bg-rose-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-bounce">
                  <PartyPopper className="w-3.5 h-3.5" />
                  {todayCount} HOY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{weekRangeText}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">Destacados automáticamente del Directorio General para saludo institucional</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {availableMunicipalities.length > 1 && (
            <div className="flex items-center gap-1 text-xs">
              <select
                value={filterMun}
                onChange={(e) => setFilterMun(e.target.value)}
                className="text-xs bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 font-medium text-slate-700 shadow-xs"
              >
                <option value="TODOS">Todos ({records.length})</option>
                {availableMunicipalities.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white hover:bg-amber-100/70 border border-amber-200 text-slate-700 transition cursor-pointer flex items-center gap-1 text-xs font-medium"
            title={isCollapsed ? 'Expandir sección' : 'Plegar sección'}
          >
            {isCollapsed ? (
              <>
                <span>Mostrar</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </>
            ) : (
              <>
                <span>Plegar</span>
                <ChevronUp className="w-4 h-4 text-slate-500" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body: Birthday Cards Grid */}
      {!isCollapsed && (
        <div className="mt-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 bg-white/70 rounded-2xl border border-dashed border-amber-200 text-slate-500 text-xs">
              <Cake className="w-8 h-8 mx-auto text-amber-400 mb-1" />
              <p className="font-semibold text-slate-700">No hay cumpleaños registrados para esta selección</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.item.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    rec.isToday 
                      ? 'bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-amber-500/5 border-amber-400 shadow-md ring-2 ring-amber-400/40' 
                      : rec.isTomorrow
                      ? 'bg-sky-500/10 border-sky-300 shadow-xs'
                      : 'bg-white/95 border-slate-200 hover:border-amber-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Status & Date */}
                    <div className="flex items-center justify-between gap-1.5 mb-2.5">
                      {rec.isToday ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                          <PartyPopper className="w-3.5 h-3.5 animate-spin" />
                          ¡CUMPLEAÑOS HOY!
                        </span>
                      ) : rec.isTomorrow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-600 text-white shadow-xs">
                          ⏳ MAÑANA ({rec.dayName})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          {rec.dayName} {rec.dateFormatted}
                        </span>
                      )}

                      <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg border border-amber-300">
                        {rec.ageTurning} años
                      </span>
                    </div>

                    {/* Candidate Identity */}
                    <div className="mt-1">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {rec.item.nombreApellido}
                      </h3>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        DNI {rec.item.dni}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded-md border border-slate-200">
                          {rec.item.rolPrincipal}
                        </span>
                        <span className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {rec.item.municipio}
                        </span>
                      </div>

                      {rec.item.detalleSubRol && (
                        <p className="text-[11px] text-slate-600 mt-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100 line-clamp-2">
                          {rec.item.detalleSubRol}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                    <a
                      href={rec.whatsappGreetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
                      title="Abrir WhatsApp con saludo institucional"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>Felicitar WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleCopyGreeting(rec)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="Copiar texto del saludo"
                    >
                      {copiedId === rec.item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {onSelectCandidate && (
                      <button
                        onClick={() => onSelectCandidate(rec.item.dni)}
                        className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                        title="Ver ficha en la tabla"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
