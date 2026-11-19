"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/** Aviso fino arriba cuando el móvil se queda sin conexión. */
export default function SinConexion() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const actualizar = () => setOffline(!navigator.onLine);
    actualizar();
    window.addEventListener("online", actualizar);
    window.addEventListener("offline", actualizar);
    return () => {
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", actualizar);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-300 px-4 py-1.5 text-center text-xs font-bold text-kanot-navy-deep">
      <WifiOff size={14} /> Sin conexión · estás viendo lo último que se guardó
    </div>
  );
}
