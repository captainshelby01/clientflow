import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ClientStatus } from '../../types/crm';
import { TODAY_ISO } from '../../data/initialData';

export const AddClientModal: React.FC = () => {
  const { isAddClientOpen, closeAddClientModal, addClient, navigateTo } = useCRM();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('Hospitality');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('London, UK');
  const [status, setStatus] = useState<ClientStatus>('Active');
  const [totalValue, setTotalValue] = useState('15000');
  const [billingTerms, setBillingTerms] = useState('Net 15');

  useEffect(() => {
    if (!isAddClientOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddClientModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAddClientOpen, closeAddClientModal]);

  if (!isAddClientOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    const newId = addClient({
      name: name.trim(),
      role: role.trim() || 'Primary Contact',
      company: company.trim(),
      industry: industry.trim() || 'Consulting',
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@company.com`,
      phone: phone.trim() || '+44 20 7946 0100',
      website: website.trim() || 'company.com',
      location: location.trim() || 'Remote',
      timezone: 'GMT+0',
      billingTerms: billingTerms.trim() || 'Net 15',
      preferredChannel: 'Email',
      status,
      lastContactDate: TODAY_ISO,
      totalValue: Math.max(0, Number(totalValue) || 0),
      tags: ['Advisory'],
    });

    setName('');
    setRole('');
    setCompany('');
    setEmail('');
    setPhone('');
    setWebsite('');
    closeAddClientModal();
    navigateTo('clients', { clientId: newId });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#13233A]/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-client-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAddClientModal();
      }}
    >
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEAE4]">
          <div>
            <h2 id="add-client-title" className="text-base font-semibold text-[#1A1D24] font-display">
              Add New Client
            </h2>
            <p className="text-xs text-[#7A808D] mt-0.5">
              Create a client workspace and profile record
            </p>
          </div>
          <button
            type="button"
            onClick={closeAddClientModal}
            className="p-1.5 rounded-md text-[#7A808D] hover:text-[#1A1D24] hover:bg-[#F3F1EC] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Client name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Role / title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Head of Brand"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Company *
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Oakwood Studio"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@oakwood.co"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 20 7946 0221"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Retainer">Retainer</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Past">Past</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Initial value (USD)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                className="w-full px-3 py-2 text-sm tabular-nums bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Billing terms
              </label>
              <input
                type="text"
                value={billingTerms}
                onChange={(e) => setBillingTerms(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="oakwood.co"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#ECEAE4]">
            <button
              type="button"
              onClick={closeAddClientModal}
              className="px-4 py-2 text-xs font-medium text-[#525866] bg-white border border-[#E5E2DC] rounded-lg hover:bg-[#FAF9F6] cursor-pointer whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#13233A] rounded-lg hover:bg-[#1D3454] cursor-pointer whitespace-nowrap shrink-0"
            >
              Create Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
