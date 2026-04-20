import React, { useState } from 'react';
import { FiFilter, FiDollarSign, FiHome, FiUsers, FiStar, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FACILITIES_LIST = [
  'WiFi', 'Air Conditioning', 'Attached Bathroom',
  'Kitchen', 'Parking', 'Laundry',
  'Security', 'Furniture', 'Hot Water',
  'Power Backup', 'CCTV', 'Garden'
];

const ACCOMMODATION_TYPES = [
  'Single Room', 'Shared Room', 'Annex/Portion',
  'Apartment/Flat', 'Hostel', 'Studio', 'Other'
];

const BoardingFilter = ({ filters, setFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    price: true,
    capacity: true,
    rating: true,
    facilities: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceSlider = (e) => {
    setFilters(prev => ({ ...prev, maxPrice: e.target.value }));
  };

  const handleTypeToggle = (type) => {
    setFilters(prev => {
      const current = prev.type ? prev.type.split(',') : [];
      let updated;
      if (current.includes(type)) {
        updated = current.filter(t => t !== type);
      } else {
        updated = [...current, type];
      }
      return { ...prev, type: updated.join(',') };
    });
  };

  const handleFacilityToggle = (facility) => {
    setFilters(prev => {
      const current = prev.facilities ? prev.facilities.split(',') : [];
      let updated;
      if (current.includes(facility)) {
        updated = current.filter(f => f !== facility);
      } else {
        updated = [...current, facility];
      }
      return { ...prev, facilities: updated.join(',') };
    });
  };

  const handleRatingSelect = (rating) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === String(rating) ? '' : String(rating)
    }));
  };

  const isTypeSelected = (type) => {
    return filters.type ? filters.type.split(',').includes(type) : false;
  };

  const isFacilitySelected = (fac) => {
    return filters.facilities ? filters.facilities.split(',').includes(fac) : false;
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.type) count += filters.type.split(',').length;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.capacity) count++;
    if (filters.rating) count++;
    if (filters.facilities) count += filters.facilities.split(',').length;
    return count;
  };

  const SectionHeader = ({ title, icon: Icon, section, badge }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between py-1.5 group"
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
        <Icon size={13} className="text-gray-400" />
        {title}
        {badge > 0 && (
          <span className="bg-blue-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>
        )}
      </span>
      {expandedSections[section] ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-2">
          <FiFilter size={14} className="text-white/80" />
          <h3 className="text-sm font-bold text-white">Filters</h3>
        </div>
        {activeFilterCount() > 0 && (
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {activeFilterCount()} active
          </span>
        )}
      </div>

      <div className="px-4 py-3 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <hr className="border-gray-100" />

        {/* Accommodation Type */}
        <div>
          <SectionHeader
            title="Type"
            icon={FiHome}
            section="type"
            badge={filters.type ? filters.type.split(',').length : 0}
          />
          {expandedSections.type && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ACCOMMODATION_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                    isTypeSelected(type)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Price Range Slider */}
        <div>
          <SectionHeader title="Price Range" icon={FiDollarSign} section="price" badge={filters.minPrice || filters.maxPrice ? 1 : 0} />
          {expandedSections.price && (
            <div className="mt-1.5 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  placeholder="Min"
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-xs outline-none"
                />
                <span className="text-gray-300 text-xs">—</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  placeholder="Max"
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-xs outline-none"
                />
              </div>
              <div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={filters.maxPrice || 100000}
                  onChange={handlePriceSlider}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>Rs. 0</span>
                  <span className="font-medium text-blue-600">
                    {filters.maxPrice ? `Rs. ${Number(filters.maxPrice).toLocaleString()}` : 'Rs. 100,000'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Capacity */}
        <div>
          <SectionHeader title="Capacity" icon={FiUsers} section="capacity" badge={filters.capacity ? 1 : 0} />
          {expandedSections.capacity && (
            <div className="mt-1.5 flex gap-1.5">
              {[1, 2, 3, 4, '5+'].map(cap => {
                const val = cap === '5+' ? '5' : String(cap);
                return (
                  <button
                    key={cap}
                    onClick={() => setFilters(prev => ({ ...prev, capacity: prev.capacity === val ? '' : val }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      filters.capacity === val
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {cap}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Rating */}
        <div>
          <SectionHeader title="Min Rating" icon={FiStar} section="rating" badge={filters.rating ? 1 : 0} />
          {expandedSections.rating && (
            <div className="mt-1.5 flex gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRatingSelect(star)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-0.5 ${
                    filters.rating === String(star)
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  {star}<FiStar size={10} className={filters.rating === String(star) ? 'fill-current' : ''} />
                </button>
              ))}
            </div>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Facilities */}
        <div>
          <SectionHeader
            title="Facilities"
            icon={FiFilter}
            section="facilities"
            badge={filters.facilities ? filters.facilities.split(',').length : 0}
          />
          {expandedSections.facilities && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FACILITIES_LIST.map(fac => (
                <button
                  key={fac}
                  onClick={() => handleFacilityToggle(fac)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                    isFacilitySelected(fac)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {fac}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={() => setFilters({ minPrice: '', maxPrice: '', type: '', capacity: '', facilities: '', rating: '' })}
          className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2 rounded-lg transition text-xs"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default BoardingFilter;
