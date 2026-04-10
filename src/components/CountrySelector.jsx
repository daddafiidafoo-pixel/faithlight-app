import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

const COUNTRIES = [
  // Africa
  { code: 'DZ', name: 'Algeria', region: 'africa' },
  { code: 'AO', name: 'Angola', region: 'africa' },
  { code: 'BJ', name: 'Benin', region: 'africa' },
  { code: 'BW', name: 'Botswana', region: 'africa' },
  { code: 'BF', name: 'Burkina Faso', region: 'africa' },
  { code: 'BI', name: 'Burundi', region: 'africa' },
  { code: 'CM', name: 'Cameroon', region: 'africa' },
  { code: 'CV', name: 'Cape Verde', region: 'africa' },
  { code: 'CF', name: 'Central African Republic', region: 'africa' },
  { code: 'TD', name: 'Chad', region: 'africa' },
  { code: 'KM', name: 'Comoros', region: 'africa' },
  { code: 'CG', name: 'Congo', region: 'africa' },
  { code: 'CD', name: 'Democratic Republic of the Congo', region: 'africa' },
  { code: 'CI', name: "Côte d'Ivoire", region: 'africa' },
  { code: 'DJ', name: 'Djibouti', region: 'africa' },
  { code: 'EG', name: 'Egypt', region: 'africa' },
  { code: 'GQ', name: 'Equatorial Guinea', region: 'africa' },
  { code: 'ER', name: 'Eritrea', region: 'africa' },
  { code: 'ET', name: 'Ethiopia', region: 'africa' },
  { code: 'GA', name: 'Gabon', region: 'africa' },
  { code: 'GM', name: 'Gambia', region: 'africa' },
  { code: 'GH', name: 'Ghana', region: 'africa' },
  { code: 'GN', name: 'Guinea', region: 'africa' },
  { code: 'GW', name: 'Guinea-Bissau', region: 'africa' },
  { code: 'KE', name: 'Kenya', region: 'africa' },
  { code: 'LS', name: 'Lesotho', region: 'africa' },
  { code: 'LR', name: 'Liberia', region: 'africa' },
  { code: 'LY', name: 'Libya', region: 'africa' },
  { code: 'MG', name: 'Madagascar', region: 'africa' },
  { code: 'MW', name: 'Malawi', region: 'africa' },
  { code: 'ML', name: 'Mali', region: 'africa' },
  { code: 'MR', name: 'Mauritania', region: 'africa' },
  { code: 'MU', name: 'Mauritius', region: 'africa' },
  { code: 'MA', name: 'Morocco', region: 'africa' },
  { code: 'MZ', name: 'Mozambique', region: 'africa' },
  { code: 'NA', name: 'Namibia', region: 'africa' },
  { code: 'NE', name: 'Niger', region: 'africa' },
  { code: 'NG', name: 'Nigeria', region: 'africa' },
  { code: 'RW', name: 'Rwanda', region: 'africa' },
  { code: 'ST', name: 'São Tomé and Príncipe', region: 'africa' },
  { code: 'SN', name: 'Senegal', region: 'africa' },
  { code: 'SC', name: 'Seychelles', region: 'africa' },
  { code: 'SL', name: 'Sierra Leone', region: 'africa' },
  { code: 'SO', name: 'Somalia', region: 'africa' },
  { code: 'ZA', name: 'South Africa', region: 'africa' },
  { code: 'SS', name: 'South Sudan', region: 'africa' },
  { code: 'SD', name: 'Sudan', region: 'africa' },
  { code: 'SZ', name: 'Eswatini', region: 'africa' },
  { code: 'TZ', name: 'Tanzania', region: 'africa' },
  { code: 'TG', name: 'Togo', region: 'africa' },
  { code: 'TN', name: 'Tunisia', region: 'africa' },
  { code: 'UG', name: 'Uganda', region: 'africa' },
  { code: 'ZM', name: 'Zambia', region: 'africa' },
  { code: 'ZW', name: 'Zimbabwe', region: 'africa' },
  
  // North America
  { code: 'US', name: 'United States', region: 'standard' },
  { code: 'CA', name: 'Canada', region: 'standard' },
  { code: 'MX', name: 'Mexico', region: 'standard' },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', region: 'standard' },
  { code: 'DE', name: 'Germany', region: 'standard' },
  { code: 'FR', name: 'France', region: 'standard' },
  { code: 'IT', name: 'Italy', region: 'standard' },
  { code: 'ES', name: 'Spain', region: 'standard' },
  { code: 'NL', name: 'Netherlands', region: 'standard' },
  { code: 'BE', name: 'Belgium', region: 'standard' },
  { code: 'CH', name: 'Switzerland', region: 'standard' },
  { code: 'AT', name: 'Austria', region: 'standard' },
  { code: 'SE', name: 'Sweden', region: 'standard' },
  { code: 'NO', name: 'Norway', region: 'standard' },
  { code: 'DK', name: 'Denmark', region: 'standard' },
  { code: 'FI', name: 'Finland', region: 'standard' },
  { code: 'PL', name: 'Poland', region: 'standard' },
  { code: 'IE', name: 'Ireland', region: 'standard' },
  { code: 'PT', name: 'Portugal', region: 'standard' },
  
  // Others
  { code: 'AU', name: 'Australia', region: 'standard' },
  { code: 'NZ', name: 'New Zealand', region: 'standard' },
  { code: 'BR', name: 'Brazil', region: 'standard' },
  { code: 'IN', name: 'India', region: 'standard' },
  { code: 'CN', name: 'China', region: 'standard' },
  { code: 'JP', name: 'Japan', region: 'standard' },
  { code: 'KR', name: 'South Korea', region: 'standard' },
  { code: 'SG', name: 'Singapore', region: 'standard' },
  { code: 'PH', name: 'Philippines', region: 'standard' },
];

export default function CountrySelector({ value, onChange, locked, isAdmin }) {
  const selectedCountry = COUNTRIES.find(c => c.code === value);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="country">Country</Label>
      <Select value={value} onValueChange={onChange} disabled={locked && !isAdmin}>
        <SelectTrigger id="country">
          <SelectValue placeholder="Select your country" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {COUNTRIES.map(country => (
            <SelectItem key={country.code} value={country.code}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {locked && !isAdmin && (
        <Alert className="mt-2">
          <Lock className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Country is locked after first payment. Contact support to change.
          </AlertDescription>
        </Alert>
      )}
      
      {selectedCountry && selectedCountry.region === 'africa' && !locked && (
        <Alert className="mt-2 bg-green-50 border-green-200">
          <AlertDescription className="text-xs text-green-800">
            Special pricing for Africa - Making biblical education accessible worldwide
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function getRegionForCountry(countryCode) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.region || 'standard';
}

export { COUNTRIES };