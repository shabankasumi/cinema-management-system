import React, { useEffect, useState } from 'react';
import { cinemasAPI } from '../services/api';
import { toast } from 'react-toastify';

const CinemasPage = () => {
  const [cinemas, setCinemas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch cinemas function
  const fetchCinemas = async () => {
    try {
      setIsLoading(true);
      const response = await cinemasAPI.getAll();
      console.log('CinemasPage - API Response:', response);
      
      // Handle different response formats (same logic as MovieContext)
      let cinemasData = [];
      if (response.data) {
        // If wrapped in data property
        if (Array.isArray(response.data)) {
          cinemasData = response.data;
        } else if (Array.isArray(response.data.data)) {
          cinemasData = response.data.data;
        }
      } else if (Array.isArray(response)) {
        // If direct array response
        cinemasData = response;
      }
      
      console.log('CinemasPage - Final cinemas data:', cinemasData);
      setCinemas(cinemasData);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      toast.error('Failed to fetch cinemas');
      setCinemas([]); // Fallback to empty array
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  // Ensure cinemas is always an array before filtering
  const safeCinemas = Array.isArray(cinemas) ? cinemas : [];

  // Filter cinemas based on city and search term (only by city and name)
  const filteredCinemas = safeCinemas.filter(cinema => {
    if (!cinema) return false;
    
    const matchesCity = selectedCity === 'all' || cinema.city === selectedCity;
    const matchesSearch = (cinema.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (cinema.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Get unique cities for filter
  const cities = ['all', ...new Set(safeCinemas.map(cinema => cinema?.city).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-dark-900 to-dark-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our <span className="text-primary-400">Cinema</span> Locations
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Find the perfect cinema near you. Experience premium entertainment with our cinema locations.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-dark-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Cinemas</label>
              <input
                type="text"
                placeholder="Search by name or city..."
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by City</label>
              <select
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city === 'all' ? 'All Cities' : city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cinemas Grid */}
        {filteredCinemas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCinemas.map((cinema) => (
              <CinemaCard key={cinema.cinemaId} cinema={cinema} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-dark-800 rounded-lg p-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v2a1 1 0 001 1h4a1 1 0 001-1v-2m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v10M9 21h6" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No Cinemas Found</h3>
              <p className="text-gray-400">Try adjusting your search criteria or check back later.</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-dark-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose ReelAura?</h2>
            <p className="text-xl text-gray-300">Premium cinema experience across Kosovo</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multiple Locations</h3>
              <p className="text-gray-400">Conveniently located across major cities in Kosovo</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Technology</h3>
              <p className="text-gray-400">Latest projection and sound systems for the best experience</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Great Value</h3>
              <p className="text-gray-400">Affordable prices with regular special offers and discounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Cinema Card Component - Only showing name and city (no cinemaId)
const CinemaCard = ({ cinema }) => {
  return (
    <div className="bg-dark-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-primary-600 p-3 rounded-lg mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{cinema.name}</h3>
            <div className="flex items-center text-gray-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{cinema.city}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-gray-400 text-sm">
            Experience premium entertainment at our {cinema.city} location
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinemasPage;