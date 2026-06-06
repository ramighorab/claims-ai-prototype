'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import StepIndicator from '@/components/StepIndicator';
import AnnotatedImage from '@/components/AnnotatedImage';
import { getClaim, updateClaim } from '@/lib/store';

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const claimId = params.id;

  const [claim, setClaim] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const data = getClaim(claimId);
    if (!data) {
      router.replace('/claims/new');
      return;
    }
    setClaim(data);
    setAnnotations(data.annotations || []);
    setLoading(false);
  }, [claimId]);

  function handleAnnotationsChange(updated) {
    setAnnotations(updated);
  }

  async function handleConfirm() {
    setConfirming(true);
    updateClaim(claimId, { annotations, status: 'confirmed' });
    router.push(`/claims/${claimId}/estimate`);
  }

  const editedCount = annotations.filter(a => a.agentEdited).length;
  const imageSrc = claim?.imageUrl || claim?.imageData;

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-100">
      <StepIndicator currentStep={2} />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">AI Damage Assessment</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Claim <span className="font-mono text-slate-700">{claimId}</span> · {claim?.clientName} · {claim?.policyNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {claim?.isDemo && (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                Demo Mode
              </span>
            )}
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Pending Review
            </span>
          </div>
        </div>

        {/* AI banner */}
        <div className="bg-[#0f2340] text-white rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🤖</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">AI has identified {annotations.length} damaged area{annotations.length !== 1 ? 's' : ''}.</p>
            <p className="text-blue-200 text-xs mt-0.5">
              Review and correct any annotations before confirming. All edits are logged for audit purposes.
            </p>
          </div>
          {editedCount > 0 && (
            <div className="bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
              {editedCount} correction{editedCount > 1 ? 's' : ''} made
            </div>
          )}
        </div>

        {/* Main content: annotated image + side panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          {imageSrc && annotations.length > 0 ? (
            <AnnotatedImage
              imageUrl={imageSrc}
              annotations={annotations}
              onAnnotationsChange={handleAnnotationsChange}
            />
          ) : (
            <div className="text-center py-16 text-slate-400">
              No damage annotations available.
            </div>
          )}
        </div>

        {/* Damage summary table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Assessment Summary</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                <th className="text-left px-4 py-2.5 rounded-l">#</th>
                <th className="text-left px-4 py-2.5">Part</th>
                <th className="text-left px-4 py-2.5">Damage Type</th>
                <th className="text-left px-4 py-2.5">Severity</th>
                <th className="text-left px-4 py-2.5">Action</th>
                <th className="text-left px-4 py-2.5 rounded-r">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {annotations.map(ann => (
                <tr key={ann.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 font-mono">{ann.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {ann.part}
                    {ann.agentEdited && <span className="ml-2 text-xs text-amber-600 font-semibold">(edited)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ann.damageType}</td>
                  <td className="px-4 py-3">
                    <SeverityChip severity={ann.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      ann.recommendation === 'replace' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ann.recommendation === 'replace' ? 'Replace' : 'Repair'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{ann.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/claims/new')}
            className="text-slate-500 text-sm hover:text-slate-700 flex items-center gap-1"
          >
            ← Start new claim
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 shadow-lg transition-all"
          >
            {confirming ? 'Saving...' : 'Confirm Assessment & Generate Estimate →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SeverityChip({ severity }) {
  const map = {
    minor:  'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    severe: 'bg-red-100 text-red-700',
  };
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
        <p className="text-slate-500 text-sm">Loading assessment…</p>
      </div>
    </div>
  );
}
