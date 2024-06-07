import { encodeBase32 } from "geohashing";
import * as turf from "@turf/turf";
import * as utils from "./utils.js";

/**
 * Solution
 *
 * Get the co-ordinates of the polygon
 * Find all the centre points within passed radius in the polygon
 * Find its geohash
 * For accuracy keep the radius .0003 for 7 letter geohash
 */

const RADIUS = 0.0003; // Radius of circles to fill the polygon
const GEO_LENGTH = 6;
const COORDINATE_FILE = "./coordinates.json";
const OUT_FILE = "./out/coordinates_geo";

// Function to generate a random polygon
async function generateRandomPolygon(filePath) {
  const points = await utils.readJsonFile(filePath || COORDINATE_FILE);

  // Return a polygon using turf.js
  return turf.polygon([points]);
}

// Function to find all centers inside the polygon & get its geohash
function findCentersInsidePolygon(polygon, radius) {
  const bbox = turf.bbox(polygon); // Calculate bounding box of the polygon
  const [minX, minY, maxX, maxY] = bbox;

  // const centers = [];
  const geoHashes = [];

  for (let x = minX; x <= maxX; x += radius * 2) {
    for (let y = minY; y <= maxY; y += radius * 2) {
      const center = turf.point([x, y]);
      if (turf.booleanPointInPolygon(center, polygon)) {
        // centers.push(center);
        const cords = center.geometry.coordinates;
        geoHashes.push(encodeBase32(cords[1], cords[0], GEO_LENGTH));
      }
    }
  }

  // return { centers: centers.map((c) => c.geometry.coordinates), geoHashes };
  return geoHashes;
}

export const getLocationGeo = async (filePath) => {
  // Example usage
  const polygon = await generateRandomPolygon(filePath);
  const geoHashes = [...new Set(findCentersInsidePolygon(polygon, RADIUS))];

  utils.writeToFile(
    `${OUT_FILE}.txt`,
    geoHashes.reduce((acc, c) => (acc += `${c}\n`), "")
  );

  await utils.writeToFile(
    `${OUT_FILE}.json`,
    JSON.stringify(geoHashes, null, 2)
  );

  return `${OUT_FILE}.json`;
};
