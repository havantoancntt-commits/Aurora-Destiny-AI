// ==========================================
// AURORA DESTINY AI — LOCATION & COORDINATES PROVIDER
// Production-Grade Location Resolver with Built-in Curated Global Dataset
// High-Precision Latitude/Longitude & Timezone Mapping
// ==========================================

export interface LocationData {
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneOffset: number; // e.g. +7 for UTC+7
}

export interface GeocodingProvider {
  name: string;
  resolve(query: string, country?: string): Promise<LocationData | null>;
}

// Coordinate Validation Rules
export function validateCoordinates(latitude: number, longitude: number): boolean {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (isNaN(latitude) || isNaN(longitude)) return false;
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;
  return true;
}

// Built-in Curated Dataset: Major Vietnamese Cities and Global Metropolises
export const KNOWN_LOCATIONS: LocationData[] = [
  // --- VIỆT NAM (Các Tỉnh & Thành Phố Trọng Điểm) ---
  {
    city: 'Hà Nội',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 21.0285,
    longitude: 105.8542,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 10.7769,
    longitude: 106.7009,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Đà Nẵng',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 16.0544,
    longitude: 108.2022,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Hải Phòng',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 20.8449,
    longitude: 106.6881,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Cần Thơ',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 10.0452,
    longitude: 105.7469,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Huế',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 16.4637,
    longitude: 107.5909,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Nha Trang',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 12.2388,
    longitude: 109.1967,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Đà Lạt',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 11.9404,
    longitude: 108.4583,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Quy Nhơn',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 13.7830,
    longitude: 109.2197,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Vũng Tàu',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 10.3460,
    longitude: 107.0843,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Buôn Ma Thuột',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 12.6675,
    longitude: 108.0383,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Phan Thiết',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 10.9272,
    longitude: 108.1022,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Nam Định',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 20.4344,
    longitude: 106.1773,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Thái Nguyên',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 21.5942,
    longitude: 105.8482,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },
  {
    city: 'Vinh',
    country: 'Việt Nam',
    countryCode: 'VN',
    latitude: 18.6734,
    longitude: 105.6813,
    timezone: 'Asia/Ho_Chi_Minh',
    timezoneOffset: 7
  },

  // --- QUỐC TẾ (Đông Á & Đông Nam Á) ---
  {
    city: 'Tokyo',
    country: 'Nhật Bản',
    countryCode: 'JP',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
    timezoneOffset: 9
  },
  {
    city: 'Seoul',
    country: 'Hàn Quốc',
    countryCode: 'KR',
    latitude: 37.5665,
    longitude: 126.9780,
    timezone: 'Asia/Seoul',
    timezoneOffset: 9
  },
  {
    city: 'Bắc Kinh',
    country: 'Trung Quốc',
    countryCode: 'CN',
    latitude: 39.9042,
    longitude: 116.4074,
    timezone: 'Asia/Shanghai',
    timezoneOffset: 8
  },
  {
    city: 'Đài Bắc',
    country: 'Đài Loan',
    countryCode: 'TW',
    latitude: 25.0330,
    longitude: 121.5654,
    timezone: 'Asia/Taipei',
    timezoneOffset: 8
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    countryCode: 'SG',
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: 'Asia/Singapore',
    timezoneOffset: 8
  },
  {
    city: 'Bangkok',
    country: 'Thái Lan',
    countryCode: 'TH',
    latitude: 13.7563,
    longitude: 100.5018,
    timezone: 'Asia/Bangkok',
    timezoneOffset: 7
  },

  // --- QUỐC TẾ (Châu Âu, Châu Mỹ, Châu Úc) ---
  {
    city: 'Paris',
    country: 'Pháp',
    countryCode: 'FR',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
    timezoneOffset: 1
  },
  {
    city: 'London',
    country: 'Vương Quốc Anh',
    countryCode: 'GB',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    timezoneOffset: 0
  },
  {
    city: 'Berlin',
    country: 'Đức',
    countryCode: 'DE',
    latitude: 52.5200,
    longitude: 13.4050,
    timezone: 'Europe/Berlin',
    timezoneOffset: 1
  },
  {
    city: 'New York',
    country: 'Hoa Kỳ',
    countryCode: 'US',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    timezoneOffset: -5
  },
  {
    city: 'San Francisco',
    country: 'Hoa Kỳ',
    countryCode: 'US',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
    timezoneOffset: -8
  },
  {
    city: 'Los Angeles',
    country: 'Hoa Kỳ',
    countryCode: 'US',
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: 'America/Los_Angeles',
    timezoneOffset: -8
  },
  {
    city: 'Sydney',
    country: 'Úc',
    countryCode: 'AU',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    timezoneOffset: 10
  },
  {
    city: 'Melbourne',
    country: 'Úc',
    countryCode: 'AU',
    latitude: -37.8136,
    longitude: 144.9631,
    timezone: 'Australia/Melbourne',
    timezoneOffset: 10
  }
];

function normalizeSearchString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export class LocationProvider {
  private locations: LocationData[] = [...KNOWN_LOCATIONS];
  private externalGeocoder: GeocodingProvider | null = null;

  constructor(customLocations?: LocationData[]) {
    if (customLocations && customLocations.length > 0) {
      this.locations.push(...customLocations);
    }
  }

  public setExternalGeocoder(geocoder: GeocodingProvider): void {
    this.externalGeocoder = geocoder;
  }

  public getKnownLocations(): LocationData[] {
    return [...this.locations];
  }

  public resolveLocation(query: string, country?: string): LocationData | null {
    if (!query || query.trim() === '') return null;
    const cleanQuery = normalizeSearchString(query);
    const cleanCountry = country ? normalizeSearchString(country) : '';

    // 1. Exact or prefix match
    let match = this.locations.find(loc => {
      const locCityNorm = normalizeSearchString(loc.city);
      const cityMatches = locCityNorm === cleanQuery || locCityNorm.includes(cleanQuery) || cleanQuery.includes(locCityNorm);
      if (!cityMatches) return false;
      if (cleanCountry) {
        const locCountryNorm = normalizeSearchString(loc.country);
        return locCountryNorm.includes(cleanCountry) || cleanCountry.includes(locCountryNorm);
      }
      return true;
    });

    if (match) return match;

    // 2. Fallback search by country if city is generic
    if (cleanCountry) {
      match = this.locations.find(loc => normalizeSearchString(loc.country).includes(cleanCountry));
      if (match) return match;
    }

    return null;
  }

  public registerLocation(location: LocationData): void {
    if (!validateCoordinates(location.latitude, location.longitude)) {
      throw new Error(`Invalid geographic coordinates: lat ${location.latitude}, lon ${location.longitude}`);
    }
    this.locations.unshift(location);
  }

  public async resolveAsync(query: string, country?: string): Promise<LocationData | null> {
    const local = this.resolveLocation(query, country);
    if (local) return local;

    if (this.externalGeocoder) {
      return await this.externalGeocoder.resolve(query, country);
    }

    return null;
  }
}

// Global Singleton Location Provider
export const locationProvider = new LocationProvider();
