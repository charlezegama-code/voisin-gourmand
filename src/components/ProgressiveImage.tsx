import { useState, type ImgHTMLAttributes } from "react";

interface ProgressiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
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
