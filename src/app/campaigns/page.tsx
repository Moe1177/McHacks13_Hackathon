'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Contact {
  email: string;
  company: string;
}

interface Campaign {
  _id: string;
  name: string;
  sector: string;
  numberOfCompanies: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  contacts: Contact[] | null;
  createdAt: string;
}

export default function CampaignsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    numberOfCompanies: 1,
  });

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchCampaigns();
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchCampaigns, 10000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn]);

  // Create campaign
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: '', sector: '', numberOfCompanies: 1 });
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setCreating(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Campaign['status'] }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      running: <Loader2 className="w-4 h-4 animate-spin" />,
      completed: <CheckCircle className="w-4 h-4" />,
      failed: <XCircle className="w-4 h-4" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <a href="/sign-in" className="text-green-600 hover:underline">
            Go to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Campaigns</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchCampaigns}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Tech Outreach Q1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sector / Industry
                </label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Number of Companies
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.numberOfCompanies}
                  onChange={(e) => setFormData({ ...formData, numberOfCompanies: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Campaign List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
          <p className="mt-2 text-slate-600">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <p className="text-slate-600 mb-4">No campaigns yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-green-600 hover:underline"
          >
            Create your first campaign
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <motion.div
              key={campaign._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => campaign.status === 'completed' && router.push(`/campaigns/${campaign._id}`)}
              className={`bg-white border rounded-xl p-4 hover:shadow-md transition-shadow ${
                campaign.status === 'completed' ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  <p className="text-slate-600 text-sm">{campaign.sector}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {new Date(campaign.createdAt).toLocaleDateString()} &middot; {campaign.numberOfCompanies} companies
                  </p>
                </div>
                <StatusBadge status={campaign.status} />
              </div>

              {/* Show preview if completed */}
              {campaign.status === 'completed' && campaign.contacts && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-600">
                      <p>{campaign.contacts.length} contacts found</p>
                    </div>
                    <span className="text-green-600 text-sm font-medium">View details →</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
