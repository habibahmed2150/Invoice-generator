import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { InvoiceData } from './types';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';

const INITIAL_DATA: InvoiceData = {
  invoiceNumber: '00001',
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  currency: 'PKR',
  taxRate: 0,
  sender: {
    name: 'Habib Ahmed',
    email: 'Habibahmed2150@gmail.com',
    phone: '+923350021022',
    address: ''
  },
  recipient: {
    name: 'Mostafa Yassine',
    email: 'mostafa@cedardigital.io',
    phone: '+971 50 965 1605',
    address: ''
  },
  items: [
    { id: '1', description: 'Salehiya WordPress Maintenance', quantity: 1, price: 100000 },
    { id: '2', description: 'Brandloungeme WordPress Website Fixes', quantity: 1, price: 73318 }
  ],
  notes: '',
  paymentTerms: 'Please send amount as remittance in PKR so I can have full payment; otherwise, charges will be deducted.'
};

const App: React.FC = () => {
  const [data, setData] = useState<InvoiceData>(INITIAL_DATA);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-100 overflow-hidden font-sans">
      {/* Editor Panel - Hidden when printing */}
      <div className="w-full md:w-[420px] lg:w-[480px] flex-shrink-0 h-full no-print z-20">
        <InvoiceEditor 
            data={data} 
            onChange={setData} 
            onPrint={handlePrint}
        />
      </div>

      {/* Preview Panel */}
      <div className="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 md:p-12 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible custom-scrollbar">
         <div className="w-full max-w-[800px] print:max-w-none shadow-2xl print:shadow-none transition-transform">
            <InvoicePreview data={data} />
         </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(<App />);