import React, { useState, useEffect } from 'react';
import { useMovies } from '../../context/MovieContext';
import { toast } from 'react-toastify';

const AdminCinemas = () => {
  const { cinemas, createCinema, updateCinema, deleteCinema, fetchCinemas, isLoading } = useMovies();
  const [showModal, setShowModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
  });

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
    });
    setEditingCinema(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (cinema) => {
    setFormData({
      name: cinema.name || '',
      city: cinema.city || '',
    });
    setEditingCinema(cinema);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cinemaData = {
      ...formData,
    };

    try {
      if (editingCinema) {
        await updateCinema(editingCinema.cinemaId, cinemaData);
        toast.success('Cinema updated successfully!');
      } else {
        await createCinema(cinemaData);
        toast.success('Cinema created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchCinemas();
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    }
  };

  const handleDelete = async (cinemaId, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteCinema(cinemaId);
        toast.success('Cinema deleted successfully!');
        fetchCinemas();
      } catch (error) {
        toast.error('Failed to delete cinema.');
      }
    }
  };

  // Safely ensure cinemas is an array
  const safeCinemas = Array.isArray(cinemas) ? cinemas : [];
  
  // Filter cinemas - only by city and name
  const filteredCinemas = safeCinemas.filter(cinema => {
    if (!cinema) return false;
    
    const matchesSearch = ((cinema.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (cinema.city ?? '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCity = filterCity === 'all' || cinema.city === filterCity;
    return matchesSearch && matchesCity;
  });

  // Get unique cities for filter
  const cities = ['all', ...new Set(safeCinemas.map(cinema => cinema?.city).filter(Boolean))];

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cinemas Management</h1>
            <p className="text-gray-400">Manage your cinema locations</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold btn-hover flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Cinema
          </button>
        </div>

        {/* Filters */}
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
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
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

        {/* Cinemas Table - Only showing Cinema Name and City */}
        <div className="bg-dark-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-700">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cinema Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-dark-800 divide-y divide-dark-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-400">
                      <div className="spinner mx-auto"></div>
                      Loading cinemas...
                    </td>
                  </tr>
                ) : filteredCinemas.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-400">
                      No cinemas found
                    </td>
                  </tr>
                ) : (
                  filteredCinemas.map((cinema) => (
                    <tr key={cinema.cinemaId} className="hover:bg-dark-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{cinema.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{cinema.city}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(cinema)}
                          className="text-blue-400 hover:text-blue-300 mr-4 transition-colors"
                          title="Edit Cinema"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(cinema.cinemaId, cinema.name)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Cinema"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal - Only Name and City fields */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {editingCinema ? 'Edit Cinema' : 'Add New Cinema'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cinema Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter cinema name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Enter city name"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-dark-600 text-white rounded-lg hover:bg-dark-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {editingCinema ? 'Update Cinema' : 'Add Cinema'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCinemas;