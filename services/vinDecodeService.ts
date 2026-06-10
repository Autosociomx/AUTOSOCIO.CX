import type { DecodedVehicle } from '../types';

interface NHTSAResult {
  Variable: string;
  Value: string | null;
}

export async function decodeVIN(vin: string): Promise<DecodedVehicle | null> {
  const clean = vin.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
  if (clean.length !== 17) return null;

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${clean}?format=json`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const results: NHTSAResult[] = data.Results ?? [];

    const get = (variable: string) =>
      results.find(r => r.Variable === variable)?.Value?.trim() || '';

    const make = get('Make');
    const model = get('Model');
    const year = get('Model Year');

    if (!make || !model || !year || make === 'Not Applicable') return null;

    const displacement = get('Displacement (L)');
    const cylinders = get('Engine Number of Cylinders');
    const fuelType = get('Fuel Type - Primary');

    let engine = '';
    if (displacement && parseFloat(displacement) > 0)
      engine += `${parseFloat(displacement).toFixed(1)}L`;
    if (cylinders && cylinders !== 'Not Applicable')
      engine += ` ${cylinders}cil`;
    if (fuelType && fuelType !== 'Not Applicable')
      engine += ` ${normalizeFuel(fuelType)}`;

    return {
      vin: clean,
      make: capitalize(make),
      model: capitalize(model),
      year,
      engine: engine.trim() || 'N/D',
      fuelType: fuelType || 'Gasoline',
      transmission: get('Transmission Style'),
      driveType: get('Drive Type'),
      bodyClass: get('Body Class'),
      trim: get('Trim'),
    };
  } catch {
    return null;
  }
}

function normalizeFuel(fuel: string): string {
  const f = fuel.toLowerCase();
  if (f.includes('electric') && f.includes('gasoline')) return 'Híbrido';
  if (f.includes('electric')) return 'Eléctrico';
  if (f.includes('diesel')) return 'Diesel';
  if (f.includes('gasoline') || f.includes('petrol')) return 'Gasolina';
  return fuel;
}

function capitalize(str: string): string {
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function fuelTypeIcon(fuelType: string): string {
  const f = fuelType.toLowerCase();
  if (f.includes('electric') && f.includes('gasoline')) return '⚡🔋';
  if (f.includes('electric')) return '⚡';
  if (f.includes('diesel')) return '🛢️';
  return '⛽';
}
