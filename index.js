import {
  generateFromCoordinates,
  generateFromExistingGeohashes,
  processWithExistingGeohashes,
} from "./processes.js";

(async () => {
  // await generateFromCoordinates()
  await generateFromExistingGeohashes("./out/geohashes_with_buildings_uk_L5.txt");
  // await processWithExistingGeohashes("./out/geohashes_with_buildings_uk_L5.txt")
})();
