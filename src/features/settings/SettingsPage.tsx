import React, { useEffect, useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { SpeechService } from "../../services/speech/SpeechService";
import { WakeLockService } from "../../services/wakeLock/WakeLockService";
import { Settings, Volume2, Shield, Eye, RefreshCw } from "lucide-react";
import { useToast } from "../../components/feedback/ToastProvider";

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const session = useGameStore((state) => state.session);
  const updateSettings = useGameStore((state) => state.updateSettings);

  // Fallback states if no active session
  const [operatorName, setOperatorName] = useState("");
  const [drawMode, setDrawMode] = useState<"MANUAL" | "SEMI_AUTOMATIC" | "AUTOMATIC">("MANUAL");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceRate, setVoiceRate] = useState(0.95);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [wakeLockEnabled, setWakeLockEnabled] = useState(true);

  // Sync component states with store session
  useEffect(() => {
    if (session) {
      setOperatorName(session.settings.operatorName);
      setDrawMode(session.settings.mode);
      setVoiceEnabled(session.settings.voiceEnabled);
      setVoiceRate(session.settings.voiceRate);
      setSelectedVoice(session.settings.voiceName || "");
      setWakeLockEnabled(session.settings.wakeLockEnabled);
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    await updateSettings({
      operatorName,
      mode: drawMode,
      voiceEnabled,
      voiceRate,
      voiceName: selectedVoice || undefined,
      wakeLockEnabled
    });

    // Update screen wake lock on live change
    if (wakeLockEnabled) {
      WakeLockService.setEnabled(true);
      await WakeLockService.request();
    } else {
      WakeLockService.setEnabled(false);
      await WakeLockService.release();
    }

    showToast("Configuración guardada correctamente", "success");
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary text-sm">Debes tener una partida activa para modificar los ajustes en tiempo real.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-tech text-text-primary flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> AJUSTES GENERALES
        </h1>
        <p className="text-text-secondary text-xs">Modifica parámetros operativos y preferencias del juego en tiempo real.</p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl space-y-6">
        {/* Operator Profile */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-tech text-primary border-b border-border pb-1.5">Perfil de Operación</h3>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Nombre del Operador</label>
            <input
              type="text"
              required
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full h-11 px-4 bg-app-background-soft border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Draw Mode Live Adjust */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-tech text-primary border-b border-border pb-1.5">Modo de Extracción</h3>
          <div className="grid grid-cols-3 gap-3">
            {(["MANUAL", "SEMI_AUTOMATIC", "AUTOMATIC"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDrawMode(m)}
                className={`py-2 px-3 border rounded-xl text-xs font-semibold font-tech transition-all ${
                  drawMode === m
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-app-background-soft border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                {m === "MANUAL" ? "Manual" : m === "SEMI_AUTOMATIC" ? "Semiauto" : "Auto"}
              </button>
            ))}
          </div>
        </div>

        {/* Voice and Speech Synthesis */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-tech text-primary border-b border-border pb-1.5">Ajustes de Voz</h3>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Activar voz de la bola</span>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
          </div>

          {voiceEnabled && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Seleccionar Voz</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full h-11 px-4 bg-app-background-soft border border-border rounded-xl text-text-primary text-sm focus:outline-none"
                >
                  {SpeechService.getAvailableVoices().map((v) => (
                    <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Velocidad del Habla ({voiceRate}x)</label>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Display Preference */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold font-tech text-primary border-b border-border pb-1.5">Pantalla y Energía</h3>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Mantener pantalla encendida (Wake Lock)</span>
            <input
              type="checkbox"
              checked={wakeLockEnabled}
              onChange={(e) => setWakeLockEnabled(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-primary text-text-primary rounded-xl font-bold font-tech text-xs tracking-wider hover:bg-primary-strong transition-colors"
        >
          GUARDAR AJUSTES
        </button>
      </form>
    </div>
  );
};
export default SettingsPage;
