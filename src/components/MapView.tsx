import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, BadgeCheck } from "lucide-react";
import { PARIS_CENTER } from "../lib/geo";
import { StarRating } from "./StarRating";
import type { CookListItem } from "../lib/api";

// Couleur d'anneau du pin = statut du cuisinier (fonctionnalité existante, conservée).
// Une légende discrète en bas de carte explique ce code couleur — voir <MapLegend>.
const RING_DEFAULT = "#c45a33"; // terracotta — disponible normalement
const RING_NEW = "#4a7c59"; // sage — nouveau sur la plateforme
const RING_SOLDOUT = "#9a8f85"; // gris — complet aujourd'hui

function cookIcon(cook: CookListItem, index: number) {
  const ring = cook.soldOutToday ? RING_SOLDOUT : cook.isNew ? RING_NEW : RING_DEFAULT;
  const delay = Math.min(index * 45, 900);
  return divIcon({
    className: "",
    html: `<div class="vg-marker" style="animation-delay:${delay}ms">
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="width:44px;height:44px;border-radius:9999px;padding:3px;background:${ring};box-shadow:0 4px 12px -2px rgba(43,33,25,0.35);box-sizing:border-box;">
          <img src="${cook.avatarUrl}" style="width:38px;height:38px;border-radius:9999px;object-fit:cover;display:block;border:2px solid white;box-sizing:border-box;" />
        </div>
        <div style="width:9px;height:9px;margin-top:-4px;transform:rotate(45deg);background:${ring};box-shadow:2px 2px 3px -1px rgba(43,33,25,0.25);"></div>
      </div>
    </div>`,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -48],
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

function MapLegend() {
  const items: { color: string; label: string }[] = [
    { color: RING_DEFAULT, label: "Disponible" },
    { color: RING_NEW, label: "Nouveau" },
    { color: RING_SOLDOUT, label: "Complet" },
  ];

  return (
    <div className="absolute bottom-2.5 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-medium text-ink/70 shadow-md ring-1 ring-black/5">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function MapView({ cooks, center }: MapViewProps) {
  const mapCenter: [number, number] = center ?? [PARIS_CENTER.lat, PARIS_CENTER.lng];

  return (
    <div className="relative h-full w-full">
    <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="h-full w-full" attributionControl={true}>
      {/* Fond de carte clair et épuré, gratuit et sans clé API (Esri Light Gray Canvas) */}
      <TileLayer
        attribution="Tiles &copy; Esri — Esri, HERE, Garmin, FAO, NOAA, USGS"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />
      <RecenterOnChange center={mapCenter} />
      {cooks.map((cook, index) => (
        <Marker key={cook.id} position={[cook.lat, cook.lng]} icon={cookIcon(cook, index)}>
          <Popup>
            <div className="flex min-w-[190px] gap-2.5">
              <img src={cook.avatarUrl} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1">
                  <p className="truncate font-bold text-ink">{cook.name}</p>
                  {cook.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sage-600" strokeWidth={2.5} />}
                </div>
                <p className="truncate text-xs text-ink/55">
                  {cook.specialty} · {cook.neighborhood}
                </p>
                <StarRating rating={cook.rating} size="sm" />
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-xs font-bold text-terracotta-600">
                    {cook.minPrice != null ? `dès ${cook.minPrice.toFixed(2)}€` : "—"}
                  </span>
                  <Link
                    to={`/cuisiniers/${cook.id}`}
                    className="flex items-center gap-0.5 rounded-full bg-terracotta-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                  >
                    Voir la fiche
                    <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    <MapLegend />
    </div>
  );
}
