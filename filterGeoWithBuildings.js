import axios from "axios";
import * as utils from "./utils.js";

const LAST = {};
const MAX_RETRIES = 3;
const MIN_BUILDING_COUNT = 1;
const API_BATCH = 20;
let GEO_FILE = `./out/coordinates_geo.json`;
const OUT_DIR = `./out/${utils.getFormattedTimeStamp()}`;
const FILES = {
  last: `${OUT_DIR}/geo_last_.txt`,
  out: `${OUT_DIR}/geo_data_.txt`,
  err: `${OUT_DIR}/geo_err__.txt`,
};
let retryOnErrors = 0;

async function retryRequest(fn, retries = MAX_RETRIES, delay = 1000) {
  let attempts = 0;
  while (attempts < retries) {
    try {
      return await fn();
    } catch (error) {
      const code = error.code;
      const status = error.response?.status;
      if (
        ["ENETUNREACH", "ECONNABORTED", "ETIMEDOUT"].includes(code) ||
        status >= 500 ||
        status == 429
      ) {
        attempts++;
        if (attempts >= retries) {
          throw error;
        }
        console.error(
          `Retrying due to network error or server issue (${attempts}/${retries})...`
        );
        await utils.sleep(delay);
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

async function hasBuildings(bbox) {
  /**
   * Check if there are buildings within the bounding box using the Overpass API.
   * Returns true if buildings are found, false otherwise.
   */
  const overpassUrl = "http://overpass-api.de/api/interpreter";
  const overpassQuery = `
    [out:json];
    (
      way["building"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
      node["building"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
    );
    out count;
    `;

  // relation["building"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});

  return retryRequest(async () => {
    const response = await axios.get(overpassUrl, {
      params: { data: overpassQuery },
    });

    if (response.data?.remark?.includes("error")) throw response.data.remark;

    const ele = response.data?.elements;
    if (!ele) return false;

    const total = parseInt(ele[0].tags?.total || 0);
    return total > MIN_BUILDING_COUNT - 1;
  });
}

async function processGeohashes(geohashes) {
  /**
   * Process geohashes in batches of API_BATCH in parallel.
   */
  for (let i = 0; i < geohashes.length; i += API_BATCH) {
    const logGeohash = [];
    const errDatas = [];
    const batch = geohashes.slice(i, i + API_BATCH);
    const lastProcessedGeo = batch[batch.length - 1];
    const promises = batch.map(async (geohash) => {
      if (!geohash) return true;
      const bbox = utils.getBbox(geohash);
      try {
        const hasData = await hasBuildings(bbox);
        if (hasData) logGeohash.push(geohash);
        return true;
      } catch (error) {
        errDatas.push({ geohash, error: error.message || error });
        return false;
      }
    });

    await Promise.all(promises);

    if (logGeohash.length) {
      await utils.appendToFile(FILES.out, logGeohash.join("\n") + "\n");
    }

    LAST.processed = lastProcessedGeo;
    await utils.writeToFile(FILES.last, lastProcessedGeo);

    if (errDatas.length) {
      await utils.appendToFile(
        FILES.err,
        errDatas.reduce((acc, data) => (acc += `${JSON.stringify(data)}\n`), "")
      );
    }

    console.log(`============== Batch ${i} Done ====================`);
  }
  return true;
}

export const findGeohashesWithBuildings = async (opts) => {
  try {
    await utils.createDir(OUT_DIR);

    const { lastProcessedGeo, retryGeohashes, geoFile } = opts || {};

    if (geoFile) GEO_FILE = geoFile;

    let geoToProcess = retryGeohashes?.length
      ? retryGeohashes
      : await utils.readJsonFile(GEO_FILE);

    LAST.geo = geoToProcess[geoToProcess.length - 1];

    if (lastProcessedGeo) {
      const index = geoToProcess.indexOf(lastProcessedGeo);
      if (index === -1 || index === geoToProcess.length - 1) {
        throw new Error("Last processed geo not found in geo file");
      }
      geoToProcess = geoToProcess.slice(index);
    }

    await processGeohashes(geoToProcess);

    let errors = await utils.readFileData(FILES.err);

    if (errors?.length) {
      const erroredGeohases = errors.split("\n").reduce((acc, v) => {
        const { geohash } = v ? JSON.parse(v) : {};
        if (geohash) acc.push(geohash);
        return acc;
      }, []);

      if (retryOnErrors === MAX_RETRIES) {
        throw "Maximum retries on error reached";
      }
      console.log(
        `Retries since failed geo found! [Retry: ${retryOnErrors}/${MAX_RETRIES}]`
      );
      utils.renameFile(FILES.err, `${OUT_DIR}/geo_err_${retryOnErrors}.txt`);
      retryOnErrors++;
      await findGeohashesWithBuildings({ retryGeohashes: erroredGeohases });
    }

    return errors;
  } catch (error) {
    if (retryOnErrors === MAX_RETRIES) {
      console.log("Maximum retries on error reached");
    } else {
      console.log(error);
      if (LAST.geo !== LAST.processed) {
        retryOnErrors++;
        console.log(
          `Retries since last geo is not last processed geo! [Retry: ${retryOnErrors}/${MAX_RETRIES}]`
        );
        await findGeohashesWithBuildings({ lastProcessedGeo: LAST.processed });
      }
    }
  }
};

// Example usage
// (async () => {
//   await findGeohashesWithBuildings();
// })();
