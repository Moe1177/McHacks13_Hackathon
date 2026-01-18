'use client';

import { useState, useEffect, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, Copy, CheckCircle, Loader2, Building2, Calendar,
  Send, X, Square, CheckSquare
} from 'lucide-react';

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
  updatedAt: string;
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Selection state
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  // Email composer state
  const [showComposer, setShowComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isSignedIn && id) {
      fetchCampaign();
    }
  }, [isSignedIn, id]);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data);
      } else if (res.status === 404) {
        setError('Campaign not found');
      } else {
        setError('Failed to load campaign');
      }
    } catch (err) {
      console.error('Failed to fetch campaign:', err);
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const copyAllEmails = async () => {
    if (campaign?.contacts) {
      const allEmails = campaign.contacts.map(c => c.email).join('\n');
      await navigator.clipboard.writeText(allEmails);
      setCopiedEmail('all');
      setTimeout(() => setCopiedEmail(null), 2000);
    }
  };

  // Selection handlers
  const toggleEmail = (email: string, metaKey: boolean) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (metaKey) {
        // Cmd/Ctrl+Click: toggle this email
        if (next.has(email)) {
          next.delete(email);
        } else {
          next.add(email);
        }
      } else {
        // Regular click: select only this email (or deselect if already selected)
        if (next.has(email) && next.size === 1) {
          next.clear();
        } else {
          next.clear();
          next.add(email);
        }
      }
      return next;
    });
  };

  const toggleCompany = (emails: string[]) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      const allSelected = emails.every(e => next.has(e));
      if (allSelected) {
        emails.forEach(e => next.delete(e));
      } else {
        emails.forEach(e => next.add(e));
      }
      return next;
    });
  };

  const selectAll = () => {
    if (campaign?.contacts) {
      setSelectedEmails(new Set(campaign.contacts.map(c => c.email)));
    }
  };

  const clearSelection = () => {
    setSelectedEmails(new Set());
  };

  // Email composer handlers
  const openComposer = () => {
    // Set default template
    setEmailSubject(`Partnership Opportunity - ${campaign?.name || 'Our Campaign'}`);
    setEmailBody(`Hi,

I'm reaching out regarding a potential partnership opportunity in the ${campaign?.sector || 'technology'} space.

We believe there could be great synergy between our organizations and would love to explore collaboration opportunities.

Would you be available for a brief call this week to discuss further?

Best regards`);
    setShowComposer(true);
    setSendResult(null);
  };

  const sendEmails = async () => {
    if (selectedEmails.size === 0) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: Array.from(selectedEmails),
          subject: emailSubject,
          body: emailBody,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSendResult({
          success: true,
          message: `Successfully sent ${data.sent} email${data.sent > 1 ? 's' : ''}!`,
        });
        // Clear selection after successful send
        setTimeout(() => {
          setShowComposer(false);
          clearSelection();
          setSendResult(null);
        }, 2000);
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Failed to send emails',
        });
      }
    } catch (err) {
      console.error('Failed to send emails:', err);
      setSendResult({
        success: false,
        message: 'Failed to send emails',
      });
    } finally {
      setSending(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
          <p className="mt-2 text-slate-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Campaign not found'}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="text-green-600 hover:underline"
          >
            Back to campaigns
          </button>
        </div>
      </div>
    );
  }

  const contacts = campaign.contacts || [];

  // Group contacts by company
  const companiesMap = contacts.reduce((acc, contact) => {
    if (!acc[contact.company]) {
      acc[contact.company] = [];
    }
    acc[contact.company].push(contact.email);
    return acc;
  }, {} as Record<string, string[]>);

  const companies = Object.entries(companiesMap);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Back button */}
      <button
        onClick={() => router.push('/campaigns')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to campaigns
      </button>

      {/* Campaign header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border rounded-xl p-6 mb-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{campaign.name}</h1>
            <div className="flex items-center gap-4 text-slate-600 text-sm">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {campaign.sector}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(campaign.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-slate-500 text-sm">Companies requested</p>
            <p className="text-xl font-semibold">{campaign.numberOfCompanies}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Companies found</p>
            <p className="text-xl font-semibold">{companies.length}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Contacts found</p>
            <p className="text-xl font-semibold">{contacts.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Contacts by company */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border rounded-xl p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contacts by Company
          </h2>
          <div className="flex gap-2">
            {contacts.length > 0 && (
              <>
                <button
                  onClick={selectAll}
                  className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1 border rounded-lg hover:bg-slate-50"
                >
                  Select all
                </button>
                <button
                  onClick={copyAllEmails}
                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 px-3 py-1 border border-green-600 rounded-lg hover:bg-green-50"
                >
                  {copiedEmail === 'all' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy all
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {companies.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No contacts found</p>
        ) : (
          <div className="space-y-4">
            {companies.map(([company, emails], companyIndex) => {
              const allSelected = emails.every(e => selectedEmails.has(e));
              const someSelected = emails.some(e => selectedEmails.has(e));

              return (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: companyIndex * 0.05 }}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className="bg-slate-50 px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-100"
                    onClick={() => toggleCompany(emails)}
                  >
                    <button className="text-slate-600">
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-green-600" />
                      ) : someSelected ? (
                        <div className="w-4 h-4 border-2 border-green-600 rounded bg-green-100" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <Building2 className="w-4 h-4 text-slate-600" />
                    <span className="font-medium text-slate-800">{company}</span>
                    <span className="text-slate-500 text-sm">({emails.length} contact{emails.length > 1 ? 's' : ''})</span>
                  </div>
                  <div className="divide-y">
                    {emails.map((email, emailIndex) => {
                      const isSelected = selectedEmails.has(email);
                      return (
                        <div
                          key={emailIndex}
                          className={`flex items-center justify-between px-4 py-2 cursor-pointer group transition-colors ${
                            isSelected ? 'bg-green-50' : 'hover:bg-slate-50'
                          }`}
                          onClick={(e) => toggleEmail(email, e.metaKey || e.ctrlKey)}
                        >
                          <div className="flex items-center gap-3">
                            <button className="text-slate-600">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-green-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                            <span className="text-slate-700">{email}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(email);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-700"
                          >
                            {copiedEmail === email ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Selection action bar */}
      <AnimatePresence>
        {selectedEmails.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4"
          >
            <span className="text-sm">
              {selectedEmails.size} selected
            </span>
            <button
              onClick={openComposer}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-full text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              Craft Email
            </button>
            <button
              onClick={clearSelection}
              className="text-slate-400 hover:text-white text-sm"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email composer modal */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !sending && setShowComposer(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Compose Email
                </h2>
                <button
                  onClick={() => !sending && setShowComposer(false)}
                  className="text-slate-400 hover:text-slate-600"
                  disabled={sending}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    To ({selectedEmails.size} recipient{selectedEmails.size > 1 ? 's' : ''})
                  </label>
                  <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-slate-50 max-h-24 overflow-auto">
                    {Array.from(selectedEmails).map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center bg-white border px-2 py-0.5 rounded text-sm text-slate-700"
                      >
                        {email}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    disabled={sending}
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                    disabled={sending}
                  />
                </div>

                {/* Result message */}
                {sendResult && (
                  <div
                    className={`p-3 rounded-lg ${
                      sendResult.success
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {sendResult.message}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 p-4 border-t bg-slate-50">
                <button
                  onClick={() => setShowComposer(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-white"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmails}
                  disabled={sending || !emailSubject || !emailBody}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email{selectedEmails.size > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}