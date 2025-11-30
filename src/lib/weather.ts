export interface WeatherData {
  condition: string;
  conditionCode: string;
  description: string;
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  icon: string;
  isBadWeather: boolean;
  needsIndoor: boolean;
}

const BAD_WEATHER = ['rain', 'drizzle', 'thunderstorm', 'snow', 'sleet', 'hail', 'fog', 'mist'];

function isBadWeather(condition: string): boolean {
  return BAD_WEATHER.some(bad => condition.toLowerCase().includes(bad));
}

export async function getCopenhagenWeather(): Promise<WeatherData> {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  if (!API_KEY) return getFallbackWeather();
  
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Copenhagen,dk&appid=${API_KEY}&units=metric`);
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    const w = data.weather[0];
    const bad = isBadWeather(w.main);
    return {
      condition: w.main,
      conditionCode: w.id.toString(),
      description: w.description,
      temperature: Math.round(data.main.temp),
      precipitation: bad ? 70 : 0,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      icon: w.icon,
      isBadWeather: bad,
      needsIndoor: bad || data.main.temp < 5,
    };
  } catch { return getFallbackWeather(); }
}

export async function getCopenhagenWeatherForecast(date: Date): Promise<WeatherData> {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  if (!API_KEY) return getFallbackWeather();
  
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (days <= 0) return getCopenhagenWeather();
  if (days > 5) return getFallbackWeather();
  
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Copenhagen,dk&appid=${API_KEY}&units=metric`);
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    const dateStr = date.toISOString().split('T')[0];
    const forecast = data.list.find((i: any) => new Date(i.dt * 1000).toISOString().split('T')[0] === dateStr) || data.list[0];
    const w = forecast.weather[0];
    const bad = isBadWeather(w.main);
    return {
      condition: w.main,
      conditionCode: w.id.toString(),
      description: w.description,
      temperature: Math.round(forecast.main.temp),
      precipitation: forecast.pop ? Math.round(forecast.pop * 100) : 0,
      humidity: forecast.main.humidity,
      windSpeed: Math.round(forecast.wind.speed * 3.6),
      icon: w.icon,
      isBadWeather: bad,
      needsIndoor: bad || forecast.main.temp < 5,
    };
  } catch { return getFallbackWeather(); }
}

function getFallbackWeather(): WeatherData {
  return {
    condition: 'Unknown',
    conditionCode: '000',
    description: 'Weather unavailable',
    temperature: 12,
    precipitation: 30,
    humidity: 70,
    windSpeed: 15,
    icon: '03d',
    isBadWeather: false,
    needsIndoor: false,
  };
}

export function getWeatherEmoji(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('clear')) return '☀️';
  if (c.includes('cloud')) return '☁️';
  if (c.includes('rain')) return '🌧️';
  if (c.includes('thunder')) return '⛈️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('fog') || c.includes('mist')) return '🌫️';
  return '🌡️';
}
