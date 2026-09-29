import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchOrderById(id: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('hey_womania_session');
  
  if (!sessionToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/orders/${id}`, {
      headers: {
        'Cookie': `hey_womania_session=${sessionToken.value}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const format2 = (n: number) => {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + ' ' + a[n % 10];
  };

  if (num < 100) return format2(num);
  if (num < 1000) return a[Math.floor(num / 100)] + 'Hundred ' + (num % 100 !== 0 ? 'and ' + format2(num % 100) : '');
  if (num < 100000) return format2(Math.floor(num / 1000)) + 'Thousand ' + (num % 1000 !== 0 ? numberToWords(num % 1000) : '');
  if (num < 10000000) return format2(Math.floor(num / 100000)) + 'Lakh ' + (num % 100000 !== 0 ? numberToWords(num % 100000) : '');
  return format2(Math.floor(num / 10000000)) + 'Crore ' + (num % 10000000 !== 0 ? numberToWords(num % 10000000) : '');
}

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InvoicePage(props: PageProps) {
  const params = await props.params;
  const order = await fetchOrderById(params.id);

  if (!order) {
    return notFound();
  }

  // Parse order details
  const orderDate = new Date(order.date || order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  }).replace(/ /g, '-');

  const address = order.address || {};
  const stateCode = '06'; // Assuming Haryana is fixed or mapping needed, user screenshot has Haryana 06

  let totalQuantity = 0;
  let totalBaseAmount = 0;
  let totalCGST = 0;
  let totalSGST = 0;

  // Pre-calculate items
  const parsedItems = order.items?.map((item: any) => {
    const qty = item.qty || item.quantity || 1;
    const priceStr = item.price?.toString().replace(/[^0-9.]/g, '') || '0';
    const unitPrice = parseFloat(priceStr);
    
    // As per rules: <= 2500 is 5%, > 2500 is 18%
    const gstRate = unitPrice > 2500 ? 0.18 : 0.05;
    const baseMultiplier = 1 + gstRate;
    
    const itemTotal = unitPrice * qty;
    const itemBase = itemTotal / baseMultiplier;
    const itemRate = itemBase / qty;
    
    const itemGst = itemTotal - itemBase;
    const cgst = itemGst / 2;
    const sgst = itemGst / 2;

    totalQuantity += qty;
    totalBaseAmount += itemBase;
    totalCGST += cgst;
    totalSGST += sgst;

    return {
      ...item,
      qty,
      unitPrice,
      itemRate,
      itemBase,
      cgst,
      sgst,
      gstRate
    };
  }) || [];

  const totalAmount = parseFloat(order.total?.replace(/[^0-9.]/g, '') || '0');

  return (
    <div className="bg-white text-black font-sans min-h-screen p-8 print:p-0">
      <div className="max-w-4xl mx-auto border-2 border-black print:border-0 print:max-w-none">
        
        {/* Header */}
        <div className="text-center font-bold text-xl py-2 border-b-2 border-black tracking-widest">
          INVOICE
        </div>

        {/* Company & Invoice Details */}
        <div className="grid grid-cols-2 border-b-2 border-black">
          {/* Left Column */}
          <div className="border-r-2 border-black p-2 text-sm leading-tight">
            <div className="font-bold">P S CREATION</div>
            <div>2402, PARAS QUARTIER SEC-2</div>
            <div>GWAL PAHARI, BHANDWARI</div>
            <div>SECTOR -45</div>
            <div>GURGAON</div>
            <div>State Name : Haryana, Code : 06</div>
          </div>
          
          {/* Right Column */}
          <div className="grid grid-cols-2 text-sm">
            <div className="border-r-2 border-b-2 border-black p-2">
              <div>Invoice No.</div>
              <div className="font-bold">{order.orderNumber || order.id}</div>
            </div>
            <div className="border-b-2 border-black p-2">
              <div>Dated</div>
              <div className="font-bold">{orderDate}</div>
            </div>
            
            <div className="border-r-2 border-b-2 border-black p-2">
              <div>Delivery Note</div>
            </div>
            <div className="border-b-2 border-black p-2">
              <div>Mode/Terms of Payment</div>
              <div className="font-bold">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid'}</div>
            </div>

            <div className="border-r-2 border-b-2 border-black p-2">
              <div>Reference No. & Date.</div>
            </div>
            <div className="border-b-2 border-black p-2">
              <div>Other References</div>
            </div>

            <div className="border-r-2 border-b-2 border-black p-2">
              <div>Buyer's Order No.</div>
              <div className="font-bold">{order.orderNumber || order.id}</div>
            </div>
            <div className="border-b-2 border-black p-2">
              <div>Dated</div>
              <div className="font-bold">{orderDate}</div>
            </div>

            <div className="border-r-2 border-b-2 border-black p-2">
              <div>Dispatch Doc No.</div>
            </div>
            <div className="border-b-2 border-black p-2">
              <div>Delivery Note Date</div>
            </div>

            <div className="border-r-2 border-b-2 border-black p-2">
              <div>Dispatched through</div>
              <div className="font-bold">{order.courier || 'Standard'}</div>
            </div>
            <div className="border-b-2 border-black p-2">
              <div>Destination</div>
              <div className="font-bold">{address.city || ''}</div>
            </div>

            <div className="col-span-2 p-2">
              <div>Terms of Delivery</div>
            </div>
          </div>
        </div>

        {/* Consignee and Buyer Details */}
        <div className="grid grid-cols-2 border-b-2 border-black text-sm">
          <div className="p-2 border-r-2 border-black">
            <div className="mb-1">Consignee (Ship to)</div>
            <div className="font-bold mb-1">{address.fullName || address.name || 'Customer'}</div>
            <div>{address.streetAddress || address.street}</div>
            {address.streetAddressLine2 && <div>{address.streetAddressLine2}</div>}
            <div>{address.city} - {address.pincode}</div>
            <div>{address.state}</div>
            <div className="mt-2">State Name : {address.state || 'Haryana'}, Code : {stateCode}</div>
          </div>
          <div className="p-2">
            <div className="mb-1">Buyer (Bill to)</div>
            <div className="font-bold mb-1">{address.fullName || address.name || 'Customer'}</div>
            <div>{address.streetAddress || address.street}</div>
            {address.streetAddressLine2 && <div>{address.streetAddressLine2}</div>}
            <div>{address.city} - {address.pincode}</div>
            <div>{address.state}</div>
            <div className="mt-2">State Name : {address.state || 'Haryana'}, Code : {stateCode}</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="text-sm border-b-2 border-black relative">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="p-2 border-r-2 border-black font-normal w-10 text-center">Sl<br/>No.</th>
                <th className="p-2 border-r-2 border-black font-normal text-center">Description of Goods</th>
                <th className="p-2 border-r-2 border-black font-normal w-24 text-center">HSN/SAC</th>
                <th className="p-2 border-r-2 border-black font-normal w-20 text-center">Quantity</th>
                <th className="p-2 border-r-2 border-black font-normal w-20 text-center">Rate</th>
                <th className="p-2 border-r-2 border-black font-normal w-12 text-center">per</th>
                <th className="p-2 font-normal w-24 text-center">Amount</th>
              </tr>
            </thead>
            <tbody className="min-h-[400px]">
              {parsedItems.map((item: any, i: number) => {
                return (
                  <tr key={i} className="align-top">
                    <td className="p-2 border-r-2 border-black text-center border-b-0 h-full">{i + 1}</td>
                    <td className="p-2 border-r-2 border-black font-bold">
                      {item.name}
                      <div className="text-xs font-normal text-gray-600 mt-1">GST @ {item.gstRate * 100}%</div>
                    </td>
                    <td className="p-2 border-r-2 border-black"></td>
                    <td className="p-2 border-r-2 border-black text-center font-bold">{item.qty} pcs</td>
                    <td className="p-2 border-r-2 border-black text-right">{item.itemRate.toFixed(2)}</td>
                    <td className="p-2 border-r-2 border-black text-center">pcs</td>
                    <td className="p-2 text-right font-bold">{item.itemBase.toFixed(2)}</td>
                  </tr>
                );
              })}
              
              {/* GST Rows */}
              <tr>
                <td className="border-r-2 border-black h-48"></td>
                <td className="p-2 border-r-2 border-black text-right italic pt-8 font-bold align-top">
                  <div>CGST</div>
                  <div>SGST</div>
                </td>
                <td className="border-r-2 border-black"></td>
                <td className="border-r-2 border-black"></td>
                <td className="border-r-2 border-black"></td>
                <td className="border-r-2 border-black"></td>
                <td className="p-2 text-right font-bold pt-8 align-top">
                  <div>{totalCGST.toFixed(2)}</div>
                  <div>{totalSGST.toFixed(2)}</div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-black">
                <td colSpan={3} className="p-2 border-r-2 border-black text-right">Total</td>
                <td className="p-2 border-r-2 border-black text-center font-bold">{totalQuantity} pcs</td>
                <td className="border-r-2 border-black"></td>
                <td className="border-r-2 border-black"></td>
                <td className="p-2 text-right font-bold">₹ {totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Sections */}
        <div className="grid grid-cols-2 text-sm h-48">
          <div className="border-r-2 border-black p-2 flex flex-col justify-between">
            <div>
              <div>Amount Chargeable (in words)</div>
              <div className="font-bold">INR {numberToWords(Math.round(totalAmount))} Only</div>
            </div>
            
            <div className="mt-8">
              <div className="underline mb-1">Declaration</div>
              <div>
                We declare that this invoice shows the actual price of<br/>
                the goods described and that all particulars are true<br/>
                and correct.
              </div>
            </div>
          </div>
          
          <div className="p-2 flex flex-col justify-between">
            <div className="text-right italic">E. & O.E</div>
            
            <div className="mt-2 text-left">
              <div>Company's Bank Details</div>
              <div className="grid grid-cols-[100px_1fr]">
                <div>Bank Name</div>
                <div className="font-bold">: ICICI BANK</div>
                <div>A/c No.</div>
                <div className="font-bold">: 097505003068</div>
                <div>Branch & IFS Code</div>
                <div className="font-bold">: ICIC0000975</div>
              </div>
            </div>

            <div className="text-right border-t-2 border-black mt-2 pt-1 border-l-2 -ml-2 pl-2">
              <div className="font-bold mb-12">for P S CREATION</div>
              <div>Authorised Signatory</div>
            </div>
          </div>
        </div>

      </div>
      <div className="text-center text-sm mt-2">
        This is a Computer Generated Invoice
      </div>
    </div>
  );
}
