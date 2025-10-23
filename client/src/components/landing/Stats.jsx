import React, { useState, useEffect } from 'react';
import { publicAPI } from '../../services/api';

const Stats = () => {
  const [stats, setStats] = useState({
    totalCustomers: 20000,
    totalRestaurants: 50,
    averageRating: 4.8,
    totalOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await publicAPI.getStats();
        if (response.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const displayStats = [
    { 
      number: stats.totalCustomers >= 1000 
        ? `${Math.floor(stats.totalCustomers / 1000)}K+` 
        : `${stats.totalCustomers}+`, 
      label: 'Happy Customers' 
    },
    { 
      number: `${stats.totalRestaurants}+`, 
      label: 'Trusted Restaurant Partners' 
    },
    { 
      number: `${stats.averageRating}/5`, 
      label: 'Average Rating' 
    }
  ];

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-300 rounded mb-2 mx-auto w-40"></div>
                <div className="h-6 bg-gray-200 rounded mx-auto w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {displayStats.map((stat, index) => (
            <div key={index}>
              <div className="text-5xl md:text-6xl font-bold text-[#FF0000] mb-2">
                {stat.number}
              </div>
              <p className="text-gray-600 text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
