// CarCohort seed data - demo dataset for the concept build.
// Prices are indicative ex-showroom figures (publicly listed approximations),
// NOT live inventory or guaranteed pricing.

export const CITIES = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune', 'Chandigarh'];

// Indicative on-road uplift by city (RTO + insurance + misc), used only to
// display estimates. Real on-road prices vary by variant, insurer and RTO.
export const CITY_UPLIFT = {
  'Mumbai': 0.145,
  'Delhi NCR': 0.115,
  'Bengaluru': 0.175,
  'Pune': 0.145,
  'Chandigarh': 0.10,
};

export const CARS = [
  { id: 'swift',   type: 'car',   name: 'Maruti Suzuki Swift',   brand: 'Maruti Suzuki', body: 'Hatchback', fuel: 'Petrol / CNG',   exMin: 649000,  exMax: 964000,  seats: 5, ncap: 2, mileage: '22.4-25.8 km/l', popular: true },
  { id: 'baleno',  type: 'car',  name: 'Maruti Suzuki Baleno',  brand: 'Maruti Suzuki', body: 'Hatchback', fuel: 'Petrol / CNG',   exMin: 670000,  exMax: 992000,  seats: 5, ncap: 4, mileage: '22.4-22.9 km/l', popular: false },
  { id: 'punch',   type: 'car',   name: 'Tata Punch',            brand: 'Tata',          body: 'Micro SUV', fuel: 'Petrol / CNG',   exMin: 613000,  exMax: 1020000, seats: 5, ncap: 5, mileage: '18.8-20.1 km/l', popular: true },
  { id: 'nexon',   type: 'car',   name: 'Tata Nexon',            brand: 'Tata',          body: 'Compact SUV', fuel: 'Petrol / Diesel', exMin: 800000, exMax: 1560000, seats: 5, ncap: 5, mileage: '17.0-24.1 km/l', popular: true },
  { id: 'venue',   type: 'car',   name: 'Hyundai Venue',         brand: 'Hyundai',       body: 'Compact SUV', fuel: 'Petrol / Diesel', exMin: 794000, exMax: 1348000, seats: 5, ncap: 4, mileage: '17.5-23.4 km/l', popular: false },
  { id: 'creta',   type: 'car',   name: 'Hyundai Creta',         brand: 'Hyundai',       body: 'SUV',       fuel: 'Petrol / Diesel',  exMin: 1100000, exMax: 2015000, seats: 5, ncap: 3, mileage: '17.4-21.8 km/l', popular: true },
  { id: 'seltos',  type: 'car',  name: 'Kia Seltos',            brand: 'Kia',           body: 'SUV',       fuel: 'Petrol / Diesel',  exMin: 1090000, exMax: 2035000, seats: 5, ncap: 3, mileage: '17.0-20.7 km/l', popular: false },
  { id: 'city',    type: 'car',    name: 'Honda City',            brand: 'Honda',         body: 'Sedan',     fuel: 'Petrol / Hybrid',  exMin: 1171000, exMax: 1619000, seats: 5, ncap: 4, mileage: '17.8-27.1 km/l', popular: false },
  { id: 'thar',    type: 'car',    name: 'Mahindra Thar',         brand: 'Mahindra',      body: 'SUV',       fuel: 'Petrol / Diesel',  exMin: 1135000, exMax: 1760000, seats: 4, ncap: 4, mileage: '13.4-15.2 km/l', popular: true },
  { id: 'xuv700',  type: 'car',  name: 'Mahindra XUV700',       brand: 'Mahindra',      body: 'SUV',       fuel: 'Petrol / Diesel',  exMin: 1399000, exMax: 2699000, seats: 7, ncap: 5, mileage: '13.0-17.2 km/l', popular: false },
  { id: 'innova',  type: 'car',  name: 'Toyota Innova Crysta',  brand: 'Toyota',        body: 'MPV',       fuel: 'Diesel',           exMin: 1999000, exMax: 2655000, seats: 7, ncap: 5, mileage: '13.7-16.1 km/l', popular: false },
  { id: 'hector',  type: 'car',  name: 'MG Hector',             brand: 'MG',            body: 'SUV',       fuel: 'Petrol / Diesel',  exMin: 1398000, exMax: 2290000, seats: 5, ncap: 4, mileage: '13.8-15.8 km/l', popular: false },
  { id: 'activa',   type: 'scooter', name: 'Honda Activa 6G',        brand: 'Honda',         body: 'Scooter', fuel: 'Petrol',          exMin: 78000,  exMax: 92000,  seats: 2, ncap: 0, mileage: '45-50 km/l',   popular: true },
  { id: 'jupiter',  type: 'scooter', name: 'TVS Jupiter',             brand: 'TVS',           body: 'Scooter', fuel: 'Petrol',          exMin: 75000,  exMax: 90000,  seats: 2, ncap: 0, mileage: '48-52 km/l',   popular: false },
  { id: 'classic350', type: 'bike',  name: 'Royal Enfield Classic 350', brand: 'Royal Enfield', body: 'Cruiser', fuel: 'Petrol',        exMin: 193000, exMax: 230000, seats: 2, ncap: 0, mileage: '35-40 km/l',   popular: true },
  { id: 'shine',    type: 'bike',    name: 'Honda Shine 125',         brand: 'Honda',         body: 'Commuter', fuel: 'Petrol',         exMin: 80000,  exMax: 86000,  seats: 2, ncap: 0, mileage: '55-65 km/l',   popular: false },
  { id: 'ola-s1',   type: 'ev',      name: 'Ola S1 Pro Gen 3',        brand: 'Ola Electric',  body: 'Scooter', fuel: 'Electric',        exMin: 115000, exMax: 135000, seats: 2, ncap: 0, mileage: '176-195 km/charge', popular: true },
  { id: 'ather-450', type: 'ev',     name: 'Ather 450X',              brand: 'Ather',         body: 'Scooter', fuel: 'Electric',        exMin: 140000, exMax: 155000, seats: 2, ncap: 0, mileage: '110-150 km/charge', popular: false },
  { id: 'nexon-ev', type: 'ev',      name: 'Tata Nexon EV',           brand: 'Tata',          body: 'Compact SUV', fuel: 'Electric',    exMin: 1449000, exMax: 1999000, seats: 5, ncap: 5, mileage: '325-489 km/charge', popular: true },
];

export const TYPE_META = {
  car: { label: 'Cars' },
  bike: { label: 'Bikes' },
  scooter: { label: 'Scooters' },
  ev: { label: 'EVs' },
};

export const carById = (id) => CARS.find((c) => c.id === id);

// Three indicative variant tiers per model, derived from the ex-showroom range.
export function variantTiers(car) {
  const mid = Math.round(((car.exMin + car.exMax) / 2) / 1000) * 1000;
  return [
    { id: 'base', label: 'Base variant', ex: car.exMin },
    { id: 'mid', label: 'Mid variant', ex: mid },
    { id: 'top', label: 'Top variant', ex: car.exMax },
  ];
}

// Dealer names below are fictional demo dealerships.
export const GROUPS = [
  {
    id: 'creta-mumbai', carId: 'creta', city: 'Mumbai', members: 17, target: 20, invited: 6, deliveryBy: '2026-12-05',
    deadline: '2026-11-06', status: 'offers-live',
    offers: [
      { id: 'o1', dealer: 'Shuban Hyundai - Powai', onRoad: 1698000, inclusions: ['1st year insurance free', '5-year extended warranty', 'Accessories kit worth Rs 15,000'], validTill: '2026-11-06', rating: 4.6, note: 'Priority delivery within 2 weeks of group close' },
      { id: 'o2', dealer: 'Metro Hyundai - Andheri West', onRoad: 1715000, inclusions: ['RSA 3 years', 'Free 3 services', 'All-weather mats + boot liner'], validTill: '2026-11-06', rating: 4.4, note: 'Colour of choice guaranteed' },
      { id: 'o3', dealer: 'Coastal Hyundai - Thane', onRoad: 1732000, inclusions: ['1st year insurance free', 'Ceramic coating'], validTill: '2026-10-29', rating: 4.2, note: '' },
    ],
  },
  {
    id: 'nexon-pune', carId: 'nexon', city: 'Pune', members: 12, target: 15, invited: 5, deliveryBy: '2026-11-28',
    deadline: '2026-10-27', status: 'closing-soon',
    offers: [
      { id: 'o4', dealer: 'Bafna Tata - Baner', onRoad: 1305000, inclusions: ['Free PDI + doorstep delivery', 'Rs 8,000 fuel voucher', 'Mud flaps + mats'], validTill: '2026-10-27', rating: 4.5, note: 'Best for immediate delivery' },
      { id: 'o5', dealer: 'Pandit Tata - Wakad', onRoad: 1318000, inclusions: ['1st year insurance free', 'Extended warranty 4 yrs'], validTill: '2026-10-27', rating: 4.3, note: '' },
    ],
  },
  {
    id: 'swift-delhi', carId: 'swift', city: 'Delhi NCR', members: 21, target: 25, invited: 7, deliveryBy: '2026-12-10',
    deadline: '2026-11-12', status: 'offers-live',
    offers: [
      { id: 'o6', dealer: 'Prem Motors Maruti - Gurugram', onRoad: 871000, inclusions: ['Zero handling charges', 'Free accessories combo', '1st service labour free'], validTill: '2026-11-12', rating: 4.5, note: '' },
      { id: 'o7', dealer: 'Dhingra Maruti - Noida', onRoad: 883000, inclusions: ['1st year insurance free', 'Body cover + mats'], validTill: '2026-11-12', rating: 4.1, note: '' },
    ],
  },
  {
    id: 'thar-chandigarh', carId: 'thar', city: 'Chandigarh', members: 9, target: 15, invited: 3, deliveryBy: '2026-12-20',
    deadline: '2026-11-18', status: 'forming',
    offers: [
      { id: 'o8', dealer: 'Tricity Mahindra - Mohali', onRoad: 1535000, inclusions: ['Free 4x4 off-road experience day', 'Accessories voucher Rs 10,000'], validTill: '2026-11-18', rating: 4.4, note: 'Early-bird offer, improves at 15 buyers' },
    ],
  },
  {
    id: 'city-bengaluru', carId: 'city', city: 'Bengaluru', members: 14, target: 18, invited: 5, deliveryBy: '2026-12-08',
    deadline: '2026-11-09', status: 'offers-live',
    offers: [
      { id: 'o9', dealer: 'Dakshin Honda - Whitefield', onRoad: 1579000, inclusions: ['Corporate discount extended', 'Free 2 services', 'Window sunshades'], validTill: '2026-11-09', rating: 4.6, note: '' },
      { id: 'o10', dealer: 'Magnum Honda - Hebbal', onRoad: 1592000, inclusions: ['1st year insurance free', 'RSA 1 year'], validTill: '2026-11-09', rating: 4.3, note: '' },
    ],
  },
  {
    id: 'punch-mumbai', carId: 'punch', city: 'Mumbai', members: 6, target: 15, invited: 2, deliveryBy: '2026-12-22',
    deadline: '2026-11-21', status: 'forming',
    offers: [
      { id: 'o11', dealer: 'Lakozy Tata - Malad', onRoad: 889000, inclusions: ['Free PDI report shared with group', 'Mats + mud flaps'], validTill: '2026-11-21', rating: 4.2, note: 'Opens bidding - more dealers join as group grows' },
    ],
  },
  {
    id: 'xuv700-delhi', carId: 'xuv700', city: 'Delhi NCR', members: 11, target: 15, invited: 4, deliveryBy: '2026-12-15',
    deadline: '2026-11-15', status: 'offers-live',
    offers: [
      { id: 'o12', dealer: 'Sahib Mahindra - Faridabad', onRoad: 2199000, inclusions: ['5-year extended warranty', 'Free ceramic coating', 'RSA 3 years'], validTill: '2026-11-15', rating: 4.5, note: '' },
      { id: 'o13', dealer: 'Vegas Mahindra - Ghaziabad', onRoad: 2218000, inclusions: ['1st year insurance free', '7D mats'], validTill: '2026-11-15', rating: 4.2, note: '' },
    ],
  },
  {
    id: 'seltos-bengaluru', carId: 'seltos', city: 'Bengaluru', members: 8, target: 15, invited: 2, deliveryBy: '2026-12-28',
    deadline: '2026-11-25', status: 'forming',
    offers: [],
  },
  {
    id: 'innova-mumbai', carId: 'innova', city: 'Mumbai', members: 13, target: 15, invited: 4, deliveryBy: '2026-12-01',
    deadline: '2026-10-29', status: 'closing-soon',
    offers: [
      { id: 'o14', dealer: 'Shree Toyota - Borivali', onRoad: 2599000, inclusions: ['Priority allocation', 'Free 3 services', 'Genuine accessories 20% off'], validTill: '2026-10-29', rating: 4.7, note: 'Waiting period waiver for group members' },
    ],
  },
];

export const groupById = (id) => GROUPS.find((g) => g.id === id);

export function estimateOnRoad(car, city) {
  const mid = Math.round(((car.exMin + car.exMax) / 2) / 1000) * 1000;
  return Math.round((mid * (1 + (CITY_UPLIFT[city] ?? 0.13))) / 1000) * 1000;
}

export function bestOffer(group) {
  if (!group.offers.length) return null;
  return group.offers.reduce((a, b) => (a.onRoad <= b.onRoad ? a : b));
}

export function savingsVsEstimate(group) {
  const car = carById(group.carId);
  const est = estimateOnRoad(car, group.city);
  const best = bestOffer(group);
  return best ? est - best.onRoad : 0;
}

export const STATUS_META = {
  'forming':      { label: 'Group forming',  cls: 'bg-sky-100 text-sky-800' },
  'offers-live':  { label: 'Offers live',    cls: 'bg-emerald-100 text-emerald-800' },
  'closing-soon': { label: 'Closing soon',   cls: 'bg-amber-100 text-amber-800' },
};
