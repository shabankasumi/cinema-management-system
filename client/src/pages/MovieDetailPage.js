import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchMovieById, isLoading } = useMovies();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const loadMovie = async () => {
      const movieData = await fetchMovieById(id);
      setMovie(movieData);
    };
    loadMovie();
  }, [id, fetchMovieById]);

  const handleBookTicket = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/events' } } });
      return;
    }

    navigate('/events');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Movie not found</h1>
          <Link
            to="/movies"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg btn-hover"
          >
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const placeholderImage = `https://via.placeholder.com/400x600/374151/ffffff?text=${encodeURIComponent(movie.title)}`;

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="relative bg-gradient-to-r from-dark-900 to-dark-800">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <img
                  src={movie.posterPath || placeholderImage}
                  alt={movie.title}
                  className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
                  onError={(e) => {
                    e.target.src = placeholderImage;
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="mb-4">
                <Link
                  to="/movies"
                  className="text-primary-400 hover:text-primary-300 flex items-center mb-4 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Movies
                </Link>
              </div>

              <div className="mb-6">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
                    movie.status === 'Now Showing'
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {movie.status}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{movie.title}</h1>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-dark-800 p-4 rounded-lg text-center">
                  <div className="text-primary-400 font-semibold text-sm mb-1">Duration</div>
                  <div className="text-white text-lg">{movie.duration}</div>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg text-center">
                  <div className="text-primary-400 font-semibold text-sm mb-1">Genre</div>
                  <div className="text-white text-lg">{movie.genre}</div>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg text-center">
                  <div className="text-primary-400 font-semibold text-sm mb-1">Age Rating</div>
                  <div className="text-white text-lg">{movie.age_Restriction}</div>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg text-center">
                  <div className="text-primary-400 font-semibold text-sm mb-1">Language</div>
                  <div className="text-white text-lg">{movie.language}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-dark-800 p-4 rounded-lg">
                  <div className="text-primary-400 font-semibold text-sm mb-2">Format</div>
                  <div className="text-white">{movie.format}</div>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg">
                  <div className="text-primary-400 font-semibold text-sm mb-2">Subtitles</div>
                  <div className="text-white">{movie.subtitled ? 'Available' : 'Not Available'}</div>
                </div>
              </div>

              {movie.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
                  <p className="text-gray-300 leading-relaxed text-lg">{movie.description}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleBookTicket}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold btn-hover flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Book Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-dark-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Movie Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-dark-700 pb-2">
                <span className="text-gray-400">Title</span>
                <span className="text-white font-medium">{movie.title}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dark-700 pb-2">
                <span className="text-gray-400">Genre</span>
                <span className="text-white font-medium">{movie.genre}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dark-700 pb-2">
                <span className="text-gray-400">Duration</span>
                <span className="text-white font-medium">{movie.duration}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dark-700 pb-2">
                <span className="text-gray-400">Age Restriction</span>
                <span className="text-white font-medium">{movie.age_Restriction}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dark-700 pb-2">
                <span className="text-gray-400">Language</span>
                <span className="text-white font-medium">{movie.language}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dark-700 pb-2">
                <span className="text-gray-400">Format</span>
                <span className="text-white font-medium">{movie.format}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtitles</span>
                <span className="text-white font-medium">{movie.subtitled ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Watch?</h3>
              <p className="text-gray-100 mb-6">
                Book your tickets now and enjoy the ultimate cinema experience at ReelAura.
              </p>
              <button
                onClick={handleBookTicket}
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold btn-hover"
              >
                Book Now
              </button>
            </div>

            <div className="bg-dark-800 rounded-xl p-6">
              <h4 className="text-xl font-bold text-white mb-4">Special Features</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-primary-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Premium Sound System
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-primary-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  4K Digital Projection
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-primary-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Comfortable Seating
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-primary-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Climate Controlled
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;