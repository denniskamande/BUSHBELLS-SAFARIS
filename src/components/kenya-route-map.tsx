import { useEffect, useMemo, useState } from "react";
import kenyaOutline from "@/assets/kenya-outline.svg";

export type RouteStop = { id: string; name: string; dayLabel?: string };
type CursorPosition = { x: number; y: number; angle: number; stopIndex: number | null };

const locations: Record<string, [number, number]> = {
  "maasai-mara": [78, 320],
  amboseli: [183, 383],
  nakuru: [124, 265],
  nairobi: [161, 315],
  samburu: [197, 220],
  tsavo: [250, 400],
  mombasa: [304, 453],
  naivasha: [138, 286],
  nanyuki: [174, 249],
  "aberdare-ranges": [155, 270],
  "mount-kenya": [185, 243],
  "ol-pejeta": [165, 250],
  diani: [300, 465],
  "hells-gate": [135, 295],
  "lake-bogoria": [125, 240],
  "tsavo-east": [270, 400],
  "tsavo-west": [220, 400],
};

export function KenyaRouteMap({
  stops,
  startAtNairobi = false,
  endAt,
}: {
  stops: RouteStop[];
  startAtNairobi?: boolean;
  endAt?: { id: string; name: string };
}) {
  const [cursor, setCursor] = useState<CursorPosition | null>(null);
  const mappedStops = useMemo(
    () =>
      stops.flatMap((stop, index) => {
        const point = locations[stop.id];
        return point ? [{ stop, index, x: point[0], y: point[1] }] : [];
      }),
    [stops],
  );

  if (!mappedStops.length) return null;

  const hasNairobiStop = mappedStops.some(({ stop }) => stop.id === "nairobi");
  const includeStart = startAtNairobi && !hasNairobiStop;
  const endPoint = endAt ? locations[endAt.id] : undefined;
  const route = useMemo(
    () => [
      ...(includeStart
        ? [
            {
              stop: { id: "nairobi-start", name: "Nairobi", dayLabel: "Start" },
              index: -1,
              x: 161,
              y: 315,
            },
          ]
        : []),
      ...mappedStops,
      ...(endAt && endPoint
        ? [
            {
              stop: { id: `end-${endAt.id}`, name: endAt.name, dayLabel: "End" },
              index: mappedStops.length,
              x: endPoint[0],
              y: endPoint[1],
            },
          ]
        : []),
    ],
    [endAt, endPoint, includeStart, mappedStops],
  );
  const routePath =
    route.length > 1 ? `M ${route.map(({ x, y }) => `${x} ${y}`).join(" L ")}` : "";
  const sharedNairobiFinish =
    includeStart &&
    route.at(-1)?.x === 161 &&
    route.at(-1)?.y === 315;
  const markerStops = sharedNairobiFinish ? route.slice(0, -1) : route;

  useEffect(() => {
    if (route.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frameId = 0;
    let timerId = 0;
    let cancelled = false;
    const pauseAtStop = (stopIndex: number) => {
      if (cancelled) return;
      const stop = route[stopIndex];
      const next = route[(stopIndex + 1) % route.length];
      const angle = (Math.atan2(next.y - stop.y, next.x - stop.x) * 180) / Math.PI;
      setCursor({ x: stop.x, y: stop.y, angle, stopIndex });
      const pause = stop.stop.dayLabel === "Start" || stop.stop.dayLabel === "End" ? 1000 : 1650;
      timerId = window.setTimeout(() => travelToStop((stopIndex + 1) % route.length), pause);
    };

    const travelToStop = (stopIndex: number) => {
      if (cancelled) return;
      const fromIndex = (stopIndex - 1 + route.length) % route.length;
      const from = route[fromIndex];
      const to = route[stopIndex];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.hypot(dx, dy);
      const duration = Math.max(750, distance * 12);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      let startedAt = 0;
      setCursor({ x: from.x, y: from.y, angle, stopIndex: null });

      const step = (now: number) => {
        if (cancelled) return;
        if (!startedAt) startedAt = now;
        const progress = Math.min(1, (now - startedAt) / duration);
        setCursor({
          x: from.x + dx * progress,
          y: from.y + dy * progress,
          angle,
          stopIndex: null,
        });
        if (progress < 1) frameId = window.requestAnimationFrame(step);
        else pauseAtStop(stopIndex);
      };

      frameId = window.requestAnimationFrame(step);
    };

    timerId = window.setTimeout(() => pauseAtStop(0), 3200);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
    };
  }, [route]);

  const activeStop = cursor?.stopIndex === null || cursor?.stopIndex === undefined
    ? undefined
    : route[cursor.stopIndex];
  const tooltipWidth = activeStop ? Math.min(210, Math.max(112, activeStop.stop.name.length * 5.5 + 20)) : 0;
  const tooltipX = activeStop && cursor
    ? Math.max(4, Math.min(416 - tooltipWidth, cursor.x - tooltipWidth / 2))
    : 0;
  const tooltipY = cursor ? Math.max(4, cursor.y - 54) : 0;

  return (
    <section className="kenya-route-card" aria-label="Safari route across Kenya">
      <div className="kenya-route-heading">
        <div>
          <span className="eyebrow">KENYA ROUTE</span>
          <p>Follow the journey from stop to stop</p>
        </div>
        <span className="kenya-route-count">
          {mappedStops.length} {mappedStops.length === 1 ? "stop" : "stops"}
        </span>
      </div>
      <div className="kenya-route-layout">
        <div className="kenya-map-frame">
          <svg
            className="kenya-map"
            viewBox="0 0 420 500"
            role="img"
            aria-label={`Map of Kenya showing ${mappedStops.length} safari stops connected in itinerary order`}
          >
            <defs>
              <filter id="route-marker-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#172217" floodOpacity=".2" />
              </filter>
              <marker
                id="safari-route-arrow"
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="5"
                markerHeight="5"
                markerUnits="userSpaceOnUse"
                orient="auto"
              >
                <path className="kenya-route-arrowhead" d="M 0 0 L 8 4 L 0 8 Z" />
              </marker>
            </defs>
            <rect width="420" height="500" fill="#f4f0e5" />
            <path
              d="M 420 324 C 389 344 364 365 352 392 C 341 418 350 447 374 469 C 391 485 405 494 420 500 Z"
              fill="#d8eaf1"
            />
            {/* Public-domain Kenya outline from Wikimedia Commons, based on geographic data. */}
            <image href={kenyaOutline} x="0" y="0" width="420" height="500" />
            <g className="kenya-map-geography" aria-hidden="true">
              <path className="kenya-map-water-shape" d="M 0 286 C 20 278 45 282 66 297 L 76 315 C 58 324 31 322 0 310 Z" />
              <path className="kenya-map-water-shape" d="M 113 65 C 121 51 132 54 135 69 L 142 103 C 144 118 137 134 130 139 C 120 127 116 105 113 65 Z" />
              <ellipse className="kenya-map-water-shape" cx="125" cy="264" rx="7" ry="4" />
              <ellipse className="kenya-map-water-shape" cx="138" cy="286" rx="8" ry="5" />
              <path className="kenya-map-rift" d="M 123 131 C 115 176 131 205 123 241 C 119 260 132 275 138 292" />
              <ellipse className="kenya-map-reserve" cx="79" cy="321" rx="26" ry="17" />
              <ellipse className="kenya-map-reserve" cx="198" cy="220" rx="25" ry="19" />
              <ellipse className="kenya-map-reserve" cx="164" cy="251" rx="22" ry="14" />
              <ellipse className="kenya-map-reserve" cx="124" cy="265" rx="16" ry="11" />
              <ellipse className="kenya-map-reserve" cx="138" cy="286" rx="17" ry="10" />
              <ellipse className="kenya-map-reserve" cx="183" cy="383" rx="26" ry="18" />
            </g>
            {routePath && (
              <>
                <path className="kenya-route-underlay" d={routePath} pathLength={1} />
                <path
                  id="safari-route-path"
                  className="kenya-route-line"
                  d={routePath}
                  pathLength={1}
                  markerMid="url(#safari-route-arrow)"
                  markerEnd="url(#safari-route-arrow)"
                />
              </>
            )}
            {markerStops.map((point, routeIndex) => (
              <g className="kenya-route-marker" key={`${point.stop.id}-${routeIndex}`}>
                <circle
                  className="kenya-route-marker-ring"
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  style={{ animationDelay: `${routeIndex * 0.4}s` }}
                />
                <circle className="kenya-route-marker-dot" cx={point.x} cy={point.y} r="4.5" />
              </g>
            ))}
            {cursor && (
              <g
                className="kenya-route-cursor"
                transform={`translate(${cursor.x} ${cursor.y}) rotate(${cursor.angle})`}
                aria-hidden="true"
              >
                <path d="M -6 -4.5 L 6 0 L -6 4.5 Z" />
              </g>
            )}
            {activeStop && cursor && (
              <g className="kenya-stop-tooltip" aria-hidden="true">
                <path
                  className="kenya-stop-tooltip-leader"
                  d={`M ${cursor.x} ${cursor.y - 9} L ${cursor.x} ${tooltipY + 42}`}
                />
                <g transform={`translate(${tooltipX} ${tooltipY})`}>
                  <rect className="kenya-stop-tooltip-box" width={tooltipWidth} height="42" rx="5" />
                  <text className="kenya-stop-tooltip-day" x="9" y="15">
                    {activeStop.stop.dayLabel ?? `Day ${activeStop.index + 1}`}
                  </text>
                  <text className="kenya-stop-tooltip-name" x="9" y="32">
                    {activeStop.stop.name.length > 29
                      ? `${activeStop.stop.name.slice(0, 27)}…`
                      : activeStop.stop.name}
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>
        <ol className="kenya-route-stops" aria-label="Safari stops in route order">
          {route.map(({ stop, index }) => (
            <li key={`${stop.id}-${index}`}>
              <span>{stop.dayLabel ?? `Stop ${index + 1}`}</span>
              <strong>{stop.name}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
