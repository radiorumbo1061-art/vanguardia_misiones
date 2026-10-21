import React, { useState } from 'react';
import { 
  APPS_SCRIPT_CODE_GS, 
  APPS_SCRIPT_LOGIN_HTML, 
  APPS_SCRIPT_SETUP_GS 
} from '../data/appsScriptCode';
import { 
  Code2, 
  Copy, 
  CheckCircle2, 
  Terminal, 
  FileCode, 
  Play, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  HelpCircle,
  Cpu
} from 'lucide-react';

export const AppsScriptStudio: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'code' | 'login' | 'setup'>('code');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const getActiveCode = () => {
    switch (activeCodeTab) {
      case 'code':
        return APPS_SCRIPT_CODE_GS;
      case 'login':
        return APPS_SCRIPT_LOGIN_HTML;
      case 'setup':
        return APPS_SCRIPT_SETUP_GS;
    }
  };

  const getActiveFilename = () => {
    switch (activeCodeTab) {
      case 'code':
        return 'Code.gs';
      case 'login':
        return 'LoginModal.html';
      case 'setup':
        return 'SetupSpreadsheet.gs';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedTab(activeCodeTab);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Google Apps Script • Automatización
            </span>
            <span className="text-xs text-slate-500">Módulos listos para producción</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Centro de Código Google Apps Script</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Scripts para auditoría automática de usuario y fecha/hora, control de acceso mediante ventana modal y autoinstalador de las 3 hojas con los 79 municipios.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm shadow-indigo-600/30 transition cursor-pointer shrink-0"
        >
          {copiedTab === activeCodeTab ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>¡{getActiveFilename()} Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar {getActiveFilename()}</span>
            </>
          )}
        </button>
      </div>

      {/* Step by Step Implementation Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-900 shadow-md">
        <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-amber-400" />
          Guía de Instalación en 4 Pasos en Google Sheets:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white inline-flex items-center justify-center font-bold text-[10px] mb-1.5">
              1
            </span>
            <p className="font-semibold text-white">Abrir Apps Script</p>
            <p className="text-slate-400 mt-1">
              En tu hoja de Google Sheets, ve al menú superior: <strong className="text-indigo-200">Extensiones &gt; Apps Script</strong>.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white inline-flex items-center justify-center font-bold text-[10px] mb-1.5">
              2
            </span>
            <p className="font-semibold text-white">Crear los 3 Archivos</p>
            <p className="text-slate-400 mt-1">
              Pega <strong className="text-indigo-200">Code.gs</strong>, crea un archivo HTML llamado <strong className="text-indigo-200">LoginModal.html</strong> y crea <strong className="text-indigo-200">SetupSpreadsheet.gs</strong>.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white inline-flex items-center justify-center font-bold text-[10px] mb-1.5">
              3
            </span>
            <p className="font-semibold text-white">Ejecutar Setup</p>
            <p className="text-slate-400 mt-1">
              En el editor de Apps Script, selecciona la función <code className="text-amber-300 font-mono">setupCompleteElectoralSystem</code> y presiona <strong className="text-indigo-200">Ejecutar</strong>.
            </p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white inline-flex items-center justify-center font-bold text-[10px] mb-1.5">
              4
            </span>
            <p className="font-semibold text-white">¡Listo para Usar!</p>
            <p className="text-slate-400 mt-1">
              Regresa a la hoja: verás las 3 pestañas creadas con los 79 municipios, las listas desplegables y el menú personalizado.
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Subtabs Bar */}
        <div className="flex items-center justify-between bg-slate-950 px-4 py-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveCodeTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Code.gs (Auditoría & Menú)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('login')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span>2. LoginModal.html (Interfaz Modal)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('setup')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCodeTab === 'setup'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. SetupSpreadsheet.gs (Autoinstalador 1-Clic)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedTab === activeCodeTab ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* File explanation bar */}
        <div className="bg-slate-800/60 px-4 py-2 border-b border-slate-800/80 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-300 font-semibold">{getActiveFilename()}</span>
            <span className="text-slate-500">•</span>
            {activeCodeTab === 'code' && (
              <span>Contiene trigger <code className="text-sky-300 font-mono">onEdit(e)</code>, menú <code className="text-sky-300 font-mono">onOpen(e)</code>, validación de hash SHA-256 y protección de auditoría.</span>
            )}
            {activeCodeTab === 'login' && (
              <span>Diseño responsivo para <code className="text-sky-300 font-mono">HtmlService</code> de Google Sheets que solicita credenciales al operador.</span>
            )}
            {activeCodeTab === 'setup' && (
              <span>Puebla automáticamente los 79 municipios de Misiones, crea las 3 pestañas y configura las listas desplegables.</span>
            )}
          </div>
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            JavaScript / GAS ES6
          </span>
        </div>

        {/* Code Block with Line Numbers */}
        <div className="p-4 overflow-x-auto max-h-[640px] font-mono text-xs text-slate-200 bg-slate-950 leading-relaxed selection:bg-indigo-500 selection:text-white">
          <pre className="tab-4">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
