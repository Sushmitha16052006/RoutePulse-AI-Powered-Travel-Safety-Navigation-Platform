import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load routes dataset once at startup
const routesData = JSON.parse(
  readFileSync(path.join(__dirname, "../Data/routes.json"), "utf-8")
);

const allLines = [...routesData.metro, ...routesData.bus];

// ─── helpers ────────────────────────────────────────────────────────────────
const normalize = (s) => s.trim().toLowerCase();

/** Find every line that contains a station name (fuzzy match) */
const findLinesForStation = (stationName) => {
  const n = normalize(stationName);
  return allLines.filter((line) =>
    line.stations.some((s) => normalize(s).includes(n) || n.includes(normalize(s)))
  );
};

/** Resolve the best matching station name from a line's stations */
const resolveStation = (line, query) => {
  const n = normalize(query);
  return line.stations.find(
    (s) => normalize(s).includes(n) || n.includes(normalize(s))
  );
};

/** Get platform number based on travel direction */
const getPlatform = (line, srcIndex, destIndex) => {
  const direction = destIndex > srcIndex ? "towards_end" : "towards_start";
  // Try exact station first, then fallback
  for (const [station, info] of Object.entries(line.platforms || {})) {
    // rough check — any configured station in our direction
    const si = line.stations.indexOf(station);
    if (si >= 0) {
      const p = info[direction];
      if (p) return p;
    }
  }
  return destIndex > srcIndex ? 1 : 2;
};

// ─── controller ─────────────────────────────────────────────────────────────
export const GetGuidance = (req, res) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ message: "source and destination are required" });
    }

    if (normalize(source) === normalize(destination)) {
      return res.status(400).json({ message: "Source and destination cannot be the same" });
    }

    // Find lines containing both stations
    const srcLines  = findLinesForStation(source);
    const destLines = findLinesForStation(destination);

    // Direct line: appears in both
    const directLine = srcLines.find((l) => destLines.some((d) => d.lineId === l.lineId));

    if (!directLine) {
      // Try interchange via Ameerpet (common hub)
      const HUB = "Ameerpet";
      const leg1Line = srcLines.find((l) =>
        l.stations.some((s) => normalize(s) === normalize(HUB))
      );
      const leg2Line = destLines.find((l) =>
        l.stations.some((s) => normalize(s) === normalize(HUB))
      );

      if (leg1Line && leg2Line) {
        return buildInterchangeGuidance(res, source, destination, leg1Line, leg2Line, HUB);
      }

      return res.status(404).json({
        message: `No route found between "${source}" and "${destination}". Try stations on Red, Blue, or Green metro lines.`,
      });
    }

    return buildDirectGuidance(res, source, destination, directLine);
  } catch (err) {
    console.error("Guidance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── build direct guidance ──────────────────────────────────────────────────
function buildDirectGuidance(res, sourceQuery, destQuery, line) {
  const srcStation  = resolveStation(line, sourceQuery);
  const destStation = resolveStation(line, destQuery);
  const srcIndex    = line.stations.indexOf(srcStation);
  const destIndex   = line.stations.indexOf(destStation);

  const goingForward = destIndex > srcIndex;
  const stopsCount   = Math.abs(destIndex - srcIndex);
  const stopsAlong   = goingForward
    ? line.stations.slice(srcIndex + 1, destIndex + 1)
    : line.stations.slice(destIndex, srcIndex).reverse();

  const platform   = getPlatform(line, srcIndex, destIndex);
  const towards    = goingForward ? line.stations[line.stations.length - 1] : line.stations[0];
  const exitSide   = line.exitSide;

  const timeEstimate = stopsCount * (line.type === "metro" ? 3 : 5); // mins per stop

  res.json({
    type     : "direct",
    lineName : line.lineName,
    lineColor: line.color,
    lineType : line.type,
    source   : srcStation,
    destination: destStation,
    platform,
    towards,
    direction: goingForward ? "forward" : "backward",
    stopsCount,
    stopsAlong,
    exitSide,
    frequency: line.frequency || "10 min",
    estimatedMinutes: timeEstimate,
    steps: [
      {
        icon: "platform",
        text: `Board at Platform ${platform} — towards ${towards}`,
        detail: `Frequency: every ${line.frequency || "10 min"}`,
      },
      {
        icon: "train",
        text: `Ride ${stopsCount} stop${stopsCount !== 1 ? "s" : ""} on ${line.lineName}`,
        detail: `Next stop after boarding: ${stopsAlong[0] || destStation}`,
      },
      {
        icon: "exit",
        text: `Exit on the ${exitSide} side at ${destStation}`,
        detail: `Estimated travel time: ~${timeEstimate} min`,
      },
    ],
  });
}

// ─── build interchange guidance ─────────────────────────────────────────────
function buildInterchangeGuidance(res, sourceQuery, destQuery, leg1, leg2, hubName) {
  const srcStation  = resolveStation(leg1, sourceQuery);
  const hubOnLeg1   = resolveStation(leg1, hubName);
  const hubOnLeg2   = resolveStation(leg2, hubName);
  const destStation = resolveStation(leg2, destQuery);

  const leg1Src  = leg1.stations.indexOf(srcStation);
  const leg1Hub  = leg1.stations.indexOf(hubOnLeg1);
  const leg2Hub  = leg2.stations.indexOf(hubOnLeg2);
  const leg2Dest = leg2.stations.indexOf(destStation);

  const stops1     = Math.abs(leg1Hub - leg1Src);
  const stops2     = Math.abs(leg2Dest - leg2Hub);
  const toward1    = leg1Hub > leg1Src ? leg1.stations[leg1.stations.length - 1] : leg1.stations[0];
  const toward2    = leg2Dest > leg2Hub ? leg2.stations[leg2.stations.length - 1] : leg2.stations[0];
  const platform1  = getPlatform(leg1, leg1Src, leg1Hub);
  const platform2  = getPlatform(leg2, leg2Hub, leg2Dest);
  const totalStops = stops1 + stops2;
  const totalTime  = stops1 * 3 + 5 + stops2 * 3; // interchange penalty

  res.json({
    type        : "interchange",
    lineName    : `${leg1.lineName} → ${leg2.lineName}`,
    lineColor   : leg1.color,
    lineType    : "metro",
    source      : srcStation,
    destination : destStation,
    interchange : hubName,
    platform    : platform1,
    towards     : toward1,
    stopsCount  : totalStops,
    estimatedMinutes: totalTime,
    frequency   : leg1.frequency || "6 min",
    exitSide    : leg2.exitSide,
    steps: [
      {
        icon  : "platform",
        text  : `Board at Platform ${platform1} — towards ${toward1}`,
        detail: `${leg1.lineName} · every ${leg1.frequency || "6 min"}`,
      },
      {
        icon  : "train",
        text  : `Ride ${stops1} stop${stops1 !== 1 ? "s" : ""} to ${hubName}`,
        detail: `Interchange station — follow signs for ${leg2.lineName}`,
      },
      {
        icon  : "interchange",
        text  : `Change to Platform ${platform2} at ${hubName}`,
        detail: `Board ${leg2.lineName} towards ${toward2}`,
      },
      {
        icon  : "train",
        text  : `Ride ${stops2} more stop${stops2 !== 1 ? "s" : ""} to ${destStation}`,
        detail: `${leg2.lineName} · every ${leg2.frequency || "6 min"}`,
      },
      {
        icon  : "exit",
        text  : `Exit on the ${leg2.exitSide} side at ${destStation}`,
        detail: `Total journey ~${totalTime} min`,
      },
    ],
  });
}

export const GetAllStations = (_req, res) => {
  const stations = [...new Set(allLines.flatMap((l) => l.stations))].sort();
  res.json({ stations, lines: allLines.map((l) => ({ lineId: l.lineId, lineName: l.lineName, type: l.type, color: l.color })) });
};
