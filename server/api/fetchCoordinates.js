// method to fetch coordinates for an office address using Google Maps Geocoding API
async function fetchOfficeCoordinates(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const encodedAddress = encodeURIComponent(address);
  const endpointUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await fetch(endpointUrl);
    const data = await response.json();

    if (data.status !== "OK" || data.status === "ZERO_RESULTS") {
      throw new Error(`No results found for address: ${address}`);
    }

    const location = data.results[0].geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch (error) {
    throw new Error(`Error fetching coordinates for address: ${error}`);
  }
}

module.exports = { fetchOfficeCoordinates };
