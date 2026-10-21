import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DirectorioView } from './components/DirectorioView';
import { MunicipiosView } from './components/MunicipiosView';
import { UsuariosView } from './components/UsuariosView';
import { AppsScriptStudio } from './components/AppsScriptStudio';
import { FormulasDocView } from './components/FormulasDocView';
import { LoginModalSimulator } from './components/LoginModalSimulator';
import { NotificacionesCumpleanosWidget } from './components/NotificacionesCumpleanosWidget';
import { FiestasPopularesModal } from './components/FiestasPopularesModal';
import { getActiveBirthdayNotifications } from './utils/birthdayUtils';
import { getFiestasProximas } from './data/fiestasPopularesMisiones';
import { 
  DIRECTORIO_INICIAL, 
  USUARIOS_INICIALES, 
  DirectorioItem, 
  UsuarioAutorizado 
} from './data/initialData';
import { exportFullSpreadsheet } from './utils/exportSpreadsheet';
import { RotateCcw } from 'lucide-react';

const STORAGE_KEY_DIR = 'misiones_campana_directorio_v1';
const STORAGE_KEY_USERS = 'misiones_campana_usuarios_v1';
const STORAGE_KEY_CURRENT_USER = 'misiones_campana_currentUser_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'directorio' | 'municipios' | 'usuarios' | 'appscript' | 'formulas'>('directorio');
  
  // Persistent state initialized from localStorage
  const [directorio, setDirectorio] = useState<DirectorioItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DIR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading directorio from localStorage:', e);
    }
    return DIRECTORIO_INICIAL;
  });

  const [usuarios, setUsuarios] = useState<UsuarioAutorizado[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading usuarios from localStorage:', e);
    }
    return USUARIOS_INICIALES;
  });

  const [currentUser, setCurrentUser] = useState<UsuarioAutorizado>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch (e) {
      console.warn('Error reading currentUser from localStorage:', e);
    }
    return USUARIOS_INICIALES[0];
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBirthdayDrawerOpen, setIsBirthdayDrawerOpen] = useState(false);
  const [isFiestasModalOpen, setIsFiestasModalOpen] = useState(false);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>('');

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DIR, JSON.stringify(directorio));
    } catch (e) {
      console.warn('Error saving directorio to localStorage:', e);
    }
  }, [directorio]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(usuarios));
    } catch (e) {
      console.warn('Error saving usuarios to localStorage:', e);
    }
  }, [usuarios]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Error saving currentUser to localStorage:', e);
    }
  }, [currentUser]);

  const { records: birthdayRecords } = useMemo(() => {
    return getActiveBirthdayNotifications(directorio);
  }, [directorio]);

  const { mesActual } = useMemo(() => {
    return getFiestasProximas();
  }, []);

  const handleExportXLSX = () => {
    exportFullSpreadsheet(directorio, usuarios);
  };

  const handleResetData = () => {
    if (window.confirm('¿Confirma restablecer los datos al estado inicial de muestra (63 dirigentes y 7 operadores de los 79 municipios)? Se restaurará el padrón predeterminado.')) {
      setDirectorio(DIRECTORIO_INICIAL);
      setUsuarios(USUARIOS_INICIALES);
      setCurrentUser(USUARIOS_INICIALES[0]);
      localStorage.removeItem(STORAGE_KEY_DIR);
      localStorage.removeItem(STORAGE_KEY_USERS);
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  };

  const handleSelectCandidateFromNotifications = (dni: string) => {
    setCandidateSearchQuery(dni);
    setActiveTab('directorio');
    setIsBirthdayDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onExportXLSX={handleExportXLSX}
        onOpenBirthdaysDrawer={() => setIsBirthdayDrawerOpen(true)}
        birthdayCount={birthdayRecords.length}
        onOpenFiestasModal={() => setIsFiestasModalOpen(true)}
        fiestasCount={mesActual.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'directorio' && (
          <DirectorioView
            directorio={directorio}
            setDirectorio={setDirectorio}
            currentUser={currentUser}
            initialSearchQuery={candidateSearchQuery}
          />
        )}

        {activeTab === 'municipios' && (
          <MunicipiosView directorio={directorio} />
        )}

        {activeTab === 'usuarios' && (
          <UsuariosView
            usuarios={usuarios}
            setUsuarios={setUsuarios}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}

        {activeTab === 'appscript' && (
          <AppsScriptStudio />
        )}

        {activeTab === 'formulas' && (
          <FormulasDocView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-left">
            <div className="font-semibold text-slate-800">
              🏛️ Sistema de Gestión Electoral • Provincia de Misiones (79 Municipios Oficiales)
            </div>
            <div className="font-mono text-[11px] text-slate-400 mt-0.5">
              Google Sheets Architecture, Trigger onEdit(e) & Google Apps Script Automation
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Almacenamiento Local Activo
            </span>
            <button
              onClick={handleResetData}
              title="Restablece los 63 dirigentes y 7 operadores de muestra originales"
              className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
              <span>Restablecer Datos Iniciales</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Login Modal Simulator */}
      <LoginModalSimulator
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        usuarios={usuarios}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      {/* Global Birthday Notifications Drawer */}
      <NotificacionesCumpleanosWidget
        directorio={directorio}
        variant="sidebar-drawer"
        isOpen={isBirthdayDrawerOpen}
        onClose={() => setIsBirthdayDrawerOpen(false)}
        onSelectCandidate={handleSelectCandidateFromNotifications}
      />

      {/* Fiestas Populares de Misiones Reminder Modal */}
      <FiestasPopularesModal
        isOpen={isFiestasModalOpen}
        onClose={() => setIsFiestasModalOpen(false)}
        onFilterMunicipioInDirectorio={(mun) => {
          setCandidateSearchQuery(mun);
          setActiveTab('directorio');
          setIsFiestasModalOpen(false);
        }}
      />
    </div>
  );
}
