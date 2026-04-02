import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '../context/MovieContext';

const HomePage = () => {
  const { movies, isLoading, getFeaturedMovies, getUpcomingMovies } = useMovies();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  useEffect(() => {
    if (movies.length > 0) {
      setFeaturedMovies(getFeaturedMovies());
      setUpcomingMovies(getUpcomingMovies());
    }
  }, [movies, getFeaturedMovies, getUpcomingMovies]);

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
    <section className="hero-gradient relative overflow-hidden">
        {/* FIX: overlay mos me blloku klikimet */}
        <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to <span className="text-primary-400">ReelAura</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the magic of cinema with the latest blockbusters.
            </p>

            {/* ✅ BUTTONS FIXED */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/movies"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition-all duration-200 text-center"
              >
                 Browse Movies
              </Link>

              <Link
                to="/events"
                className="bg-white text-dark-900 hover:bg-gray-200 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transition-all duration-200 text-center"
              >
                 View Events
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Special Offers */}
      <section className="py-16 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 Special Offer: Movie Tickets Only 2€!
            </h2>
            <p className="text-xl text-gray-100 mb-6">
              Limited time offer - Available on June 1st for all movies
            </p>
            <Link
              to="/events"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold btn-hover inline-block"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* Now Showing */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">Active Movies</h2>
            <Link
              to="/movies"
              className="text-primary-400 hover:text-primary-300 font-semibold flex items-center transition-colors"
            >
              View All
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featuredMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredMovies.slice(0, 8).map((movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies currently Active</p>
            </div>
          )}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">Inactive Movies</h2>
            <Link
              to="/movies"
              className="text-primary-400 hover:text-primary-300 font-semibold flex items-center transition-colors"
            >
              View All
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {upcomingMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {upcomingMovies.slice(0, 8).map((movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No Inactive movies scheduled</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose ReelAura?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center card-gradient p-8 rounded-xl">
              <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Premium Experience</h3>
              <p className="text-gray-400">State-of-the-art projection and surround sound systems for the ultimate movie experience.</p>
            </div>

            <div className="text-center card-gradient p-8 rounded-xl">
              <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Multiple Locations</h3>
              <p className="text-gray-400">Conveniently located cinemas across Kosovo with easy access and ample parking.</p>
            </div>

            <div className="text-center card-gradient p-8 rounded-xl">
              <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Affordable Prices</h3>
              <p className="text-gray-400">Competitive ticket prices with special offers and discounts for students and families.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Movie Card Component
const MovieCard = ({ movie }) => {
  const placeholderImage = `https://via.placeholder.com/300x450/374151/ffffff?text=${encodeURIComponent(movie.title)}`;
  
  return (
    <Link to={`/movies/${movie.movieId}`} className="movie-card block">
      <div className="bg-dark-800 rounded-lg overflow-hidden shadow-lg">
        <div className="aspect-w-2 aspect-h-3 relative">
          <img
            src={movie.posterPath || placeholderImage}
            alt={movie.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              movie.status === 'Active' 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white'
            }`}>
              {movie.status}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{movie.title}</h3>
          <p className="text-gray-400 text-sm mb-2">{movie.genre}</p>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>{movie.duration}</span>
            <span>{movie.age_Restriction}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HomePage;