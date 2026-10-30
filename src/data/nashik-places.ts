/**
 * Curated list of prominent Nashik landmarks, hubs, and transit nodes.
 * Coordinates are approximate GPS centroids in decimal degrees for Nashik, Maharashtra.
 * All places include localized names and search aliases for accent/spelling insensitivity.
 */

export interface CuratedPlace {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  aliases: string[]; // Search tokens and alternative names in en/hi/mr
  latitude: number;
  longitude: number;
  description?: string;
}

export const NASHIK_CURATED_PLACES: CuratedPlace[] = [
  {
    id: "cbs",
    name: "CBS (Central Bus Stand)",
    nameHi: "सीबीएस (सेंट्रल बस स्टैंड)",
    nameMr: "सीबीएस (मध्यवर्ती बस स्थानक)",
    aliases: ["cbs", "c.b.s", "central bus stand", "central bus station", "st stand", "सीबीएस", "सेंट्रल बस स्टैंड", "मध्यवर्ती बस स्थानक"],
    // Approximate coordinates: 19.9975° N, 73.7898° E (Old CBS circle)
    latitude: 19.9975,
    longitude: 73.7898,
    description: "Central Bus Stand & Shalimar transit hub",
  },
  {
    id: "canada-corner",
    name: "Canada Corner",
    nameHi: "कनाडा कॉर्नर",
    nameMr: "कॅनडा कॉर्नर",
    aliases: ["canada corner", "canada chowk", "sharanpur link road", "कनाडा कॉर्नर", "कॅनडा कॉर्नर"],
    // Approximate coordinates: 20.0019° N, 73.7801° E (Canada Corner intersection)
    latitude: 20.0019,
    longitude: 73.7801,
    description: "Commercial junction connecting College Road & Old Agra Rd",
  },
  {
    id: "college-road",
    name: "College Road (BYK / BPK)",
    nameHi: "कॉलेज रोड (बीवाईके कॉलेज)",
    nameMr: "कॉलेज रोड (बीवायके कॉलेज)",
    aliases: ["college road", "byk", "bpk", "rk", "bhonsala", "कॉलेज रोड", "बीवाईके"],
    // Approximate coordinates: 20.0102° N, 73.7634° E (BYK College circle)
    latitude: 20.0102,
    longitude: 73.7634,
    description: "Major youth, retail, and academic corridor",
  },
  {
    id: "panchavati",
    name: "Panchavati (Ramkund)",
    nameHi: "पंचवटी (रामकुंड)",
    nameMr: "पंचवटी (रामकुंड)",
    aliases: ["panchavati", "ramkund", "kalaram temple", "sita gumpha", "पंचवटी", "रामकुंड"],
    // Approximate coordinates: 20.0076° N, 73.7997° E (Godavari River Ghats)
    latitude: 20.0076,
    longitude: 73.7997,
    description: "Historic cultural & pilgrimage river precinct",
  },
  {
    id: "satpur",
    name: "Satpur MIDC",
    nameHi: "सातपुर एमआईडीसी",
    nameMr: "सातपूर एमआयडीसी",
    aliases: ["satpur", "satpur midc", "nice area", "trimbak naka satpur", "सातपुर", "सातपूर"],
    // Approximate coordinates: 19.9972° N, 73.7259° E (Satpur industrial hub)
    latitude: 19.9972,
    longitude: 73.7259,
    description: "Major industrial manufacturing zone on Trimbak Road",
  },
  {
    id: "nashik-road",
    name: "Nashik Road (Bitco Point)",
    nameHi: "नासिक रोड (बिटको पॉइंट)",
    nameMr: "नाशिक रोड (बिटको पॉईंट)",
    aliases: ["nashik road", "bitco", "muktidham", "regimental plaza", "नासिक रोड", "नाशिक रोड", "बिटको"],
    // Approximate coordinates: 19.9575° N, 73.8385° E (Bitco Chowk)
    latitude: 19.9575,
    longitude: 73.8385,
    description: "Key suburb commercial junction",
  },
  {
    id: "nashik-road-station",
    name: "Nashik Road Railway Station",
    nameHi: "नासिक रोड रेलवे स्टेशन",
    nameMr: "नाशिक रोड रेल्वे स्थानक",
    aliases: ["railway station", "nashik station", "station", "nk station", "नासिक स्टेशन", "नाशिक रेल्वे स्थानक"],
    // Approximate coordinates: 19.9535° N, 73.8447° E (Main station entrance)
    latitude: 19.9535,
    longitude: 73.8447,
    description: "Primary intercity railway junction",
  },
  {
    id: "gangapur-road",
    name: "Gangapur Road (Jehan Circle)",
    nameHi: "गंगापुर रोड (जहाँ सर्कल)",
    nameMr: "गंगापूर रोड (जहान सर्कल)",
    aliases: ["gangapur road", "jehan circle", "serene meadows", "dongre vastigruh", "गंगापुर रोड", "गंगापूर रोड"],
    // Approximate coordinates: 20.0187° N, 73.7548° E (Jehan Circle intersection)
    latitude: 20.0187,
    longitude: 73.7548,
    description: "Premier residential and cafe avenue",
  },
  {
    id: "indira-nagar",
    name: "Indira Nagar (Jogging Track)",
    nameHi: "इंदिरा नगर (जॉगिंग ट्रैक)",
    nameMr: "इंदिरा नगर (जॉगिंग ट्रॅक)",
    aliases: ["indira nagar", "jogging track", "lekha nagar", "rathchakra", "इंदिरा नगर"],
    // Approximate coordinates: 19.9701° N, 73.7663° E (Indira Nagar Jogging Track)
    latitude: 19.9701,
    longitude: 73.7663,
    description: "Sprawling residential neighborhood",
  },
  {
    id: "dwarka",
    name: "Dwarka Circle",
    nameHi: "द्वारका सर्कल",
    nameMr: "द्वारका सर्कल",
    aliases: ["dwarka", "dwarka circle", "dwarka chowk", "national highway junction", "द्वारका", "द्वारका सर्कल"],
    // Approximate coordinates: 19.9897° N, 73.8012° E (NH3 / Pune Highway interchange)
    latitude: 19.9897,
    longitude: 73.8012,
    description: "Vital arterial junction for Pune/Mumbai/Dhule traffic",
  },
  {
    id: "mumbai-naka",
    name: "Mumbai Naka",
    nameHi: "मुंबई नाका",
    nameMr: "मुंबई नाका",
    aliases: ["mumbai naka", "bombay naka", "sarada circle", "gadkari chowk", "मुंबई नाका"],
    // Approximate coordinates: 19.9882° N, 73.7842° E (Mumbai Naka circle)
    latitude: 19.9882,
    longitude: 73.7842,
    description: "City center transit and bus staging point",
  },
  {
    id: "cidco",
    name: "Cidco (Trimurti Chowk)",
    nameHi: "सिडको (त्रिमूर्ति चौक)",
    nameMr: "सिडको (त्रिमूर्ती चौक)",
    aliases: ["cidco", "trimurti chowk", "pawan nagar", "uttan nagar", "सिडको", "त्रिमूर्ती चौक"],
    // Approximate coordinates: 19.9754° N, 73.7483° E (Trimurti Chowk)
    latitude: 19.9754,
    longitude: 73.7483,
    description: "Dense western residential suburb",
  },
  {
    id: "ambad",
    name: "Ambad MIDC (XLO Point)",
    nameHi: "अंबड एमआईडीसी (एक्सएलओ पॉइंट)",
    nameMr: "अंबड एमआयडीसी (एक्सएलओ पॉईंट)",
    aliases: ["ambad", "ambad midc", "xlo point", "mahindra circle", "garware", "अंबड", "अंबड एमआयडीसी"],
    // Approximate coordinates: 19.9482° N, 73.7371° E (XLO Point on Mumbai Highway)
    latitude: 19.9482,
    longitude: 73.7371,
    description: "Automotive and engineering industrial area",
  },
  {
    id: "deolali-camp",
    name: "Deolali Camp (Rest Camp)",
    nameHi: "देवलाली कैंप",
    nameMr: "देवळाली कॅम्प",
    aliases: ["deolali", "deolali camp", "cantonment", "temple hill", "देवलाली", "देवळाली"],
    // Approximate coordinates: 19.9248° N, 73.8317° E (Deolali Cantonment area)
    latitude: 19.9248,
    longitude: 73.8317,
    description: "Cantonment hill station and residential suburb",
  },
  {
    id: "trimbak-road",
    name: "Trimbak Road (ITI Signal)",
    nameHi: "त्र्यंबक रोड (आईटीआई सिग्नल)",
    nameMr: "त्र्यंबक रोड (आयटीआय सिग्नल)",
    aliases: ["trimbak road", "iti", "iti signal", "sandip foundation", "त्र्यंबक रोड", "आयटीआय"],
    // Approximate coordinates: 19.9885° N, 73.7510° E (ITI Signal junction)
    latitude: 19.9885,
    longitude: 73.751,
    description: "Arterial connecting city to Trimbakeshwar",
  },
  {
    id: "pathardi-phata",
    name: "Pathardi Phata",
    nameHi: "पाथर्डी फाटा",
    nameMr: "पाथर्डी फाटा",
    aliases: ["pathardi phata", "pathardi", "express inn", "hotel express inn", "पाथर्डी फाटा"],
    // Approximate coordinates: 19.9441° N, 73.7628° E (Pathardi Phata junction on NH3)
    latitude: 19.9441,
    longitude: 73.7628,
    description: "Key junction connecting Ambad, Indira Nagar, and Mumbai Highway",
  },
  {
    id: "sharanpur-road",
    name: "Sharanpur Road (Kulkarni Garden)",
    nameHi: "शरणपुर रोड (कुलकर्णी गार्डन)",
    nameMr: "शरणपूर रोड (कुलकर्णी गार्डन)",
    aliases: ["sharanpur road", "kulkarni garden", "sharanpur", "शरणपुर रोड", "शरणपूर रोड"],
    // Approximate coordinates: 20.0035° N, 73.7740° E (Kulkarni Garden intersection)
    latitude: 20.0035,
    longitude: 73.774,
    description: "Central commercial and administrative road",
  },
  {
    id: "untwadi",
    name: "Untwadi (City Centre Mall)",
    nameHi: "उंटवाड़ी (सिटी सेंटर मॉल)",
    nameMr: "उंटवाडी (सिटी सेंटर मॉल)",
    aliases: ["untwadi", "city centre mall", "ccm", "untwadi road", "उंटवाडी", "सिटी सेंटर मॉल"],
    // Approximate coordinates: 19.9868° N, 73.7625° E (Nashik City Centre Mall)
    latitude: 19.9868,
    longitude: 73.7625,
    description: "Major shopping and lifestyle hub",
  },
  {
    id: "mahatma-nagar",
    name: "Mahatma Nagar (Water Tank)",
    nameHi: "महात्मा नगर (वाटर टैंक)",
    nameMr: "महात्मा नगर (पाण्याची टाकी)",
    aliases: ["mahatma nagar", "cricket ground", "mahatma nagar ground", "महात्मा नगर"],
    // Approximate coordinates: 20.0041° N, 73.7525° E (Mahatma Nagar Ground)
    latitude: 20.0041,
    longitude: 73.7525,
    description: "Quiet upscale residential neighborhood",
  },
  {
    id: "jail-road",
    name: "Jail Road (Nashik Road)",
    nameHi: "जेल रोड (नासिक रोड)",
    nameMr: "जेल रोड (नाशिक रोड)",
    aliases: ["jail road", "central jail", "byatco", "darga phata", "जेल रोड"],
    // Approximate coordinates: 19.9678° N, 73.8312° E (Jail Road corridor)
    latitude: 19.9678,
    longitude: 73.8312,
    description: "Residential connection between Dwarka and Nashik Road",
  },
  {
    id: "govind-nagar",
    name: "Govind Nagar (Symbiosis Point)",
    nameHi: "गोविंद नगर",
    nameMr: "गोविंद नगर",
    aliases: ["govind nagar", "symbiosis", "city care hospital", "गोविंद नगर"],
    // Approximate coordinates: 19.9805° N, 73.7685° E
    latitude: 19.9805,
    longitude: 73.7685,
    description: "Central residential locality adjoining City Centre Mall",
  },
  {
    id: "mhasrul",
    name: "Mhasrul (Dindori Naka)",
    nameHi: "म्हसरूळ (दिंडोरी नाका)",
    nameMr: "म्हसरूळ (दिंडोरी नाका)",
    aliases: ["mhasrul", "dindori road", "meri", "meri colony", "म्हसरूळ"],
    // Approximate coordinates: 20.0450° N, 73.8050° E (MERI Colony area)
    latitude: 20.045,
    longitude: 73.805,
    description: "Northern suburban and institutional zone",
  },
];

