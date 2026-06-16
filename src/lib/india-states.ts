import type { StateInfo, IndianState } from '@/types';

export const INDIA_STATES: StateInfo[] = [
  { name: 'Maharashtra',    slug: 'maharashtra',    capital: 'Mumbai',       coordinates: { lat: 19.0760, lng: 72.8777 }, population: 112374333, area: 307713, newsCount: 0 },
  { name: 'Delhi',          slug: 'delhi',          capital: 'New Delhi',    coordinates: { lat: 28.6139, lng: 77.2090 }, population: 32941000,  area: 1484,   newsCount: 0 },
  { name: 'Karnataka',      slug: 'karnataka',      capital: 'Bengaluru',    coordinates: { lat: 12.9716, lng: 77.5946 }, population: 67562686,  area: 191791, newsCount: 0 },
  { name: 'Tamil Nadu',     slug: 'tamil-nadu',     capital: 'Chennai',      coordinates: { lat: 13.0827, lng: 80.2707 }, population: 77841267,  area: 130058, newsCount: 0 },
  { name: 'Uttar Pradesh',  slug: 'uttar-pradesh',  capital: 'Lucknow',      coordinates: { lat: 26.8467, lng: 80.9462 }, population: 224979505, area: 240928, newsCount: 0 },
  { name: 'West Bengal',    slug: 'west-bengal',    capital: 'Kolkata',      coordinates: { lat: 22.5726, lng: 88.3639 }, population: 99609303,  area: 88752,  newsCount: 0 },
  { name: 'Gujarat',        slug: 'gujarat',        capital: 'Gandhinagar',  coordinates: { lat: 23.0225, lng: 72.5714 }, population: 63872399,  area: 196024, newsCount: 0 },
  { name: 'Rajasthan',      slug: 'rajasthan',      capital: 'Jaipur',       coordinates: { lat: 26.9124, lng: 75.7873 }, population: 81032689,  area: 342239, newsCount: 0 },
  { name: 'Telangana',      slug: 'telangana',      capital: 'Hyderabad',    coordinates: { lat: 17.3850, lng: 78.4867 }, population: 39362732,  area: 112077, newsCount: 0 },
  { name: 'Kerala',         slug: 'kerala',         capital: 'Thiruvananthapuram', coordinates: { lat: 10.8505, lng: 76.2711 }, population: 35699443, area: 38852, newsCount: 0 },
  { name: 'Madhya Pradesh', slug: 'madhya-pradesh', capital: 'Bhopal',       coordinates: { lat: 23.2599, lng: 77.4126 }, population: 85358965,  area: 308252, newsCount: 0 },
  { name: 'Bihar',          slug: 'bihar',          capital: 'Patna',        coordinates: { lat: 25.5941, lng: 85.1376 }, population: 128500364, area: 94163,  newsCount: 0 },
  { name: 'Punjab',         slug: 'punjab',         capital: 'Chandigarh',   coordinates: { lat: 30.9010, lng: 75.8573 }, population: 30141373,  area: 50362,  newsCount: 0 },
  { name: 'Haryana',        slug: 'haryana',        capital: 'Chandigarh',   coordinates: { lat: 29.0588, lng: 76.0856 }, population: 28672709,  area: 44212,  newsCount: 0 },
  { name: 'Odisha',         slug: 'odisha',         capital: 'Bhubaneswar',  coordinates: { lat: 20.2961, lng: 85.8245 }, population: 46356334,  area: 155707, newsCount: 0 },
  { name: 'Jharkhand',      slug: 'jharkhand',      capital: 'Ranchi',       coordinates: { lat: 23.3441, lng: 85.3096 }, population: 38593948,  area: 79716,  newsCount: 0 },
  { name: 'Assam',          slug: 'assam',          capital: 'Dispur',       coordinates: { lat: 26.2006, lng: 92.9376 }, population: 35607039,  area: 78438,  newsCount: 0 },
  { name: 'Chhattisgarh',   slug: 'chhattisgarh',   capital: 'Raipur',       coordinates: { lat: 21.2787, lng: 81.8661 }, population: 29436231,  area: 135192, newsCount: 0 },
  { name: 'Uttarakhand',    slug: 'uttarakhand',    capital: 'Dehradun',     coordinates: { lat: 30.3165, lng: 78.0322 }, population: 11250858,  area: 53483,  newsCount: 0 },
  { name: 'Himachal Pradesh', slug: 'himachal-pradesh', capital: 'Shimla', coordinates: { lat: 31.1048, lng: 77.1734 }, population: 7451955, area: 55673, newsCount: 0 },
  { name: 'Goa',            slug: 'goa',            capital: 'Panaji',       coordinates: { lat: 15.4909, lng: 73.8278 }, population: 1586250,   area: 3702,   newsCount: 0 },
  { name: 'Tripura',        slug: 'tripura',        capital: 'Agartala',     coordinates: { lat: 23.9408, lng: 91.9882 }, population: 3992000,   area: 10486,  newsCount: 0 },
  { name: 'Andhra Pradesh', slug: 'andhra-pradesh', capital: 'Amaravati',    coordinates: { lat: 15.9129, lng: 79.7400 }, population: 53903393,  area: 162975, newsCount: 0 },
  { name: 'Jammu and Kashmir', slug: 'jammu-kashmir', capital: 'Srinagar',  coordinates: { lat: 34.0837, lng: 74.7973 }, population: 13606320,  area: 42241,  newsCount: 0 },
  { name: 'Manipur',        slug: 'manipur',        capital: 'Imphal',       coordinates: { lat: 24.6637, lng: 93.9063 }, population: 3091545,   area: 22327,  newsCount: 0 },
  { name: 'Meghalaya',      slug: 'meghalaya',      capital: 'Shillong',     coordinates: { lat: 25.5788, lng: 91.8933 }, population: 3366710,   area: 22429,  newsCount: 0 },
  { name: 'Mizoram',        slug: 'mizoram',        capital: 'Aizawl',       coordinates: { lat: 23.7271, lng: 92.7176 }, population: 1239244,   area: 21081,  newsCount: 0 },
  { name: 'Nagaland',       slug: 'nagaland',       capital: 'Kohima',       coordinates: { lat: 25.6751, lng: 94.1086 }, population: 2249695,   area: 16579,  newsCount: 0 },
  { name: 'Arunachal Pradesh', slug: 'arunachal-pradesh', capital: 'Itanagar', coordinates: { lat: 28.2180, lng: 94.7278 }, population: 1570458, area: 83743, newsCount: 0 },
  { name: 'Sikkim',         slug: 'sikkim',         capital: 'Gangtok',      coordinates: { lat: 27.5330, lng: 88.5122 }, population: 690251,    area: 7096,   newsCount: 0 },
  { name: 'Puducherry',     slug: 'puducherry',     capital: 'Puducherry',   coordinates: { lat: 11.9416, lng: 79.8083 }, population: 1671000,   area: 479,    newsCount: 0 },
];

export const STATE_SLUG_MAP: Record<string, IndianState> = Object.fromEntries(
  INDIA_STATES.map((s) => [s.slug, s.name])
);

export function getStateBySlug(slug: string): StateInfo | undefined {
  return INDIA_STATES.find((s) => s.slug === slug);
}

export function getStateByName(name: IndianState): StateInfo | undefined {
  return INDIA_STATES.find((s) => s.name === name);
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
