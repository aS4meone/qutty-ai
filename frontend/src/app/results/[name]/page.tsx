'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const RecommendationsPage = () => {
  const pathname = usePathname();
  const name = pathname.split('/').pop();
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (name) {
      const fetchRecommendations = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/results/${name}`);
          if (response.ok) {
            const data = await response.json();
            setRecommendations(data.recommendations);
          } else {
            const errorText = await response.text();
            setError(errorText);
          }
        } catch (err) {
          setError('Ошибка загрузки рекомендаций');
        } finally {
          setLoading(false);
        }
      };

      fetchRecommendations();
    }
  }, [name]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Рекомендации</h1>
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-8 w-8"></div>
              <p className="text-lg font-semibold">Загрузка...</p>
            </div>
          )}
        </div>
        {error && !loading && (
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold">{error}</p>
          </div>
        )}
        {recommendations && !loading && (
          <div className="space-y-4">
            <p className="text-gray-700">{recommendations}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
