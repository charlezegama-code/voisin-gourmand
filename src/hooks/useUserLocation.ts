import { useEffect, useState } from "react";
import { PARIS_CENTER } from "../lib/geo";

interface LatLng {
  lat: number;
  lng: number;
}

// Position de l'utilisateur si autorisée, sinon repli sur le centre de Paris (démo).
export function useUserLocation(): { location: LatLng; isPrecise: boolean } {
  const [location, setLocation] = useState<LatLng>(PARIS_CENTER);
  const [isPrecise, setIsPrecise] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsPrecise(true);
      },
      () => {
        // permission refusée ou indisponible : on garde le repli Paris
      },
      { timeout: 5000, maximumAge: 60_000 }
    );
  }, []);

  return { location, isPrecise };
}
