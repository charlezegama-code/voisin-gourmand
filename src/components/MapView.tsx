import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PARIS_CENTER } from "../lib/geo";
import { StarRating } from "./StarRating";
import type { CookListItem } from "../lib/api";

const CUISINE_EMOJI: Record<string, string> = {
  Française: "🥐",
  Maghrébine: "🍛",
  Asiatique: "🍜",
  Africaine: "🍲",
  Italienne: "🍝",
};

function cookIcon(cook: CookListItem) {
  const emoji = CUISINE_EMOJI[cook.specialty] ?? "🍽️";
  return divIcon({
    className: "",
    html: `<div class="relative flex flex-col items-center">
      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500 text-base shadow-lg ring-2 ring-white">${emoji}</div>
      <div class="-mt-0.5 h-2 w-2 rotate-45 bg-terracotta-500"></div>
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  });
}

function RecenterOnChange({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);
  return null;
}

interface MapViewProps {
  cooks: CookListItem[];
  center?: [number, number];
}

export function MapView({ cooks, center }: MapViewProps) {
  const mapCenter: [number, number] = center ?? [PARIS_CENTER.lat, PARIS_CENTER.lng];

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterOnChange center={mapCenter} />
      {cooks.map((cook) => (
        <Marker key={cook.id} position={[cook.lat, cook.lng]} icon={cookIcon(cook)}>
          <Popup>
            <div className="min-w-[180px] space-y-1">
              <p className="font-semibold text-ink">{cook.name}</p>
              <p className="text-xs text-ink/60">
                {cook.specialty} · {cook.neighborhood}
              </p>
              <StarRating rating={cook.rating} size="sm" />
              <p className="text-xs font-medium text-terracotta-600">
                {cook.minPrice != null ? `dès ${cook.minPrice.toFixed(2)}€` : "—"}
              </p>
              <Link
                to={`/cuisiniers/${cook.id}`}
                className="mt-1 inline-block rounded-full bg-terracotta-500 px-3 py-1 text-xs font-semibold text-white"
              >
                Voir la fiche
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
