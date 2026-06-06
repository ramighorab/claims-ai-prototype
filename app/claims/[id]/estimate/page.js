'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import StepIndicator from '@/components/StepIndicator';
import { getClaim, updateClaim } from '@/lib/store';
import { getCostForPart, getLaborCost } from '@/lib/repairDatabase';

export default function EstimatePage() {
  const router = useRouter();
  const { id: claimId } = useParams();

  const [claim, setClaim] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const data = getClaim(claimId);
    if (!data) { router.replace('/claims/new'); return; }
    setClaim(data);

    // Generate line items from annotations × repair database
    const items = (data.annotations || []).map(ann => {
      const partsCost = getCostForPart(ann.part, ann.recommendation);
      const laborCost = getLaborCost(ann.recommendation, ann.severity);
      return {
        id: ann.id,
        part: ann.part,
        damageType: ann.damageType,
        severity: ann.severity,
        recommendation: ann.recommendation,
        partsCost,
        laborCost,
        total: partsCost + laborCost,
        agentEdited: ann.agentEdited,
        source: ann.agentEdited ? 'agent' : 'ai',
      };
    });
    setLineItems(items);
  }, [claimId]);

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const vatRate = 0.08;
  const vat = Math.round(subtotal * vatRate);
  const grandTotal = subtotal + vat;

  const severeCount = lineItems.filter(i => i.severity === 'severe').length;
  const replaceCount = lineItems.filter(i => i.recommendation === 'replace').length;

  async function handleSubmit() {
    setSubmitting(true);
    updateClaim(claimId, {
      lineItems,
      estimate: { subtotal, vat, grandTotal },
      status: 'pending_adjuster',
    });
    router.push(`/claims/${claimId}/adjuster`);
  }

  if (!claim) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-100">
      <StepIndicator currentStep={3} />

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Repair / Replacement Cost Estimate</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Claim <span className="font-mono text-slate-700">{claimId}</span> · {claim.clientName} · {claim.policyNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Estimate Date</p>
            <p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Damaged Parts" value={lineItems.length} />
          <SummaryCard label="Severe Damages" value={severeCount} highlight={severeCount > 0} color="red" />
          <SummaryCard label="Parts to Replace" value={replaceCount} />
          <SummaryCard label="Estimated Total" value={`$${grandTotal.toLocaleString()}`} highlight color="blue" />
        </div>

        {/* Cost note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
          <strong>Note:</strong> Costs are derived from the company's standardised repair cost database. 
          Line items marked <span className="font-semibold text-amber-600">Agent Edited</span> reflect manual corrections applied during assessment.
          Final pricing is subject to negotiation with the approved repair shop.
        </div>

        {/* Line items table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-[#0f2340] text-white text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3">#</th>
                <th className="text-left px-5 py-3">Part</th>
                <th className="text-left px-5 py-3">Damage</th>
                <th className="text-left px-5 py-3">Severity</th>
                <th className="text-left px-5 py-3">Action</th>
                <th className="text-right px-5 py-3">Parts ($)</th>
                <th className="text-right px-5 py-3">Labor ($)</th>
                <th className="text-right px-5 py-3">Total ($)</th>
                <th className="text-left px-5 py-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineItems.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{item.id}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{item.part}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{item.damageType}</td>
                  <td className="px-5 py-3">
                    <SeverityChip severity={item.severity} />
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.recommendation === 'replace' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.recommendation === 'replace' ? 'Replace' : 'Repair'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">{item.partsCost.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{item.laborCost.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-800">{item.total.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    {item.source === 'agent' ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">Agent Edited</span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">AI</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (parts + labour)</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (8%)</span>
                  <span className="font-medium">${vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-base border-t border-slate-300 pt-2 mt-2">
                  <span>Total Estimate</span>
                  <span>${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-slate-500 text-sm hover:text-slate-700 flex items-center gap-1"
          >
            ← Back to assessment
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 shadow-lg transition-all flex items-center gap-2"
          >
            {submitting ? 'Submitting…' : 'Submit for Adjuster Review →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight = false, color = 'slate' }) {
  const colors = {
    blue: 'bg-blue-700 text-white',
    red: 'bg-red-50 border border-red-200',
    slate: 'bg-white border border-slate-200',
  };
  return (
    <div className={`rounded-xl p-4 shadow-sm ${colors[color]}`}>
      <p className={`text-xs font-medium mb-1 ${highlight && color === 'blue' ? 'text-blue-200' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-2xl font-bold ${highlight && color === 'blue' ? 'text-white' : color === 'red' ? 'text-red-700' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

function SeverityChip({ severity }) {
  const map = { minor: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', severe: 'bg-red-100 text-red-700' };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${map[severity] || map.medium}`}>
      {severity}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Generating estimate…</p>
      </div>
    </div>
  );
}
