export class WeatherResponse {
  coord: Coord;
  weather: Weather[];
  base: string;
  main: MainData;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export class Coord {
  lon: number;
  lat: number;
}

export class Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export class MainData {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  pressure: number;
  humidity: number;
}

export class Wind {
  speed: number;
  deg: number;
}

export class Clouds {
  all: number;
}

export class Sys {
  type: number;
  id: number;
  message: number;
  country: string;
  sunrise: number;
  sunset: number;
}
