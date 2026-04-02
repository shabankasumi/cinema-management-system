import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { movies, cinemas, events } = useMovies();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMovies: 0,
    nowShowing: 0,
    comingSoon: 0,
    totalCinemas: 0,
    totalSchedules: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Calculate statistics with safe array access
    const safeMovies = Array.isArray(movies) ? movies : [];
    const safeCinemas = Array.isArray(cinemas) ? cinemas : [];
    const safeEvents = Array.isArray(events) ? events : [];
    
    const nowShowing = safeMovies.filter(movie => movie.status === 'Active').length;
    const comingSoon = safeMovies.filter(movie => movie.status === 'Inactive').length;

    setStats({
      totalMovies: safeMovies.length,
      nowShowing,
      comingSoon,
      totalCinemas: safeCinemas.length,
      totalSchedules: safeEvents.length,
      recentActivity: [
        { id: 1, action: 'New movie added', time: '2 hours ago', type: 'movie' },
        { id: 2, action: 'Event updated', time: '4 hours ago', type: 'schedule' },
        { id: 3, action: 'Cinema location added', time: '1 day ago', type: 'cinema' },
      ]
    });
  }, [movies, cinemas, events]);

  const adminMenuItems = [
    {
      title: 'Movies Management',
      description: 'Add, edit, and manage movie listings',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h3z" />
        </svg>
      ),
      link: '/admin/movies',
      color: 'bg-blue-600'
    },
    {
      title: 'Cinema Management',
      description: 'Manage cinema locations and halls',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      link: '/admin/cinemas',
      color: 'bg-green-600'
    },
    {
      title: 'Events Management',
      description: 'Create and manage movie events',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h4z" />
        </svg>
      ),
      link: '/admin/events',
      color: 'bg-purple-600'
    },
    {
      title: 'Reservations',
      description: 'View and manage customer reservations',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      link: '/admin/reservations',
      color: 'bg-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.username}!</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Movies</p>
                <p className="text-2xl font-bold text-white">{stats.totalMovies}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-8-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active</p>
                <p className="text-2xl font-bold text-white">{stats.nowShowing}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Cinemas</p>
                <p className="text-2xl font-bold text-white">{stats.totalCinemas}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Schedules</p>
                <p className="text-2xl font-bold text-white">{stats.totalSchedules}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminMenuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-dark-800 rounded-lg p-6 hover:bg-dark-700 transition-colors group"
            >
              <div className={`${item.color} p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(item.icon, { className: "w-8 h-8 text-white" })}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-dark-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center p-3 bg-dark-700 rounded-lg">
                  <div className={`p-2 rounded-lg mr-4 ${
                    activity.type === 'movie' ? 'bg-blue-600' :
                    activity.type === 'schedule' ? 'bg-purple-600' : 'bg-green-600'
                  }`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-dark-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-gray-300">Movies Active</span>
                <span className="text-white font-semibold">{stats.nowShowing}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-gray-300">Coming Soon Movies</span>
                <span className="text-white font-semibold">{stats.comingSoon}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-gray-300">Active Cinemas</span>
                <span className="text-white font-semibold">{stats.totalCinemas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                <span className="text-gray-300">Total Events</span>
                <span className="text-white font-semibold">{stats.totalSchedules}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Need to add something quickly?</h3>
              <p className="text-gray-100">Use these shortcuts to manage your cinema content efficiently.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Link
                to="/admin/movies"
                className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold btn-hover"
              >
                Add Movie
              </Link>
              <Link
                to="/admin/events"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 py-2 rounded-lg font-semibold btn-hover transition-colors"
              >
                Add Event
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;