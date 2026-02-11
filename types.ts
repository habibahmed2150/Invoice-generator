export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface PartyDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  sender: PartyDetails;
  recipient: PartyDetails;
  items: InvoiceItem[];
  notes: string;
  paymentTerms: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PKR' | 'INR' | 'AED';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  PKR: 'Rs',
  INR: '₹',
  AED: 'AED'
};