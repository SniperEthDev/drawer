import React, { useEffect, useState } from "react";
import { useGameStore } from "../../store/useGameStore";
import { db } from "../../db/database";
import { useNavigate } from "react-router-dom";
import { Play, Volume2, ShieldAlert, Award, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { CustomPrize, GameSettings } from "../../domain/bingo/types";
import { SpeechService } from "../../services/speech/SpeechService";
import { cn } from "../../lib/cn";

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const session = useGameStore((state) => state.session);
  const initNewSession = useGameStore((state) => state.initNewSession);

  // Form states
  const [eventName, setEventName] = useState("BINGO MI SUERTE");
  const [operatorName, setOperatorName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [drawMode, setDrawMode] = useState<"MANUAL" | "SEMI_AUTOMATIC" | "AUTOMATIC">("MANUAL");
  const [delay, setDelay] = useState(5);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceRate, setVoiceRate] = useState(0.95);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [repeatAnnouncement, setRepeatAnnouncement] = useState(false);
  const [winnerVoice, setWinnerVoice] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [wakeLock, setWakeLock] = useState(true);
  const [prizes, setPrizes] = useState<CustomPrize[]>([
    { id: "1", name: "Línea", icon: "Award", color: "#8b5cf6", pauseOnClaim: true, finishOnClaim: false, maxWinners: 99 },
    { id: "2", name: "Bingo", icon: "Award", color: "#22c55e", pauseOnClaim: true, finishOnClaim: true, maxWinners: 99 }
  ]);
  
  // Voice test button state
  const [testActive, setTestActive] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("");

  useEffect(() => {
    // Redirect if there is already an active session
    if (session && session.status !== "SETUP" && session.status !== "FINISHED") {
      navigate("/game");
    }
  }, [session, navigate]);

  useEffect(() => {
    // Load Web Speech synthesis voices
    const loadVoices = () => {
      const v = SpeechService.getAvailableVoices();
      if (v.length > 0) {
        setVoicesLoaded(true);
        const saved = SpeechService.getSelectedVoiceName() || "";
        setSelectedVoice(saved || v[0].name);
      }
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTestVoice = () => {
    setTestActive(true);
    if (selectedVoice) {
      SpeechService.selectVoice(selectedVoice);
    }
    SpeechService.testVoice(
      { rate: voiceRate, pitch: voicePitch, volume: voiceVolume },
      () => setTestActive(false)
    );
  };

  const handleAddPrize = () => {
    const newPrize: CustomPrize = {
      id: crypto.randomUUID(),
      name: "Premio Especial",
      icon: "Award",
      color: "#38bdf8",
      pauseOnClaim: true,
      finishOnClaim: false,
      maxWinners: 1
    };
    setPrizes([...prizes, newPrize]);
  };

  const handleRemovePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const handlePrepare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorName.trim()) {
      alert("Por favor, ingresa el nombre del operador.");
      return;
    }

    const settings: GameSettings = {
      eventName,
      operatorName,
      roomName: roomName.trim() || undefined,
      mode: drawMode,
      automaticDelaySeconds: delay,
      voiceEnabled,
      voiceName: selectedVoice || undefined,
      voiceLocale: "es-ES",
      voiceRate,
      voicePitch,
      voiceVolume,
      repeatAnnouncement,
      winnerVoiceAnnouncement: winnerVoice,
      soundsEnabled,
      vibrationEnabled,
      wakeLockEnabled: wakeLock,
      pauseWhenHidden: true,
      customPrizes: prizes
    };

    await initNewSession(settings);
    navigate("/game");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold font-tech text-text-primary tracking-wide mb-2">BULLTECH DRAWER</h1>
        <p className="text-text-secondary text-sm">Configura la partida de bingo de 75 bolas antes de iniciar el sorteo.</p>
      </div>

      <form onSubmit={handlePrepare} className="space-y-6">
        {/* Event Setup */}
        <section className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold font-tech text-primary border-b border-border pb-2">Información del Evento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Nombre del Evento *</label>
              <input
                type="text"
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full h-11 px-4 bg-app-background-soft border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Operador de Turno *</label>
              <input
                type="text"
                required
                placeholder="Nombre del operador"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full h-11 px-4 bg-app-background-soft border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Sala o Mesa (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Mesa Principal, Sala A"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full h-11 px-4 bg-app-background-soft border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>
        </section>

        {/* Draw Mode */}
        <section className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold font-tech text-primary border-b border-border pb-2">Modo de Extracción</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all duration-200 ${drawMode === "MANUAL" ? "border-primary bg-primary/5" : "border-border bg-app-background-soft"}`}>
              <input type="radio" name="drawMode" checked={drawMode === "MANUAL"} onChange={() => setDrawMode("MANUAL")} className="sr-only" />
              <span className="font-bold text-sm text-text-primary mb-1">Manual</span>
              <span className="text-xs text-text-secondary">El operador hace clic en extraer bola una a una.</span>
            </label>
            <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all duration-200 ${drawMode === "SEMI_AUTOMATIC" ? "border-primary bg-primary/5" : "border-border bg-app-background-soft"}`}>
              <input type="radio" name="drawMode" checked={drawMode === "SEMI_AUTOMATIC"} onChange={() => setDrawMode("SEMI_AUTOMATIC")} className="sr-only" />
              <span className="font-bold text-sm text-text-primary mb-1">Semiautomático</span>
              <span className="text-xs text-text-secondary">Prepara la bola y espera a que el operador autorice mostrarla.</span>
            </label>
            <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all duration-200 ${drawMode === "AUTOMATIC" ? "border-primary bg-primary/5" : "border-border bg-app-background-soft"}`}>
              <input type="radio" name="drawMode" checked={drawMode === "AUTOMATIC"} onChange={() => setDrawMode("AUTOMATIC")} className="sr-only" />
              <span className="font-bold text-sm text-text-primary mb-1">Automático</span>
              <span className="text-xs text-text-secondary">Sorteo automático con intervalos configurables de tiempo.</span>
            </label>
          </div>

          {drawMode === "AUTOMATIC" && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Intervalo de Sorteo (2 a 30 segundos)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm font-tech font-bold text-text-primary w-12 text-center">{delay}s</span>
              </div>
            </div>
          )}
        </section>

        {/* Voice and Audio */}
        <section className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold font-tech text-primary border-b border-border pb-2">Configuración de Voz</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-text-primary block">Voz en tiempo real</span>
                <span className="text-xs text-text-secondary">Anunciar por voz la letra y número de cada bola extraída.</span>
              </div>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            {voiceEnabled && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Voz del Sintetizador</label>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Velocidad ({voiceRate}x)</label>
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
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Tono ({voicePitch})</label>
                    <input
                      type="range"
                      min="0.8"
                      max="1.2"
                      step="0.05"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Volumen ({Math.round(voiceVolume * 100)}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voiceVolume}
                      onChange={(e) => setVoiceVolume(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    disabled={testActive}
                    className="flex-1 md:flex-initial h-11 px-6 bg-panel border border-border hover:bg-panel-elevated text-text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Volume2 className="w-4 h-4 text-primary" />
                    {testActive ? "Hablando..." : "Probar Voz"}
                  </button>
                  <span className="text-xs text-text-muted">Es obligatorio verificar o desactivar la voz antes de iniciar.</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Prizes Settings */}
        <section className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-lg font-bold font-tech text-primary">Premios y Validaciones</h2>
            <button
              type="button"
              onClick={handleAddPrize}
              className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Premio
            </button>
          </div>
          <div className="space-y-3">
            {prizes.map((prize) => (
              <div key={prize.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3.5 bg-app-background-soft border border-border rounded-xl">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                  <input
                    type="text"
                    required
                    value={prize.name}
                    onChange={(e) => {
                      setPrizes(prizes.map(p => p.id === prize.id ? { ...p, name: e.target.value } : p));
                    }}
                    className="px-3 py-2 bg-panel border border-border rounded-lg text-text-primary text-xs focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary">Pausar al ganar</span>
                    <input
                      type="checkbox"
                      checked={prize.pauseOnClaim}
                      onChange={(e) => {
                        setPrizes(prizes.map(p => p.id === prize.id ? { ...p, pauseOnClaim: e.target.checked } : p));
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-secondary">Finalizar partida</span>
                    <input
                      type="checkbox"
                      checked={prize.finishOnClaim}
                      onChange={(e) => {
                        setPrizes(prizes.map(p => p.id === prize.id ? { ...p, finishOnClaim: e.target.checked } : p));
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                </div>
                {prizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePrize(prize.id)}
                    className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors align-self-end sm:align-self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Devices Preferences */}
        <section className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold font-tech text-primary border-b border-border pb-2">Preferencias del Dispositivo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 bg-app-background-soft border border-border rounded-xl">
              <div>
                <span className="font-semibold text-xs text-text-primary block">Sonidos de Efectos</span>
                <span className="text-[10px] text-text-secondary">Efectos sintetizados al extraer bolas y ganar.</span>
              </div>
              <input
                type="checkbox"
                checked={soundsEnabled}
                onChange={(e) => setSoundsEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-app-background-soft border border-border rounded-xl">
              <div>
                <span className="font-semibold text-xs text-text-primary block">Vibración Háptica</span>
                <span className="text-[10px] text-text-secondary">Vibrar en móviles compatibles.</span>
              </div>
              <input
                type="checkbox"
                checked={vibrationEnabled}
                onChange={(e) => setVibrationEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-app-background-soft border border-border rounded-xl md:col-span-2">
              <div>
                <span className="font-semibold text-xs text-text-primary block">Mantener pantalla encendida (Wake Lock)</span>
                <span className="text-[10px] text-text-secondary">Evita que la pantalla se apague durante el sorteo.</span>
              </div>
              <input
                type="checkbox"
                checked={wakeLock}
                onChange={(e) => setWakeLock(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
            </div>
          </div>
        </section>

        {/* Regulatory disclaimer */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-3 text-xs text-text-secondary leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Aviso de Privacidad y Operación:</strong> Todos los datos de esta partida se procesan y almacenan únicamente en este dispositivo.
            BULLTECH DRAWER no realiza transacciones de apuestas ni sube información a servidores remotos.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-text-primary hover:bg-primary-strong rounded-xl font-bold font-tech text-sm tracking-wider shadow-lg neon-glow transition-all duration-200"
        >
          PREPARAR PARTIDA
        </button>
      </form>
    </div>
  );
};
export default SetupPage;
