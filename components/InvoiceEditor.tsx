import React, { useState } from 'react';
import { InvoiceData, CURRENCY_SYMBOLS, InvoiceItem } from '../types';
import { Plus, Trash2, Wand2, Loader2, Download, Receipt, Printer } from 'lucide-react';
import { parseInvoiceFromText } from '../services/geminiService';

interface InvoiceEditorProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onPrint: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ data, onChange, onPrint }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // High contrast, professional input styles
  const inputClass = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-0.5";
  const sectionHeaderClass = "text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-1 flex items-center gap-2";

  const updateField = (section: keyof InvoiceData, field: string, value: any) => {
    if (typeof data[section] === 'object' && !Array.isArray(data[section])) {
      onChange({
        ...data,
        [section]: {
          ...(data[section] as object),
          [field]: value
        }
      });
    } else {
      onChange({ ...data, [section]: value });
    }
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'New Item',
      quantity: 1,
      price: 0
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    onChange({
      ...data,
      items: data.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setError(null);
    try {
      const extracted = await parseInvoiceFromText(aiPrompt);
      
      const newData = { ...data };
      if (extracted.invoiceNumber) newData.invoiceNumber = extracted.invoiceNumber;
      if (extracted.date) newData.date = extracted.date;
      if (extracted.dueDate) newData.dueDate = extracted.dueDate;
      if (extracted.sender) newData.sender = { ...newData.sender, ...extracted.sender };
      if (extracted.recipient) newData.recipient = { ...newData.recipient, ...extracted.recipient };
      if (extracted.items && extracted.items.length > 0) {
        const newItems = extracted.items.map(i => ({
            ...i,
            id: Math.random().toString(36).substr(2, 9),
            description: i.description || 'Item',
            quantity: i.quantity || 1,
            price: i.price || 0
        }));
        newData.items = [...newData.items, ...newItems];
      }
      if (extracted.notes) newData.notes = extracted.notes;

      onChange(newData);
      setAiPrompt('');
      setShowAiInput(false);
    } catch (err) {
      setError("Failed to generate invoice data. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    const element = document.getElementById('invoice-preview');
    // @ts-ignore
    if (window.html2pdf && element) {
        const opt = {
          margin: 0,
          filename: `Invoice_${data.invoiceNumber || 'draft'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save().then(() => {
            setIsDownloading(false);
        }).catch((err: any) => {
            console.error(err);
            setIsDownloading(false);
        });
    } else {
        // Fallback to print
        onPrint();
        setIsDownloading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-30 no-print font-sans">
      {/* Header */}
      <div className="flex-none bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">
         <div>
            <h2 className="font-bold text-gray-900 text-xl tracking-tight flex items-center gap-2">
               <Receipt className="text-indigo-600" size={24} />
               Editor
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Configure your invoice details</p>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={() => setShowAiInput(!showAiInput)}
                className={`flex items-center justify-center p-2.5 rounded-lg transition-all border ${showAiInput ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                title="AI Magic Fill"
            >
                <Wand2 size={18} />
            </button>
             <button 
                onClick={onPrint}
                className="flex items-center justify-center p-2.5 rounded-lg transition-all border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                title="Print"
            >
                <Printer size={18} />
            </button>
            <button 
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-850 hover:bg-slate-700 rounded-lg transition-all shadow-lg shadow-slate-850/10 disabled:opacity-70"
            >
                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                <span>Download</span>
            </button>
         </div>
      </div>

      {/* AI Input Panel */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden bg-indigo-50/60 border-b border-indigo-100 ${showAiInput ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6">
            <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Wand2 size={14} className="text-indigo-600" />
                AI Magic Assistant
            </label>
            <p className="text-xs text-indigo-700/80 mb-3">
              Describe your invoice in plain English (e.g., "Bill Acme Corp $500 for Design").
            </p>
            <textarea 
                className="w-full p-4 text-sm bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none mb-3 shadow-sm text-gray-800 placeholder-indigo-300"
                rows={3}
                placeholder="What should this invoice say?"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
            />
            {error && <p className="text-red-600 text-xs mb-3 font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}
            <button 
                onClick={handleAiGenerate}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-semibold shadow-md transition-all"
            >
                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                Auto-Fill Invoice
            </button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8 pb-24">
          
          {/* Section: General Info */}
          <section>
              <h3 className={sectionHeaderClass}>Invoice Details</h3>
              <div className="grid grid-cols-2 gap-5">
                  <div>
                      <label className={labelClass}>Invoice #</label>
                      <input 
                          type="text" 
                          value={data.invoiceNumber}
                          onChange={(e) => updateField('invoiceNumber', '', e.target.value)}
                          className={inputClass}
                      />
                  </div>
                  <div>
                      <label className={labelClass}>Currency</label>
                      <select 
                          value={data.currency}
                          onChange={(e) => updateField('currency', '', e.target.value)}
                          className={inputClass}
                      >
                          {Object.keys(CURRENCY_SYMBOLS).map(c => (
                              <option key={c} value={c}>{c}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className={labelClass}>Date Issued</label>
                      <input 
                          type="date" 
                          value={data.date}
                          onChange={(e) => updateField('date', '', e.target.value)}
                          className={inputClass}
                      />
                  </div>
                   <div>
                      <label className={labelClass}>Due Date</label>
                      <input 
                          type="date" 
                          value={data.dueDate}
                          onChange={(e) => updateField('dueDate', '', e.target.value)}
                          className={inputClass}
                      />
                  </div>
              </div>
          </section>

          {/* Section: From / To */}
          <div className="space-y-8">
              <section>
                  <h3 className={sectionHeaderClass}>From (Sender)</h3>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <label className={labelClass}>Business Name</label>
                           <input 
                              placeholder="Your Business Name" 
                              value={data.sender.name}
                              onChange={(e) => updateField('sender', 'name', e.target.value)}
                              className={inputClass}
                           />
                        </div>
                        <div>
                           <label className={labelClass}>Email</label>
                           <input 
                              placeholder="name@example.com" 
                              value={data.sender.email}
                              onChange={(e) => updateField('sender', 'email', e.target.value)}
                              className={inputClass}
                           />
                        </div>
                         <div>
                           <label className={labelClass}>Phone</label>
                           <input 
                              placeholder="+1 234 567 890" 
                              value={data.sender.phone}
                              onChange={(e) => updateField('sender', 'phone', e.target.value)}
                              className={inputClass}
                           />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Address</label>
                        <textarea 
                            placeholder="Full Address" 
                            value={data.sender.address}
                            rows={3}
                            onChange={(e) => updateField('sender', 'address', e.target.value)}
                            className={inputClass}
                        />
                      </div>
                  </div>
              </section>

              <section>
                  <h3 className={sectionHeaderClass}>Bill To (Client)</h3>
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <label className={labelClass}>Client Name</label>
                           <input 
                              placeholder="Client Business Name" 
                              value={data.recipient.name}
                              onChange={(e) => updateField('recipient', 'name', e.target.value)}
                              className={inputClass}
                           />
                        </div>
                        <div>
                           <label className={labelClass}>Email</label>
                           <input 
                              placeholder="client@example.com" 
                              value={data.recipient.email}
                              onChange={(e) => updateField('recipient', 'email', e.target.value)}
                              className={inputClass}
                           />
                        </div>
                         <div>
                           <label className={labelClass}>Phone</label>
                           <input 
                              placeholder="+1 234 567 890" 
                              value={data.recipient.phone}
                              onChange={(e) => updateField('recipient', 'phone', e.target.value)}
                              className={inputClass}
                           />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Address</label>
                        <textarea 
                            placeholder="Full Address" 
                            value={data.recipient.address}
                            rows={3}
                            onChange={(e) => updateField('recipient', 'address', e.target.value)}
                            className={inputClass}
                        />
                      </div>
                  </div>
              </section>
          </div>

          {/* Section: Items */}
          <section>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                  <h3 className="text-sm font-bold text-gray-900">LINE ITEMS</h3>
                  <button onClick={handleAddItem} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors">
                      <Plus size={14} /> ADD ITEM
                  </button>
              </div>
              
              <div className="space-y-3">
                  {data.items.map((item) => (
                      <div key={item.id} className="relative flex gap-3 items-start bg-gray-50/50 p-4 rounded-xl border border-gray-200 group hover:border-gray-300 transition-colors">
                          <div className="flex-1 space-y-3">
                               <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Description</label>
                                  <input 
                                    placeholder="Item or Service description" 
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    className={inputClass}
                                  />
                               </div>
                              <div className="flex gap-4">
                                  <div className="w-24">
                                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Qty</label>
                                       <input 
                                          type="number" 
                                          value={item.quantity}
                                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                          className={inputClass}
                                      />
                                  </div>
                                  <div className="flex-1">
                                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Price</label>
                                       <input 
                                          type="number" 
                                          value={item.price}
                                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                          className={inputClass}
                                      />
                                  </div>
                              </div>
                          </div>
                          <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove Item"
                          >
                              <Trash2 size={14} />
                          </button>
                      </div>
                  ))}
              </div>
          </section>

          {/* Section: Totals & Notes */}
          <section className="space-y-6 border-t border-gray-100 pt-6">
               <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="text-sm font-bold text-gray-700">Tax Rate (%)</label>
                  <input 
                      type="number" 
                      value={data.taxRate}
                      onChange={(e) => updateField('taxRate', '', parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
              </div>
              
              <div>
                  <label className={labelClass}>Payment Instructions</label>
                  <textarea 
                      value={data.paymentTerms}
                      onChange={(e) => updateField('paymentTerms', '', e.target.value)}
                      rows={2}
                      className={inputClass}
                      placeholder="Bank details, wire transfer info..."
                  />
              </div>

              <div>
                  <label className={labelClass}>Additional Notes</label>
                  <textarea 
                      value={data.notes}
                      onChange={(e) => updateField('notes', '', e.target.value)}
                      rows={2}
                      className={inputClass}
                      placeholder="Thank you for your business..."
                  />
              </div>
          </section>
        </div>
      </div>
    </div>
  );
};