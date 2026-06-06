'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AnnotatedImageReadOnly } from '@/components/AnnotatedImage';
import { getClaim, updateClaim } from '@/lib/store';
import { DEMO_REPAIR_SHOPS } from '@/lib/demoData';

export default function AdjusterPage() {
  const router = useRouter();
  const { id: claimId } = useParams();

  const [claim, setClaim] = useState(null);
  const [decision, setDecision] = useState(null); // null | 'approved' | 'rejected'
  const [rejectComment, setRejectComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assignedShop, setAssignedShop] = useState(null);

  useEffect(() => {
    const data = getClaim(claimId);
    if (!data) { router.replace('/claims/new'); return; }
    setClaim(data);
  }, [claimId]);

  async function handleApprove() {
    setSubmitting(true);
    // Simulate repair shop selection based on proximity
    const shop = DEMO_REPAIR_SHOPS[0]; // In production: geolocation query
    setAssignedShop(shop);
    updateClaim(claimId, { status: 'approved', assignedShop: shop, adjusterDecision: 'approved' });
    setDecision('approved');
    setSubmitting(false);
  }

  async function handleReject() {
    if (!rejectComment.trim()) return;
    setSubmitting(true);
    updateClaim(claimId, {
      status: 'rejected',
      adjusterDecision: 'rejected',
      adjusterComments: rejectComment,
    });
    setDecision('rejected');
    setSubmitting(false);
  }

  const imageSrc = claim?.imageUrl || claim?.imageData;
  const lineItems = claim?.lineItems || [];
  const estimate = claim?.estimate || {};
  const editedCount = (claim?.annotations || []).filter(a => a.agentEdited).length;

  if (!claim) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Adjuster-specific header (no step indicator — different persona) */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Senior Adjuster Review</h1>
            <p className="text-xs text-slate-500 mt-0.5">Final approval required before repair authorization</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            decision === 'approved' ? 'bg-green-100 text-green-700' :
            decision === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {decision === 'approved' ? '✓ Approved' : decision === 'rejected' ? '✕ Rejected' : '⏳ Awaiting Decision'}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Claim summary header card */}
        <div className="bg-[#0f2340] text-white rounded-xl p-5 grid grid-cols-4 gap-6">
          <ClaimField label="Claim Reference" value={claimId} mono />
          <ClaimField label="Policyholder" value={claim.clientName} />
          <ClaimField label="Policy Number" value={claim.policyNumber} />
          <ClaimField label="Incident Date" value={new Date(claim.incidentDate).toLocaleDateString('en-GB')} />
        </div>

        {/* AI correction flag */}
        {editedCount > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3">
            <span className="text-amber-500 text-xl">⚠</span>
            <p className="text-sm text-amber-800">
              <strong>{editedCount} annotation{editedCount > 1 ? 's were' : ' was'} manually corrected</strong> by the claims agent during assessment.
              Corrected items are marked in the table below.
            </p>
          </div>
        )}

        {/* Two-column layout: image + estimate */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Annotated image */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Damage Assessment</h2>
            {imageSrc && claim.annotations ? (
              <AnnotatedImageReadOnly imageUrl={imageSrc} annotations={claim.annotations} />
            ) : (
              <div className="text-center py-10 text-slate-400">No image available</div>
            )}
          </div>

          {/* Cost estimate */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Cost Estimate</h2>
            <table className="w-full text-xs mb-4">
              <thead className="bg-slate-50 text-slate-500 uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Part</th>
                  <th className="text-left px-3 py-2">Action</th>
                  <th className="text-right px-3 py-2">Total</th>
                  <th className="text-left px-3 py-2">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-700">{item.part}</td>
                    <td className="px-3 py-2.5">
                      <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${
                        item.recommendation === 'replace' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.recommendation === 'replace' ? 'Replace' : 'Repair'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-800">${item.total.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      {item.source === 'agent'
                        ? <span className="text-amber-600 font-semibold">Agent</span>
                        : <span className="text-slate-400">AI</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span><span>${(estimate.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (8%)</span><span>${(estimate.vat || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2">
                <span>Total</span><span>${(estimate.grandTotal || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decision panel */}
        {!decision ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-5">Adjuster Decision</h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Approve */}
              <div className="border-2 border-green-200 rounded-xl p-5 bg-green-50">
                <h3 className="font-semibold text-green-800 mb-2">✓ Approve Claim</h3>
                <p className="text-sm text-green-700 mb-4">
                  Authorize repairs. The system will automatically assign the nearest approved repair shop based on the client's address.
                </p>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="w-full bg-green-700 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-800 transition-all"
                >
                  {submitting ? 'Processing…' : 'Approve & Assign Repair Shop'}
                </button>
              </div>

              {/* Reject */}
              <div className="border-2 border-red-200 rounded-xl p-5 bg-red-50">
                <h3 className="font-semibold text-red-800 mb-2">✕ Reject Claim</h3>
                <p className="text-sm text-red-700 mb-3">
                  Return to the claims agent with comments for amendments.
                </p>
                <textarea
                  value={rejectComment}
                  onChange={e => setRejectComment(e.target.value)}
                  placeholder="Enter rejection reason and required amendments…"
                  rows={3}
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white mb-3 resize-none"
                />
                <button
                  onClick={handleReject}
                  disabled={submitting || !rejectComment.trim()}
                  className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    rejectComment.trim()
                      ? 'bg-red-700 text-white hover:bg-red-800'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Reject & Return to Agent
                </button>
              </div>
            </div>
          </div>
        ) : decision === 'approved' ? (
          <ApprovedState claimId={claimId} shop={assignedShop} clientName={claim.clientName} grandTotal={estimate.grandTotal} />
        ) : (
          <RejectedState claimId={claimId} comment={rejectComment} onNewClaim={() => router.push('/claims/new')} />
        )}
      </div>
    </div>
  );
}

function ClaimField({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-blue-300 text-xs mb-1">{label}</p>
      <p className={`text-white font-semibold text-sm ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function ApprovedState({ claimId, shop, clientName, grandTotal }) {
  return (
    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        ✓
      </div>
      <h2 className="text-xl font-bold text-green-800 mb-2">Claim Approved</h2>
      <p className="text-green-700 text-sm mb-6">
        Claim <span className="font-mono font-semibold">{claimId}</span> has been authorized for repair. Total: ${(grandTotal || 0).toLocaleString()}
      </p>

      {shop && (
        <div className="bg-white rounded-xl border border-green-200 p-5 max-w-md mx-auto text-left mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Assigned Repair Shop</p>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🔧</div>
            <div>
              <p className="font-semibold text-slate-800">{shop.name}</p>
              <p className="text-sm text-slate-500">{shop.address}</p>
              <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
                <span>📍 {shop.distance}</span>
                <span>⭐ {shop.rating}/5.0</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 border-t border-slate-100 pt-3">
            Selected based on proximity to {clientName}'s registered address.
          </p>
        </div>
      )}

      <p className="text-sm text-green-700">The agent has been notified and will communicate repair shop details to the policyholder.</p>
    </div>
  );
}

function RejectedState({ claimId, comment, onNewClaim }) {
  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-white">
        ✕
      </div>
      <h2 className="text-xl font-bold text-red-800 mb-2">Claim Rejected</h2>
      <p className="text-red-700 text-sm mb-4">
        Claim <span className="font-mono font-semibold">{claimId}</span> has been returned to the claims agent for amendments.
      </p>
      <div className="bg-white border border-red-200 rounded-xl p-4 max-w-lg mx-auto text-left mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Adjuster Comments</p>
        <p className="text-sm text-slate-700">"{comment}"</p>
      </div>
      <button
        onClick={onNewClaim}
        className="bg-slate-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all"
      >
        Start New Claim
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading claim…</p>
      </div>
    </div>
  );
}
