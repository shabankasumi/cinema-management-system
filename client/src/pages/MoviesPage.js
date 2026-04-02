import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '../context/MovieContext';

const MoviesPage = () => {
  const { movies, isLoading} = useMovies();
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique genres from movies
  const genres = [...new Set(movies.map(movie => movie.genre).filter(Boolean))];

  useEffect(() => {
    let filtered = movies;

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(movie =>
        movie.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(movie => movie.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMovies(filtered);
  }, [movies, selectedGenre, selectedStatus, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">All Movies</h1>
          <p className="text-xl text-gray-400">Discover the latest blockbusters and timeless classics</p>
        </div>

        {/* Filters */}
        <div className="bg-dark-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Movies
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or genre..."
                  className="w-full px-4 py-3 pl-10 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <select
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="all">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedGenre !== 'all' || selectedStatus !== 'all' || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-gray-300 text-sm">Active filters:</span>
              {selectedGenre !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                  {selectedGenre}
                  <button
                    onClick={() => setSelectedGenre('all')}
                    className="ml-2 hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                  {selectedStatus}
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="ml-2 hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedGenre('all');
                  setSelectedStatus('all');
                  setSearchTerm('');
                }}
                className="text-primary-400 hover:text-primary-300 text-sm underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredMovies.length} of {movies.length} movies
          </p>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.movieId} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-24 w-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0v6a1 1 0 01-1 1H8a1 1 0 01-1-1V4zm0 0v16m-6-2a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No movies found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || selectedGenre !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No movies available at the moment.'}
            </p>
            {(searchTerm || selectedGenre !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSelectedGenre('all');
                  setSelectedStatus('all');
                  setSearchTerm('');
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg btn-hover"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Movie Card Component
const MovieCard = ({ movie }) => {
  const placeholderImage = `https://via.placeholder.com/300x450/374151/ffffff?text=${encodeURIComponent(movie.title)}`;

  return (
    <Link to={`/movies/${movie.movieId}`} className="movie-card block group">
      <div className="bg-dark-800 rounded-lg overflow-hidden shadow-lg">
        <div className="relative">
          <img
            src={movie.posterPath || placeholderImage}
            alt={movie.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${movie.status === 'Now Showing'
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white'
              }`}>
              {movie.status}
            </span>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold">
                View Details
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {movie.title}
          </h3>
          <p className="text-gray-400 text-sm mb-2">{movie.genre}</p>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>{movie.duration}</span>
            <span className="bg-dark-700 px-2 py-1 rounded">{movie.age_Restriction}</span>
          </div>
          {movie.description && (
            <p className="text-gray-500 text-xs mt-2 line-clamp-2">
              {movie.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MoviesPage;