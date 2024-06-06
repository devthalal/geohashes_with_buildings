import { findGeohashesWithBuildings } from "./filterGeoWithBuildings.js";
import { getLocationGeo } from "./getLocationGeo.js";
import * as utils from "./utils.js";

export const generateFromCoordinates = async (filePath) => {
  try {
    /**
     * This function reads the data in coordinates and find all geohashes with that boundary
     * Save the geohases into out/locationGeo.json
     */
    console.time("getLocationGeo process time => ");
    const geoFile = await getLocationGeo(filePath);
    console.timeEnd("getLocationGeo process time => ");

    /**
     * Filter all the geohashes based on overpass-api buildings data
     * Keep  files out/geo_ data,err to keep the progress
     * Save the filtered geohashes in out/geo_filtered*
     */
    console.time("filterGeoWithBuildings process time => ");
    await findGeohashesWithBuildings({ geoFile });
    console.timeEnd("filterGeoWithBuildings process time => ");
  } catch (error) {
    console.log("MAIN ERR => ", error);
  }
};

export const generateFromExistingGeohashes = async (filePath) => {
  try {
    // Read from existing geohashes with building and process with next level

    console.time("Generating next level geohashes process time => ");
    let geoFile = filePath.replace(".txt", ".json");
    const L5 = await utils.readFileData(filePath);
    await utils.writeNextLevels(geoFile, L5.split("\n"));
    console.timeEnd("Generating next level geohashes process time => ");

    console.time("filterGeoWithBuildings process time => ");
    await findGeohashesWithBuildings({
      geoFile,
    });
    console.timeEnd("filterGeoWithBuildings process time => ");
  } catch (error) {
    console.log("MAIN ERR => ", error);
  }
};

export const processWithExistingGeohashes = async (filePath) => {
  try {
    // Read from existing geohashes with building and process with next level

    console.time("Reading geohashes process time => ");
    const L5 = await utils.readFileData(filePath);
    console.timeEnd("Reading geohashes process time => ");

    console.time("filterGeoWithBuildings process time => ");
    await findGeohashesWithBuildings({
      retryGeohashes: L5,
    });
    console.timeEnd("filterGeoWithBuildings process time => ");
  } catch (error) {
    console.log("MAIN ERR => ", error);
  }
};

export const retryFromGeohash = async ({ geoFile, lastProcessedGeo }) => {
  try {
    /**
     * Filter all the geohashes based on overpass-api buildings data
     * Keep  files out/geo_ data,err to keep the progress
     * Save the filtered geohashes in out/geo_filtered*
     */
    console.time("filterGeoWithBuildings process time => ");
    await findGeohashesWithBuildings({ geoFile, lastProcessedGeo });
    console.timeEnd("filterGeoWithBuildings process time => ");
  } catch (error) {
    console.log("MAIN ERR => ", error);
  }
};
