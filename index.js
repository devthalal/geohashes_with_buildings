import {
  generateFromCoordinates,
  generateFromExistingGeohashes,
  processWithExistingGeohashes,
  retryFromGeohash,
} from "./processes.js";

(async () => {
  // await generateFromCoordinates()

  // await processWithExistingGeohashes("./out/geohashes_with_buildings_uk_L5.txt")

  await generateFromExistingGeohashes(
    "./out/geohashes_with_buildings_uk_L5.txt"
  );

  // await retryFromGeohash({
  //   geoFile: "./out/existing_geohashes.json",
  //   lastProcessedGeo: "gcen4r",
  // });
})();
