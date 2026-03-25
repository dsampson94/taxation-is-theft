export interface CityData {
  slug: string;
  name: string;
  province: string;
  region: string;
  description: string;
  searchTerms: string[];
}

export const cities: CityData[] = [
  {
    slug: "johannesburg",
    name: "Johannesburg",
    province: "Gauteng",
    region: "Joburg CBD, Sandton, Rosebank, Braamfontein, Fourways",
    description: "South Africa's economic hub and home to the JSE",
    searchTerms: ["Joburg", "Jozi", "JHB", "Sandton", "Rosebank"],
  },
  {
    slug: "cape-town",
    name: "Cape Town",
    province: "Western Cape",
    region: "Cape Town CBD, Sea Point, Claremont, Bellville, Century City",
    description: "The Mother City and Western Cape's business centre",
    searchTerms: ["CPT", "Mother City", "Sea Point", "Claremont"],
  },
  {
    slug: "durban",
    name: "Durban",
    province: "KwaZulu-Natal",
    region: "Durban CBD, Umhlanga, Ballito, Westville, Berea",
    description: "KZN's coastal economic powerhouse and busiest port city",
    searchTerms: ["eThekwini", "Umhlanga", "Ballito"],
  },
  {
    slug: "pretoria",
    name: "Pretoria",
    province: "Gauteng",
    region: "Pretoria CBD, Centurion, Hatfield, Brooklyn, Menlyn",
    description: "South Africa's administrative capital and government hub",
    searchTerms: ["Tshwane", "Centurion", "Hatfield", "Menlyn"],
  },
  {
    slug: "port-elizabeth",
    name: "Gqeberha",
    province: "Eastern Cape",
    region: "Port Elizabeth CBD, Summerstrand, Walmer, Newton Park",
    description: "The Friendly City and Eastern Cape's industrial heart",
    searchTerms: ["Port Elizabeth", "PE", "Gqeberha", "Nelson Mandela Bay"],
  },
  {
    slug: "bloemfontein",
    name: "Bloemfontein",
    province: "Free State",
    region: "Bloemfontein CBD, Westdene, Universitas, Langenhoven Park",
    description: "South Africa's judicial capital and Free State hub",
    searchTerms: ["Bloem", "Mangaung", "City of Roses"],
  },
  {
    slug: "east-london",
    name: "East London",
    province: "Eastern Cape",
    region: "East London CBD, Beacon Bay, Gonubie, Vincent",
    description: "Buffalo City's commercial centre on the Eastern Cape coast",
    searchTerms: ["EL", "Buffalo City"],
  },
  {
    slug: "polokwane",
    name: "Polokwane",
    province: "Limpopo",
    region: "Polokwane CBD, Bendor, Fauna Park, Nirvana",
    description: "Limpopo's capital and the gateway to the north",
    searchTerms: ["Pietersburg", "Limpopo capital"],
  },
  {
    slug: "nelspruit",
    name: "Mbombela",
    province: "Mpumalanga",
    region: "Nelspruit CBD, White River, Riverside Park",
    description: "Mpumalanga's capital near the Kruger National Park",
    searchTerms: ["Nelspruit", "Mbombela"],
  },
  {
    slug: "pietermaritzburg",
    name: "Pietermaritzburg",
    province: "KwaZulu-Natal",
    region: "PMB CBD, Scottsville, Hilton, Howick",
    description: "KZN's capital city and Midlands gateway",
    searchTerms: ["PMB", "Maritzburg", "Msunduzi"],
  },
  {
    slug: "kimberley",
    name: "Kimberley",
    province: "Northern Cape",
    region: "Kimberley CBD, Hadison Park, Royldene",
    description: "Northern Cape's capital and Diamond City",
    searchTerms: ["Diamond City", "Sol Plaatje"],
  },
  {
    slug: "rustenburg",
    name: "Rustenburg",
    province: "North West",
    region: "Rustenburg CBD, Cashan, Safari Gardens",
    description: "The Platinum City in the heart of North West",
    searchTerms: ["Platinum City", "Bojanala"],
  },
  {
    slug: "george",
    name: "George",
    province: "Western Cape",
    region: "George CBD, Wilderness, Herolds Bay, Pacaltsdorp",
    description: "The Garden Route's main commercial centre",
    searchTerms: ["Garden Route", "George"],
  },
  {
    slug: "soweto",
    name: "Soweto",
    province: "Gauteng",
    region: "Orlando, Diepkloof, Meadowlands, Dobsonville, Pimville",
    description: "Johannesburg's largest township and cultural heartbeat",
    searchTerms: ["South Western Townships", "Orlando"],
  },
  {
    slug: "midrand",
    name: "Midrand",
    province: "Gauteng",
    region: "Midrand, Waterfall, Carlswald, Vorna Valley, Halfway House",
    description: "Gauteng's fast-growing tech and business corridor",
    searchTerms: ["Waterfall City", "Halfway House"],
  },
  {
    slug: "stellenbosch",
    name: "Stellenbosch",
    province: "Western Cape",
    region: "Stellenbosch CBD, De Zalze, Techno Park, Kayamandi",
    description: "University town and startup hub in the Winelands",
    searchTerms: ["Winelands", "Stellies", "Techno Park"],
  },
];

export function getCityBySlug(slug: string): CityData | undefined {
  return cities.find((c) => c.slug === slug);
}
