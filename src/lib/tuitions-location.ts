/**
 * The tuition centre's name, address and phone (NAP) in one place. The
 * footer, the Tuitions contact block, /contact and the LocalBusiness JSON-LD
 * all read from here, because local ranking depends on these matching each
 * other and the Google Business Profile character for character.
 *
 * There is one centre. Kalyan Nagar, HRBR Layout and the rest are areas it
 * serves, never claimed as branches.
 */
export const CENTRE = {
  name: "Chalkboard Tuitions",
  street: "2nd Floor, Pooja Arcade, 50/2, Kammanahalli Main Rd",
  area: "St Thomas Town, Kammanahalli",
  city: "Bengaluru",
  region: "Karnataka",
  postalCode: "560084",
  phone: "+917411446381",
  phoneDisplay: "+91 74114 46381",
  // The Google Business Profile pin — Google trusts its own coordinates.
  geo: { latitude: 13.0158889, longitude: 77.6361816 },
  mapsUrl: "https://maps.app.goo.gl/GUPsuattjnL3HrsT7",
  hours: { days: "Monday to Friday", opens: "16:00", closes: "20:00", display: "4–8 PM, Monday to Friday" },
  facebook: "https://www.facebook.com/p/ChalkBoard-Tutions-61556611419426/",
  instagram: "https://www.instagram.com/chalkboard.tuitions/",
  /** Neighbourhoods families come from — areas served, not locations. */
  areasServed: ["Kammanahalli", "Kalyan Nagar", "HRBR Layout", "Banaswadi", "St Thomas Town", "Lingarajapuram", "Bengaluru"],
} as const;

/** "2nd Floor, Pooja Arcade, …, Bengaluru 560084" — the one-line form shown on the site. */
export const CENTRE_ADDRESS = `${CENTRE.street}, ${CENTRE.area}, ${CENTRE.city} ${CENTRE.postalCode}`;
