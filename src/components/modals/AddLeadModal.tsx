import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { LEAD_STAGES, Lead, LeadStage } from '../../types/crm';
import { TODAY_ISO } from '../../data/initialData';

export const AddLeadModal: React.FC = () => {
  const { isAddLeadOpen, closeAddLeadModal, addLead, settings } = useCRM();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('B2B SaaS');
  const [serviceScope, setServiceScope] = useState('');
  const [value, setValue] = useState('12000');
  const [stage, setStage] = useState<LeadStage>('New Lead');
  const [source, setSource] = useState<Lead['source']>('Referral');
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-12-18');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(TODAY_ISO);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAddLeadOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddLeadModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAddLeadOpen, closeAddLeadModal]);

  if (!isAddLeadOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !serviceScope.trim()) {
      setError('Please enter contact name, company, and scope summary.');
      return;
    }

    const numericVal = Math.max(0, Number(value) || 0);
    const stageProbabilities: Record<LeadStage, number> = {
      'New Lead': 20,
      Contacted: 35,
      'Proposal Sent': 60,
      Negotiation: 80,
      Won: 100,
      Lost: 0,
    };

    addLead({
      name: name.trim(),
      role: role.trim() || 'Decision Maker',
      company: company.trim(),
      email:
        email.trim() ||
        `${name.trim().toLowerCase().replace(/\s+/g, '.')}@${company.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: phone.trim() || '+44 20 7946 0100',
      industry: industry.trim() || 'Consulting',
      serviceScope: serviceScope.trim(),
      value: numericVal,
      stage,
      source,
      probability: stageProbabilities[stage],
      expectedCloseDate,
      nextFollowUpDate,
      notes: notes.trim(),
    });

    setName('');
    setRole('');
    setCompany('');
    setEmail('');
    setPhone('');
    setServiceScope('');
    setValue('12000');
    setNotes('');
    setError('');
    closeAddLeadModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#13233A]/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-lead-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAddLeadModal();
      }}
    >
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEAE4]">
          <div>
            <h2 id="add-lead-title" className="text-base font-semibold text-[#1A1D24] font-display">
              Add New Lead
            </h2>
            <p className="text-xs text-[#7A808D] mt-0.5">
              Values stored in {settings.currency} base figures
            </p>
          </div>
          <button
            type="button"
            onClick={closeAddLeadModal}
            className="p-1.5 rounded-md text-[#7A808D] hover:text-[#1A1D24] hover:bg-[#F3F1EC] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Contact name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Vance"
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
                placeholder="e.g. VP of Product"
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
                placeholder="e.g. Northstar Labs"
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
                placeholder="e.g. Fintech"
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
                placeholder="jordan@northstar.io"
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
                placeholder="+44 20 7946 0100"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Project scope / service *
            </label>
            <input
              type="text"
              value={serviceScope}
              onChange={(e) => setServiceScope(e.target.value)}
              placeholder="e.g. Brand Strategy & Marketing Site"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Estimated value (USD)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 text-sm tabular-nums bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Pipeline stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              >
                {LEAD_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as Lead['source'])}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              >
                <option value="Referral">Referral</option>
                <option value="Inbound Website">Inbound Website</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Partner Agency">Partner Agency</option>
                <option value="Direct Outreach">Direct Outreach</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Next follow-up date
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-sm tabular-nums bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Expected close date
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm tabular-nums bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Context / notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Budget expectations, timeline, or key stakeholders..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#ECEAE4]">
            <button
              type="button"
              onClick={closeAddLeadModal}
              className="px-4 py-2 text-xs font-medium text-[#525866] bg-white border border-[#E5E2DC] rounded-lg hover:bg-[#FAF9F6] cursor-pointer whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#13233A] rounded-lg hover:bg-[#1D3454] cursor-pointer whitespace-nowrap shrink-0"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
