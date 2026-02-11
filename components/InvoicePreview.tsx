import React from 'react';
import { InvoiceData, CURRENCY_SYMBOLS, CurrencyCode } from '../types';

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  const symbol = CURRENCY_SYMBOLS[data.currency as CurrencyCode] || data.currency;

  const calculateSubtotal = () => {
    return data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const subtotal = calculateSubtotal();
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  const formatMoney = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    // min-height is set to 29.6cm instead of 29.7cm (A4) to provide a 1mm buffer.
    // This prevents html2pdf from detecting a 2-page document due to pixel rounding errors.
    <div id="invoice-preview" className="bg-white w-full h-full min-h-[29.6cm] p-10 md:p-[20mm] mx-auto text-sm md:text-base text-gray-800 relative flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight uppercase mb-2">Invoice</h1>
          <p className="text-gray-500">#{data.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-gray-500 mb-1">Date</div>
          <div className="font-semibold mb-4">{data.date}</div>
          {data.dueDate && (
            <>
              <div className="text-gray-500 mb-1">Due Date</div>
              <div className="font-semibold text-red-600">{data.dueDate}</div>
            </>
          )}
        </div>
      </div>

      {/* Addresses */}
      <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
        <div className="w-full md:w-1/2">
          <h3 className="text-gray-500 font-medium uppercase tracking-wider text-xs mb-3">From</h3>
          <div className="font-bold text-lg text-gray-900">{data.sender.name || 'Sender Name'}</div>
          {data.sender.email && <div className="text-gray-600">{data.sender.email}</div>}
          {data.sender.phone && <div className="text-gray-600">{data.sender.phone}</div>}
          {data.sender.address && <div className="text-gray-600 whitespace-pre-wrap mt-1">{data.sender.address}</div>}
        </div>
        <div className="w-full md:w-1/2 md:text-right">
          <h3 className="text-gray-500 font-medium uppercase tracking-wider text-xs mb-3">Bill To</h3>
          <div className="font-bold text-lg text-gray-900">{data.recipient.name || 'Recipient Name'}</div>
          {data.recipient.email && <div className="text-gray-600">{data.recipient.email}</div>}
          {data.recipient.phone && <div className="text-gray-600">{data.recipient.phone}</div>}
          {data.recipient.address && <div className="text-gray-600 whitespace-pre-wrap mt-1">{data.recipient.address}</div>}
        </div>
      </div>

      {/* Table */}
      <div className="mb-8 flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-3 font-bold text-gray-900 w-1/2">Description</th>
              <th className="py-3 font-bold text-gray-900 text-center">Quantity</th>
              <th className="py-3 font-bold text-gray-900 text-right">Unit Price</th>
              <th className="py-3 font-bold text-gray-900 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {data.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-4 pr-4">
                  <div className="font-medium text-gray-900">{item.description}</div>
                </td>
                <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 text-right text-gray-600">{symbol}{formatMoney(item.price)}</td>
                <td className="py-4 text-right font-medium text-gray-900">{symbol}{formatMoney(item.quantity * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 && (
          <div className="py-8 text-center text-gray-400 italic">No items added yet.</div>
        )}
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <div className="flex justify-between py-2 text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">{symbol}{formatMoney(subtotal)}</span>
          </div>
          {data.taxRate > 0 && (
            <div className="flex justify-between py-2 text-gray-600 border-b border-gray-200">
              <span>Tax ({data.taxRate}%)</span>
              <span className="font-medium">{symbol}{formatMoney(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-4 text-xl font-bold text-gray-900">
            <span>TOTAL</span>
            <span>{symbol}{formatMoney(total)}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(data.notes || data.paymentTerms) && (
        <div className="border-t border-gray-200 pt-8 pb-4">
           {data.paymentTerms && (
            <div className="mb-4">
              <h4 className="font-bold text-gray-900 text-sm mb-1">Payment Instructions:</h4>
              <p className="text-gray-600 text-sm">{data.paymentTerms}</p>
            </div>
          )}
          {data.notes && (
            <div>
               <h4 className="font-bold text-gray-900 text-sm mb-1">Notes:</h4>
               <p className="text-gray-500 text-sm italic whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};