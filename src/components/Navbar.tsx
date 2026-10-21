import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Code2, 
  BookOpen, 
  ShieldCheck, 
  Download, 
  MapPin, 
  Users, 
  UserCheck, 
  Sparkles,
  ExternalLink,
  Cake,
  PartyPopper,
  Menu,
  X
} from 'lucide-react';
import { UsuarioAutorizado } from '../data/initialData';

interface NavbarProps {
  activeTab: 'directorio' | 'municipios' | 'usuarios' | 'appscript' | 'formulas';
  setActiveTab: (tab: 'directorio' | 'municipios' | 'usuarios' | 'appscript' | 'formulas') => void;
  currentUser: UsuarioAutorizado;
  onOpenLoginModal: () => void;
  onExportXLSX: () => void;
  onOpenBirthdaysDrawer?: () => void;
  birthdayCount?: number;
  onOpenFiestasModal?: () => void;
  fiestasCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLoginModal,
  onExportXLSX,
  onOpenBirthdaysDrawer,
  birthdayCount = 0,
  onOpenFiestasModal,
  fiestasCount = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Banner with Misiones Province Colors Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-sky-400 to-blue-700"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-base sm:text-lg border border-blue-400/30 shrink-0">
              🏛️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white truncate">
                  Campaña Misiones
                </span>
                <span className="bg-gradient-to-r from-blue-500/20 to-sky-500/20 text-sky-400 text-[10px] sm:text-xs px-2 py-0.5 rounded-full border border-sky-500/30 font-semibold shrink-0">
                  79 Municipios
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block truncate">
                Google Sheets Architecture, Auditoría Automatizada y Google Apps Script
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Actions */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 shrink-0">
            {/* Birthday Notifications Button */}
            {onOpenBirthdaysDrawer && (
              <button
                onClick={onOpenBirthdaysDrawer}
                aria-label={`Notificaciones de cumpleaños (${birthdayCount} esta semana)`}
                className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold shadow-xs transition cursor-pointer min-h-[40px]"
                title="Notificaciones: Cumpleaños de la semana en el Directorio"
              >
                <Cake className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
                <span className="hidden md:inline text-amber-100 font-medium">Cumpleaños</span>
                {birthdayCount > 0 && (
                  <span className="bg-amber-400 text-amber-950 font-black px-1.5 py-0.5 rounded-full text-[10px] shadow-xs">
                    {birthdayCount}
                  </span>
                )}
              </button>
            )}

            {/* Fiestas Populares de Misiones Reminder Button */}
            {onOpenFiestasModal && (
              <button
                onClick={onOpenFiestasModal}
                aria-label={`Recordatorio de Fiestas Populares (${fiestasCount} este mes)`}
                className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 hover:from-rose-500/30 hover:to-amber-500/30 border border-rose-400/40 text-rose-200 text-xs font-semibold shadow-xs transition cursor-pointer min-h-[40px]"
                title="Recordatorio: Fiestas Populares y Festivales de los 79 Municipios de Misiones"
              >
                <PartyPopper className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="hidden md:inline text-rose-100 font-medium">Fiestas</span>
                {fiestasCount > 0 && (
                  <span className="bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full text-[10px] shadow-xs animate-pulse">
                    {fiestasCount}
                  </span>
                )}
              </button>
            )}

            {/* Operator info button */}
            <button
              onClick={onOpenLoginModal}
              title="Cambiar o validar credenciales de operador"
              aria-label={`Operador activo: ${currentUser.nombre}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs text-slate-200 transition cursor-pointer min-h-[40px]"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <div className="text-left hidden md:block">
                <div className="font-semibold text-white leading-tight truncate max-w-[140px] flex items-center gap-1">
                  {currentUser.rolSistema === 'Operador Universal' && (
                    <span title="Operador Universal">⭐</span>
                  )}
                  <span>{currentUser.nombre}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentUser.rolSistema === 'Operador Universal'
                    ? 'Operador Universal (79 Mun.)'
                    : currentUser.municipioAsignado === 'TODOS'
                    ? 'Ámbito Provincial'
                    : `Mun: ${currentUser.municipioAsignado}`}
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </button>

            {/* Export XLSX Button */}
            <button
              onClick={onExportXLSX}
              aria-label="Descargar archivo Excel .XLSX"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-700/30 transition cursor-pointer min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.XLSX</span>
            </button>
          </div>

          {/* Mobile Right Compact Actions (<sm) */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            {/* Quick Birthday Icon */}
            {onOpenBirthdaysDrawer && (
              <button
                onClick={onOpenBirthdaysDrawer}
                aria-label="Cumpleaños"
                className="relative p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <Cake className="w-4 h-4 text-amber-300" />
                {birthdayCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full text-[9px]">
                    {birthdayCount}
                  </span>
                )}
              </button>
            )}

            {/* Quick Fiestas Icon */}
            {onOpenFiestasModal && (
              <button
                onClick={onOpenFiestasModal}
                aria-label="Fiestas Populares"
                className="relative p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/40 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <PartyPopper className="w-4 h-4 text-rose-300" />
                {fiestasCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black px-1.5 py-0.2 rounded-full text-[9px]">
                    {fiestasCount}
                  </span>
                )}
              </button>
            )}

            {/* Operator Quick Pill */}
            <button
              onClick={onOpenLoginModal}
              aria-label="Operador"
              className="p-2 rounded-xl bg-slate-800 text-sky-400 border border-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* XLSX Quick Icon */}
            <button
              onClick={onExportXLSX}
              aria-label="Descargar Excel"
              className="p-2 rounded-xl bg-emerald-600 text-white min-h-[40px] min-w-[40px] flex items-center justify-center shadow-xs"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation: Responsive scrollable with concise adaptive labels */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-1.5 pb-2 overflow-x-auto text-xs sm:text-sm no-scrollbar">
          <button
            onClick={() => setActiveTab('directorio')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap min-h-[40px] ${
              activeTab === 'directorio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-sky-300" />
            <span className="hidden sm:inline">Pestaña 1: </span>
            <span>Directorio</span>
            <span className="hidden md:inline">_General</span>
          </button>

          <button
            onClick={() => setActiveTab('municipios')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap min-h-[40px] ${
              activeTab === 'municipios'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0 text-sky-400" />
            <span className="hidden sm:inline">Pestaña 2: </span>
            <span>79 Municipios</span>
            <span className="hidden lg:inline">& Mapa Calor</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap min-h-[40px] ${
              activeTab === 'usuarios'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0 text-purple-300" />
            <span className="hidden sm:inline">Pestaña 3: </span>
            <span>Operadores</span>
          </button>

          <button
            onClick={() => setActiveTab('appscript')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap min-h-[40px] ${
              activeTab === 'appscript'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <Code2 className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Apps Script</span>
            <span className="hidden md:inline">(Code.gs)</span>
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl font-semibold transition whitespace-nowrap min-h-[40px] ${
              activeTab === 'formulas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Fórmulas & Doc</span>
          </button>
        </div>
      </div>
    </header>
  );
};
