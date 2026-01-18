'use client';

import React, { useState } from 'react';
import { Search, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { RepsTable } from './component/RepsTable';

const mockCompanies: Company[] = [
  {
    name: 'TechVision',
    industry: 'Software Development',
    contacts: [
      {
        name: 'John Smith', company: 'TechVision', email: 'john@techvision.com', generateddesc: 'Experienced CEO with 15+ years in tech leadership, focused on innovative cloud solutions.',},
      { name: 'Sarah Johnson', company: 'TechVision', email: 'sarah@techvision.com', generateddesc: 'Marketing expert specializing in B2B tech campaigns and brand strategy.' },
    ]
  },
  {
    name: 'CloudSync',
    industry: 'Cloud Computing',
    contacts: [
      { name: 'Michael Chen',  company: 'CloudSync', email: 'michael@cloudsync.com', generateddesc: 'Business development professional with expertise in cloud partnerships and enterprise sales.' },
      { name: 'Emily Davis',  company: 'CloudSync', email: 'emily@cloudsync.com', generateddesc: 'Partnerships manager skilled in building strategic alliances in the cloud industry.' },
    ]
  },
  {
    name: 'DataCore Analytics',
    industry: 'Data Science',
    contacts: [
      { name: 'Robert Wilson',  company: 'DataCore Analytics', email: 'robert@datacore.com', generateddesc: 'VP Marketing with deep knowledge in data analytics and AI marketing strategies.' },
      { name: 'Jessica Lee',  company: 'DataCore Analytics', email: 'jessica@datacore.com', generateddesc: 'Event coordinator experienced in organizing tech conferences and data science meetups.' },
    ]
  },
];

interface Contact {
    name: string;
    company: string;
    email: string;
    generateddesc: string;
}

interface Company {
  name: string;
  industry: string;
  contacts: Contact[];
}

const CompanyCard: React.FC<{ company: Company }> = ({ company }) => (
  <motion.div 
    className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-md p-6 border border-slate-200"
    whileHover={{ scale: 1.02 }}
  >
    <h3 className="text-lg font-bold text-slate-900 mb-2">
      {company.name}
    </h3>
    <p className="text-sm text-slate-600 mb-4">
      {company.industry}
    </p>

    <RepsTable contacts={company.contacts} />
  </motion.div>
);


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
        company.industry.toLowerCase().includes(companyType.toLowerCase())
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
    <div className="px-4 py-8 sm:px-6 lg:px-8">
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
    
    {/* Grid of Company Cards with RepsTable */}
    <div className="space-y-6">
      {searchResults.map((company) => (
        <CompanyCard key={company.name} company={company} />
      ))}
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
          <div className="grid gap-6 md:grid-cols-2">
            {searchResults.map((company) => (
              <CompanyCard key={company.name} company={company} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
