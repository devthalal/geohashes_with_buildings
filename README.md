# WithBuildingGeos

## Solution  

* Get the coordinates of the polygon (PinCode location).
* Find all the center points within a passed radius inside the polygon.
* Find the geohashes of these center points.

* Process time is around 110.055ms for given co-ordinates

## Installation

Ensure you have Node.js installed. Clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/your-repository/geohashpack.git
cd geohashpack
npm install
```

## Usage

Run the script using the following command:
```bash
node index.js
```

Check the `out/` folder for the output geohashes.

To visualize the GeoHashes from your text files using the provided link, follow these steps:

* Open the Link: Navigate to https://bhargavchippada.github.io/mapviz/.
* Locate the Text Files: Go to your solutions folder and open each text file containing the GeoHashes.
* Copy the GeoHashes: Select and copy the GeoHashes from each text file. Ensure that each GeoHash is on a new line or separated by commas, depending on the format required by the tool.
* Paste into GeoHashes Input Box:
    Find the input box labeled "GeoHashes" on the webpage.
    Paste the copied GeoHashes into this input box.

## Dependencies

The package relies on the following Node.js modules:

fs for file system operations.
turf for geospatial operations.
Make sure to install the dependencies using npm install before running the script.
