import { useState, type ImgHTMLAttributes } from "react";

interface ProgressiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  // Classes de TAILLE uniquement (h-16 w-16, h-full w-full, rounded-xl...). Ce conteneur est
  // toujours `relative` en interne (nécessaire pour positionner le skeleton) — ne jamais y passer
  // "absolute" ici : Tailwind fait gagner .relative sur .absolute au niveau du stylesheet quel que
  // soit l'ordre des classes dans l'attribut, donc "absolute" serait silencieusement ignoré et le
  // conteneur se dimensionnerait sur la taille naturelle de l'image au lieu de remplir son parent
  // (bug vécu : image qui déborde et crée une fausse "jointure" visible). Pour remplir un parent
  // positionné, enveloppe <ProgressiveImage> dans un <div className="absolute inset-0"> à l'appel.
  wrapperClassName?: string;
}

// <img> avec un skeleton pulse tant que la photo (Unsplash/randomuser) n'a pas fini de charger.
export function ProgressiveImage({ wrapperClassName = "", className = "", onLoad, ...props }: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && <div className="motion-safe:animate-pulse motion-reduce:opacity-60 absolute inset-0 bg-terracotta-100/70" />}
      <img
        {...props}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </div>
  );
}
