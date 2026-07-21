import React from "react";
import { HelpCircle, Keyboard, Award, ShieldAlert, BookOpen } from "lucide-react";

export const HelpPage: React.FC = () => {
  const keyboardShortcuts = [
    { key: "N", desc: "Extrae la siguiente bola" },
    { key: "Espacio", desc: "Pausa o reanuda el sorteo" },
    { key: "R", desc: "Repite el anuncio de voz de la última bola" },
    { key: "L", desc: "Abre modal de reclamación de Línea" },
    { key: "B", desc: "Abre modal de reclamación de Bingo" },
    { key: "T", desc: "Abre o cierra el panel del tablero completo" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-tech text-text-primary flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" /> MANUAL DE AYUDA Y ATAJOS
        </h1>
        <p className="text-text-secondary text-xs">Instrucciones de operación de BULLTECH DRAWER y atajos de teclado rápidos.</p>
      </div>

      {/* Keyboard Shortcuts */}
      <section className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold font-tech text-primary flex items-center gap-2 border-b border-border pb-2">
          <Keyboard className="w-5 h-5" /> Atajos de Teclado (Escritorio)
        </h2>
        <p className="text-xs text-text-secondary">Utiliza estos atajos rápidos para operar el sorteo sin necesidad de interactuar con el mouse.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {keyboardShortcuts.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-app-background-soft border border-border rounded-xl">
              <span className="text-xs text-text-primary">{item.desc}</span>
              <kbd className="px-2.5 py-1 bg-panel-elevated border border-border rounded-md font-mono text-xs text-primary font-bold shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </section>

      {/* Manual de Operación */}
      <section className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold font-tech text-primary flex items-center gap-2 border-b border-border pb-2">
          <BookOpen className="w-5 h-5" /> Manual de Operación
        </h2>
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            <strong>1. Configuración de la partida:</strong> Antes de comenzar, debes rellenar la ficha técnica con el nombre de tu evento y la persona operando la mesa. Puedes habilitar el modo Automático si prefieres que la aplicación extraiga las bolas a ritmo continuo.
          </p>
          <p>
            <strong>2. Anunciación de bolas:</strong> Si tienes habilitada la síntesis de voz, se pronunciará la letra y el número en español del 1 al 75. Recuerda pulsar &quot;Activar audio y probar voz&quot; en la configuración inicial para autorizar los permisos de reproducción multimedia del navegador.
          </p>
          <p>
            <strong>3. Registro de Ganadores:</strong> Cuando un participante cante Línea o Bingo, la partida se pausará automáticamente para evitar nuevas extracciones mientras registras el nombre y el cartón del ganador.
          </p>
          <p>
            <strong>4. Anulación de extracciones:</strong> Si se extrae una bola por error mecánico, puedes mantener pulsado el botón rojo de anulación durante 1.5 segundos para marcar esa bola como inválida. La bola permanecerá en el log de auditoría para total transparencia, pero ya no contará para comprobar premios.
          </p>
        </div>
      </section>

      {/* Aviso Regulatorio */}
      <section className="p-5 bg-warning/5 border border-warning/20 rounded-2xl flex gap-3 text-xs text-text-secondary leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-text-primary mb-1">Aviso Regulatorio Obligatorio</h4>
          <p>
            BULLTECH DRAWER es una herramienta operativa para sorteos de bingo. La aleatoriedad utiliza las capacidades criptográficas del navegador y mantiene un registro local de auditoría. Esto no implica certificación regulatoria. Para actividades con dinero real, premios regulados o explotación comercial, el operador debe comprobar y cumplir la legislación aplicable y los requisitos de certificación de su jurisdicción.
          </p>
        </div>
      </section>
    </div>
  );
};
export default HelpPage;
