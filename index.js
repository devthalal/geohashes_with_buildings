import { findGeohashesWithBuildings } from "./filterGeoWithBuildings.js";
import { getLocationGeo } from "./getLocationGeo.js";

(async () => {
  try {
    /**
     * This function reads the data in coordinates and find all geohashes with that boundary
     * Save the geohases into out/locationGeo.json
     */
    console.time("getLocationGeo process time => ");
    await getLocationGeo();
    console.timeEnd("getLocationGeo process time => ");

    /**
     * Filter all the geohashes based on overpass-api buildings data
     * Keep  files out/geo_ data,err to keep the progress
     * Save the filtered geohashes in out/geo_filtered*
     */
    console.time("filterGeoWithBuildings process time => ");
    await findGeohashesWithBuildings();
    console.timeEnd("filterGeoWithBuildings process time => ");
  } catch (error) {
    console.log("MAIN ERR => ", error);
  }
})();
