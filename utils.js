import fsp from "fs/promises";
import { decodeBboxBase32 } from "geohashing";

async function writeToFile(file, data) {
  await fsp.writeFile(file, data);
}

async function readFileData(file) {
  try {
    const data = await fsp.readFile(file, "utf8");
    return data;
  } catch (error) {
    if (error.code === "ENOENT") throw "!!! No file found !!!";
    else console.log({ error });
    return "";
  }
}

async function readJsonFile(file) {
  const data = await fsp.readFile(file);
  return JSON.parse(data);
}

async function appendToFile(file, data) {
  try {
    await fsp.appendFile(file, data);
    console.log(`Written to file ${file}`);
  } catch (error) {
    console.error(`!!! Error: ${file} writing to file:`, err);
  }
}

async function renameFile(file, newFile) {
  await fsp.rename(file, newFile);
}

async function createDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

// Helper function for exponential backoff
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFormattedTimeStamp() {
  return new Date()
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Use 24-hour format
    })
    .replace(/[//,: ]/g, "_");
}

function getBbox(geohash) {
  /**
   * Get the bounding box of a given geohash.
   * Returns [min_lat, min_lon, max_lat, max_lon].
   */
  const { minLat, minLng, maxLat, maxLng } = decodeBboxBase32(geohash);
  return [minLat, minLng, maxLat, maxLng];
}

async function writeNextLevels(geoFile, geohashes) {
  /**
   * Generate the 32 sub-geohashes of the given geohashes.
   */
  const base32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let nextGeohashes = [];
  geohashes.forEach((geohash) => {
    if (!geohash) return;
    nextGeohashes = nextGeohashes.concat(
      base32.split("").map((char) => geohash + char)
    );
  });

  await writeToFile(geoFile, JSON.stringify(nextGeohashes, null, 2));
}

export {
  writeToFile,
  appendToFile,
  readJsonFile,
  renameFile,
  createDir,
  sleep,
  getFormattedTimeStamp,
  getBbox,
  readFileData,
  writeNextLevels,
};
