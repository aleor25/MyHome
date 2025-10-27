// hooks/useFetchLodge.ts
import { useEffect, useState } from 'react';

// Define la estructura de los datos que esperas de la API
export type LodgeData = {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  totalReviews: number;
  description: string;
  services: string[];
  reviews: any[]; // Simplificado
  // ... más campos
};

export const useFetchLodge = (lodgeId: string) => {
  const [data, setData] = useState<LodgeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLodge = async () => {
      try {
        // Asume que tu API está corriendo en http://localhost:3000
        const response = await fetch(`http://localhost:3000/api/lodges/${lodgeId}`);
        if (!response.ok) {
          throw new Error('No se pudieron obtener los datos del lodge.');
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLodge();
  }, [lodgeId]);

  return { data, isLoading, error };
};