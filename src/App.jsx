import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './App.css';
import Footer from './assets/Footer';

export default function App() {
  const invoiceRef = useRef(null);

  // --- States ---
  const [owner, setOwner] = useState({
    name: 'Sonia Travels Solutions & Hospitality',
    address: 'SECOND FLOOR, Flat No.: 17-A/ 38-39, SHOP NO-SF-1, Karol Bagh, New Delhi, 110005',
    email: 'soniatravels1003@gmail.com',
    phone: '000000000',
    gst: '07IIHPP5369E1ZS',
    logo: 'st4.png'
  });

  const [client, setClient] = useState({
    name: '', address: '', phone: '', gst: '', logo: ''
  });

  const [invoice, setInvoice] = useState({
    no: '', date: '', place: 'Delhi (07)', paymentMethod: '', isFullPaid: false, amountPaid: ''
  });

  const [bank, setBank] = useState({
    name: 'South Indian Bank', accNo: '0117073000004902', ifsc: 'SIBL0000117',
    type: 'Current Account', branch: 'NEW DELHI KAROL BAGH', qr: 'qr.png'
  });

  const [items, setItems] = useState([]);
  const [itemInput, setItemInput] = useState({ name: '', price: '', qty: 1, taxRate: 18 });

  // --- Calculations ---
  const subTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const taxTotal = items.reduce((sum, item) => sum + item.taxAmt, 0);
  const grandTotal = subTotal + taxTotal;
  
  // Handle "Full Paid" logic
  const paidAmt = invoice.isFullPaid ? grandTotal : (parseFloat(invoice.amountPaid) || 0);
  const dueAmt = grandTotal - paidAmt;

  // --- Handlers ---
  const handleImageUpload = (e, setter, field) => {
    const file = e.target.files[0];
    if (file) {
      setter(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const addItem = () => {
    const price = parseFloat(itemInput.price) || 0;
    const qty = parseFloat(itemInput.qty) || 0;
    if (itemInput.name && price > 0) {
      const taxAmt = (price * qty) * (itemInput.taxRate / 100);
      const total = (price * qty) + taxAmt;
      setItems([...items, { ...itemInput, price, qty, taxAmt, total }]);
      setItemInput({ name: '', price: '', qty: 1, taxRate: 18 }); // Reset input
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const downloadPDF = async () => {
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 5;
    const width = pdf.internal.pageSize.getWidth() - (margin * 2);
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', margin, margin, width, height);
    pdf.save('Invoice_bill.pdf');
  };

  // Helper: Number to Words
  const priceToWords = (num) => {
    if (num === 0) return 'Zero';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return ''; 
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees ' : '';
    return str.trim();
  };

  return (
    <div>
    <div className="app-container">
      <div className="no-print-zone">
        <h2>Bill Invoice Generator</h2>
        <div className="form-container">
          <div className="form-grid">
            {/* 1. Owner Details */}
            <div className="section">
              <h3>1. Owner Details</h3>
              <input value={owner.name} onChange={e => setOwner({...owner, name: e.target.value})} placeholder="Owner Name" />
              <input value={owner.address} onChange={e => setOwner({...owner, address: e.target.value})} placeholder="Address" />
              <input value={owner.email} onChange={e => setOwner({...owner, email: e.target.value})} placeholder="Email" />
              <input value={owner.phone} onChange={e => setOwner({...owner, phone: e.target.value})} placeholder="Phone" />
              <input value={owner.gst} onChange={e => setOwner({...owner, gst: e.target.value})} placeholder="GST" />
              <label>Update Logo:</label>
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setOwner, 'logo')} />
            </div>

            {/* 2. Client Details */}
            <div className="section">
              <h3>2. Client Details</h3>
              <input value={client.name} onChange={e => setClient({...client, name: e.target.value})} placeholder="Client Business Name" />
              <input value={client.address} onChange={e => setClient({...client, address: e.target.value})} placeholder="Client Address" />
              <input value={client.phone} onChange={e => setClient({...client, phone: e.target.value})} placeholder="Client Phone" />
              <input value={client.gst} onChange={e => setClient({...client, gst: e.target.value})} placeholder="Client GST No" />
              <label>Client Logo:</label>
              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setClient, 'logo')} />
            </div>

            {/* 3. Invoice Details */}
            <div className="section">
              <h3>3. Invoice & Payment</h3>
              <div className="flex-row">
                <input value={invoice.no} onChange={e => setInvoice({...invoice, no: e.target.value})} placeholder="Invoice #" />
                <input type="date" value={invoice.date} onChange={e => setInvoice({...invoice, date: e.target.value})} />
              </div>
              <input value={invoice.place} onChange={e => setInvoice({...invoice, place: e.target.value})} placeholder="Place of Supply" />
              <div className="payment-box">
                <label>
                  <input type="checkbox" checked={invoice.isFullPaid} onChange={e => setInvoice({...invoice, isFullPaid: e.target.checked})} /> Full Paid
                </label>
                <input type="number" value={invoice.isFullPaid ? grandTotal.toFixed(2) : invoice.amountPaid} onChange={e => setInvoice({...invoice, amountPaid: e.target.value})} placeholder="Amount Paid" disabled={invoice.isFullPaid} />
                <input value={invoice.paymentMethod} onChange={e => setInvoice({...invoice, paymentMethod: e.target.value})} placeholder="Paid Into (e.g. HDFC, Cash, UPI)" />
              </div>
            </div>

            {/* 4. Add Items */}
            <div className="section">
              <h3>4. Add Items</h3>
              <input value={itemInput.name} onChange={e => setItemInput({...itemInput, name: e.target.value})} placeholder="Service Description" />
              <div className="flex-row">
                <input type="number" value={itemInput.price} onChange={e => setItemInput({...itemInput, price: e.target.value})} placeholder="Price" />
                <input type="number" value={itemInput.qty} onChange={e => setItemInput({...itemInput, qty: e.target.value})} placeholder="Qty" />
              </div>
              <select value={itemInput.taxRate} onChange={e => setItemInput({...itemInput, taxRate: Number(e.target.value)})}>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST</option>
                <option value="28">28% GST</option>
              </select>
              <button onClick={addItem} className="btn-add">Add Item</button>
            </div>
          </div>

          {/* 5. Bank Details */}
          <div className="section full-width mt-15">
            <h3>5. Bank Details (Pre-filled)</h3>
            <div className="flex-row">
              <input value={bank.name} onChange={e => setBank({...bank, name: e.target.value})} placeholder="Bank Name" />
              <input value={bank.accNo} onChange={e => setBank({...bank, accNo: e.target.value})} placeholder="Account No" />
              <input value={bank.ifsc} onChange={e => setBank({...bank, ifsc: e.target.value})} placeholder="IFSC" />
            </div>
            <div className="flex-row mt-5">
              <input value={bank.type} onChange={e => setBank({...bank, type: e.target.value})} placeholder="Account Type" />
              <input value={bank.branch} onChange={e => setBank({...bank, branch: e.target.value})} placeholder="Branch Name" />
            </div>
            <label className="mt-5 block">Upload Payment QR:</label>
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setBank, 'qr')} />
          </div>

          <div className="main-actions mt-15">
            <button onClick={downloadPDF} className="btn-secondary">Download PDF</button>
          </div>
        </div>
      </div>

      <hr />

      {/* Responsive Wrapper for the Invoice Preview */}
      <div className="invoice-wrapper">
        <div id="invoice" ref={invoiceRef}>
          <div className="header-main">
            <div className="biz-header">
              {owner.logo && <img className="logo-large" src={owner.logo} alt="Owner Logo" />}
              <div className="owner-info">
                <h2>{owner.name}</h2>
                <p className="small-text">{owner.address}</p>
                <p className="small-text">Email: <span>{owner.email}</span></p>
                <p className="small-text">Ph: <span>{owner.phone}</span> | GSTIN: <span>{owner.gst}</span></p>
              </div>
            </div>
            <div className="invoice-title-large">
              <h1>TAX INVOICE</h1>
            </div>
          </div>

          <div className="info-row-box">
            <p><strong>Inv No:</strong> <span>{invoice.no || '---'}</span></p>
            <p><strong>Date:</strong> <span>{invoice.date || '---'}</span></p>
            <p><strong>Place of Supply:</strong> <span>{invoice.place || '---'}</span></p>
          </div>

          <div className="biz-header client-section">
            {client.logo && <img className="logo-large" src={client.logo} alt="Client Logo" />}
            <div className="client-info">
              <p className="label">Bill To:</p>
              <h3>{client.name || 'Client Name'}</h3>
              <p className="small-text">{client.address}</p>
              {client.phone && <p className="small-text">Ph: {client.phone}</p>}
              {client.gst && <p className="small-text">GSTIN: {client.gst}</p>}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Service Description</th>
                <th>Price</th>
                <th>Qty</th>
                <th>GST %</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} onClick={() => removeItem(i)} title="Click to remove">
                  <td>{i + 1}</td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.price.toFixed(2)}</td>
                  <td>{item.qty}</td>
                  <td>{item.taxRate}%</td>
                  <td>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="footer-grid">
            <div className="bank-details">
              <p className="label">BANK DETAILS:</p>
              <p><strong>A/C Name:</strong> {owner.name.toUpperCase()}</p>
              <p><strong>Bank:</strong> <span>{bank.name}</span></p>
              <p><strong>A/C No:</strong> <span>{bank.accNo}</span></p>
              <p><strong>IFSC:</strong> <span>{bank.ifsc}</span></p>
              <p><strong>Type:</strong> <span>{bank.type}</span></p>
              <p><strong>Branch:</strong> <span>{bank.branch}</span></p>
              {bank.qr && <img className="qr-code-large" src={bank.qr} alt="QR Code" />}
            </div>
            
            <div className="summary-wrapper">
              {grandTotal > 0 && (
                <div className={`stamp ${dueAmt <= 0 ? 'stamp-paid' : 'stamp-due'}`}>
                  {dueAmt <= 0 ? 'PAID' : 'DUE'}
                </div>
              )}
              <div className="summary">
                <p>Subtotal: ₹<span>{subTotal.toFixed(2)}</span></p>
                <p>GST Total: ₹<span>{taxTotal.toFixed(2)}</span></p>
                <p className="amt-words"><strong>Amount in Words:</strong> <br/><span>{priceToWords(Math.round(grandTotal))} Only</span></p>
                <div className="grand-total-box">
                  <h3>Grand Total: ₹<span>{grandTotal.toFixed(2)}</span></h3>
                  <p>Amount Paid: ₹<span>{paidAmt.toFixed(2)}</span></p>
                  <h3 className="due-line">Balance Due: ₹<span>{dueAmt.toFixed(2)}</span></h3>
                </div>
              </div>
            </div>
          </div>
          
          <p className="disclaimer">**This is a computer generated invoice and does not require physical copy.</p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}