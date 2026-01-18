'use client';

import React, { useState } from 'react';
import { Building2, Users, DollarSign, MapPin, TrendingUp, Search, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';



interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  employees: string;
  revenue: string;
  location: string;
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechVision Inc.',
    industry: 'Software Development',
    description: 'Leading provider of cloud-based enterprise solutions',
    employees: '2,500+',
    revenue: '$450M',
    location: 'San Francisco, CA'
  },
  {
    id: '2',
    name: 'GreenEnergy Solutions',
    industry: 'Renewable Energy',
    description: 'Innovative solar and wind energy infrastructure',
    employees: '1,200+',
    revenue: '$280M',
    location: 'Austin, TX'
  },
  {
    id: '3',
    name: 'DataStream Analytics',
    industry: 'Data Science',
    description: 'AI-powered business intelligence and analytics platform',
    employees: '850+',
    revenue: '$120M',
    location: 'Seattle, WA'
  },
  {
    id: '4',
    name: 'HealthTech Innovations',
    industry: 'Healthcare Technology',
    description: 'Digital health solutions and telemedicine platform',
    employees: '3,100+',
    revenue: '$620M',
    location: 'Boston, MA'
  }
];

export default function SearchDashboard() {
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [searchMode, setSearchMode] = useState<'name' | 'type' | null>(null);

  const handleCompanyNameSearch = () => {
    if (companyName.trim()) {
      setSearchMode('name');
      // Mock search by name
      const results = mockCompanies.filter(company =>
        company.name.toLowerCase().includes(companyName.toLowerCase())
      );
      setSearchResults(results.length > 0 ? results : mockCompanies.slice(0, 2));
    }
  };

  const handleCompanyTypeSearch = () => {
    if (companyType.trim()) {
      setSearchMode('type');
      // Mock search by type/industry
      const results = mockCompanies.filter(company =>
        company.industry.toLowerCase().includes(companyType.toLowerCase()) ||
        company.description.toLowerCase().includes(companyType.toLowerCase())
      );
      setSearchResults(results.length > 0 ? results : mockCompanies);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, searchType: 'name' | 'type') => {
    if (e.key === 'Enter') {
      if (searchType === 'name') {
        handleCompanyNameSearch();
      } else {
        handleCompanyTypeSearch();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div 
        className="mb-8 text-center"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl mb-2 font-bold">
          Hackathon Sponsors and Marketing Helper
        </h1>
        <p className="text-slate-600">Search for companies by name or discover businesses that match your criteria for your hackathon</p>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="grid grid-cols-2 gap-6">
          {/* Company Name Search */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <label className="flex items-center gap-2 text-slate-700 font-medium text-lg">
              <Search className="w-5 h-5 text-green-600" />
              Search by Company Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'name')}
                placeholder="e.g., TechVision, Apple, Microsoft..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleCompanyNameSearch}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Company
            </button>
          </motion.div>

          {/* Company Type Search */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <label className="flex items-center gap-2 text-slate-700 font-medium text-lg">
              <Sparkles className="w-5 h-5 text-green-600" />
              Name the industry of the company
            </label>
            <div className="relative">
              <input
                type="text"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'type')}
                placeholder="e.g., tech companies, healthcare technology..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleCompanyTypeSearch}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Find Companies
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Results Section */}
      {searchResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900 text-2xl">
              {searchMode === 'name' 
                ? `Results for "${companyName}"` 
                : `Companies matching "${companyType}"`}
            </h2>
            <span className="text-slate-600 text-sm">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
            </span>
          </div>
          
        </div>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && (searchMode === null) && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <Star className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-900 mb-2 text-xl">Start Your Search</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Get in touch with ease and market the way you need 
          </p>
        </motion.div>
      )}
    </div>
  );
}
