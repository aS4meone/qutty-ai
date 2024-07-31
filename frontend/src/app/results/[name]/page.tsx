'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const RecommendationsPage = () => {
  const pathname = usePathname();
  const name = pathname.split('/').pop();
  const [user, setUser] = useState<{ name: string; age: number; predicted_diagnosis: string } | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (name) {
      const fetchRecommendations = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/results/${name}`);
          if (response.ok) {
            const data = await response.json();
            setUser(data[0]);
            setRecommendations(data[1].recommendations);
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
        {user && !loading && (
          <div className="space-y-4">
            <p className="text-gray-700">
              <span className="font-bold">Имя:</span> {user.name}
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Возраст:</span> {user.age}
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Предполагаемый диагноз:</span> {user.predicted_diagnosis}
            </p>
          </div>
        )}
        {recommendations.length > 0 && !loading && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Рекомендации:</h2>
            <ul className="list-disc list-inside text-gray-700">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
