import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useRegionalPricing(user) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await base44.functions.invoke('getRegionalPricing', {});
        setPricing({
          currency: response.data.pricing.currency,
          basic: response.data.pricing.basic,
          premium: response.data.pricing.premium,
          isAfrica: response.data.isAfrica,
          countryCode: response.data.countryCode,
        });
      } catch (error) {
        console.error('Error fetching regional pricing:', error);
        // Fallback to developed world pricing
        setPricing({
          currency: '$',
          basic: 5,
          premium: 10,
          isAfrica: false,
          countryCode: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [user]);

  return { pricing, loading };
}