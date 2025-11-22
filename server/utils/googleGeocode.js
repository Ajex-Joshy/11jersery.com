import axios from "axios";

export const geocodeAddress = async (address) => {
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  const { data } = await axios.get(url);
  if (!data.results || data.results.length === 0) {
    throw new Error("Google could not validate this address");
  }

  return data.results[0];
};
