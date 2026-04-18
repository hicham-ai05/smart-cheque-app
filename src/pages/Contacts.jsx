import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../utils/schemas';
import api from '../api';
import { Plus, Edit2, Trash2, Search, X, Users, Building2, Phone } from 'lucide-react';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { type: 'CLIENT', name: '', phone: '', address: '', ice: '000000000000000', if: '', rc: '' }
  });

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data);
    } catch (err) { }
  };

  useEffect(() => { fetchContacts(); }, []);

  const openModal = (contact = null) => {
    if (contact) {
      setEditingId(contact.id);
      reset({ ...contact, phone: contact.phone || '', address: contact.address || '', ice: contact.ice || '', if: contact.if || '', rc: contact.rc || '' });
    } else {
      setEditingId(null);
      reset({ type: 'CLIENT', name: '', phone: '', address: '', ice: '000000000000000', if: '', rc: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); reset(); };

  const onSubmit = async (data) => {
    try {
      if (editingId) await api.put(`/contacts/${editingId}`, data);
      else await api.post('/contacts', data);
      fetchContacts();
      closeModal();
    } catch (error) { alert('Error saving contact'); }
  };

  const deleteContact = async (id) => {
    if (window.confirm('Delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        fetchContacts();
      } catch (err) { }
    }
  };

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.ice.includes(search));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Contacts Hub</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
            Manage your network of clients and suppliers globally.
          </p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="group flex items-center gap-2 bg-white text-surface-darker px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 hover:bg-slate-50 shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-1 ring-white/50"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>New Contact</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface-card border border-surface-border rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden ring-1 ring-white/5">
        
        {/* Subtle glow inside card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="p-5 border-b border-surface-border flex items-center justify-between relative z-10">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or ICE..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface-dark/50 border border-surface-border rounded-lg text-white placeholder:text-slate-500 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-surface-darker/50 text-slate-400 font-medium tracking-wider text-xs uppercase border-b border-surface-border backdrop-blur-md">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Entity Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 font-mono">ICE Number</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-slate-300">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                     <div className="flex flex-col items-center justify-center opacity-50">
                        <Users size={48} className="mb-4 text-slate-500" />
                        <p className="text-lg text-slate-400 font-medium">No contacts found.</p>
                     </div>
                  </td>
                </tr>
              ) : filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset 
                      ${contact.type === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-purple-500/10 text-purple-400 ring-purple-500/20'}`}>
                      {contact.type === 'CLIENT' ? <Users size={12}/> : <Building2 size={12}/>}
                      {contact.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{contact.name}</div>
                    {contact.rc && <div className="text-xs text-slate-500 mt-0.5 font-mono">RC: {contact.rc}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {contact.phone ? (
                       <div className="flex items-center gap-2 text-slate-400">
                         <Phone size={14}/> <span>{contact.phone}</span>
                       </div>
                    ) : <span className="text-slate-600">-</span>}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {contact.ice}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(contact)} className="p-2 text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors ring-1 ring-transparent hover:ring-brand-500/30">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => deleteContact(contact.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ring-1 ring-transparent hover:ring-red-500/30">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Glassmorphic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-dark border border-surface-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
            
            <div className="px-6 py-5 flex items-center justify-between border-b border-surface-border">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Contact' : 'Create New Contact'}
              </h2>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold tracking-wide text-slate-400 uppercase mb-1.5">Type</label>
                  <select {...register("type")} className="w-full px-3 py-2.5 text-sm bg-surface-darker border border-surface-border text-white rounded-lg focus:ring-1 focus:ring-brand-500 outline-none">
                    <option value="CLIENT">Client</option>
                    <option value="SUPPLIER">Supplier</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold tracking-wide text-slate-400 uppercase mb-1.5">Phone (Optional)</label>
                  <input {...register("phone")} type="text" className="w-full px-3 py-2.5 text-sm bg-surface-darker border border-surface-border text-white rounded-lg focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold tracking-wide text-slate-400 uppercase mb-1.5">Full Name / Entity Name</label>
                  <input {...register("name")} type="text" className="w-full px-3 py-2.5 text-sm bg-surface-darker border border-surface-border text-white rounded-lg focus:ring-1 focus:ring-brand-500 outline-none" />
                  {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold tracking-wide text-slate-400 uppercase mb-1.5">ICE (Legal requirement - 15 digits)</label>
                  <input {...register("ice")} type="text" className="w-full px-3 py-2.5 text-sm bg-surface-darker border border-surface-border text-brand-300 font-mono rounded-lg focus:ring-1 focus:ring-brand-500 outline-none" placeholder="000000000000000" />
                  {errors.ice && <p className="text-red-400 text-xs mt-1.5">{errors.ice.message}</p>}
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold tracking-wide text-slate-400 uppercase mb-1.5">IF (Max 9 digits)</label>
                  <input {...register("if")} type="text" className="w-full px-3 py-2.5 text-sm bg-surface-darker border border-surface-border text-slate-300 font-mono rounded-lg focus:ring-1 focus:ring-brand-500 outline-none" />
                  {errors.if && <p className="text-red-400 text-xs mt-1.5">{errors.if.message}</p>}
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold tracking-wide text-slate-400 uppercase mb-1.5">RC</label>
                  <input {...register("rc")} type="text" className="w-full px-3 py-2.5 text-sm bg-surface-darker border border-surface-border text-slate-300 font-mono rounded-lg focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
              </div>

              <div className="pt-5 mt-2 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 text-sm font-semibold bg-white text-surface-darker hover:bg-slate-200 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
