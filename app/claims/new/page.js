'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/StepIndicator';
import { saveClaim, generateClaimId } from '@/lib/store';
import { DEMO_SCENARIOS } from '@/lib/demoData';

export default function NewClaimPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    policyNumber: '',
    incidentDate: '',
    clientName: '',
    clientAddress: '',
  });
  const [uploadedImage, setUploadedImage] = useState(null); // { dataUrl, name, mediaType }
  const [demoMode, setDemoMode] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(DEMO_SCENARIOS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFormChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleDemoToggle() {
    const next = !demoMode;
    setDemoMode(next);
    if (next) {
      setForm(selectedDemo.claimData);
      setUploadedImage(null);
    } else {
      setForm({ policyNumber: '', incidentDate: '', clientName: '', clientAddress: '' });
    }
  }

  function handleDemoSelect(scenario) {
    setSelectedDemo(scenario);
    setForm(scenario.claimData);
  }

  function processFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = e => {
      setUploadedImage({ dataUrl: e.target.result, name: file.name, mediaType: file.type });
    };
    reader.readAsDataURL(file);
  }

  function handleFileInput(e) {
    processFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }

  async function handleAnalyze() {
    // Validation
    if (!form.policyNumber || !form.incidentDate || !form.clientName || !form.clientAddress) {
      setError('Please fill in all claim details before proceeding.');
      return;
    }
    if (!demoMode && !uploadedImage) {
      setError('Please upload a vehicle damage photo, or switch to Demo Mode.');
      return;
    }

    setError(null);
    setLoading(true);

    const claimId = generateClaimId();

    try {
      if (demoMode) {
        // Demo mode: use pre-defined annotations, no API call needed
        const claim = {
          id: claimId,
          ...form,
          imageUrl: selectedDemo.imageUrl,
          imageData: null,
          annotations: selectedDemo.annotations,
          status: 'assessed',
          isDemo: true,
          createdAt: new Date().toISOString(),
        };
        saveClaim(claim);
        router.push(`/claims/${claimId}/assessment`);
      } else {
        // Live mode: call Anthropic vision API
        const res = await fetch('/api/assess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: uploadedImage.dataUrl,
            mediaType: uploadedImage.mediaType,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Assessment failed');
        }

        const claim = {
          id: claimId,
          ...form,
          imageUrl: null,
          imageData: uploadedImage.dataUrl,
          annotations: data.annotations,
          status: 'assessed',
          isDemo: false,
          createdAt: new Date().toISOString(),
        };
        saveClaim(claim);
        router.push(`/claims/${claimId}/assessment`);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const canProceed = form.policyNumber && form.incidentDate && form.clientName && form.clientAddress
    && (demoMode || uploadedImage);

  return (
    <div className="min-h-screen bg-slate-100">
      <StepIndicator currentStep={1} />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">New Claim</h1>
          <p className="text-slate-500 mt-1 text-sm">Enter the claim details and upload vehicle damage photos to begin AI assessment.</p>
        </div>

        {/* Demo mode banner */}
        <div className={`mb-6 rounded-xl border p-4 flex items-center justify-between transition-all ${
          demoMode ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <p className="font-semibold text-sm text-slate-800">Demo Mode</p>
            <p className="text-xs text-slate-500">Use pre-loaded sample vehicles with reliable annotations — ideal for demonstrations.</p>
          </div>
          <button
            onClick={handleDemoToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              demoMode ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              demoMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Demo scenario selector */}
        {demoMode && (
          <div className="mb-6 bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 mb-3">Select a demo scenario:</p>
            <div className="grid grid-cols-3 gap-3">
              {DEMO_SCENARIOS.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => handleDemoSelect(scenario)}
                  className={`rounded-lg border p-3 text-left transition-all hover:shadow-md ${
                    selectedDemo.id === scenario.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <img
                    src={scenario.imageUrl}
                    alt={scenario.label}
                    className="w-full h-20 object-cover rounded-md mb-2"
                  />
                  <p className="text-xs font-semibold text-slate-700">{scenario.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Claim details form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Claim Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Policy Number *</label>
              <input
                type="text"
                name="policyNumber"
                value={form.policyNumber}
                onChange={handleFormChange}
                placeholder="e.g. POL-2024-12345"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Incident Date *</label>
              <input
                type="date"
                name="incidentDate"
                value={form.incidentDate}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Client Name *</label>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={handleFormChange}
                placeholder="Full name"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Client Address *</label>
              <input
                type="text"
                name="clientAddress"
                value={form.clientAddress}
                onChange={handleFormChange}
                placeholder="Full address including postcode"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Image upload (only in live mode) */}
        {!demoMode && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Vehicle Damage Photos</h2>

            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage.dataUrl}
                  alt="Uploaded damage"
                  className="w-full max-h-64 object-contain rounded-lg border border-slate-200"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-2 right-2 bg-white border border-slate-300 text-slate-600 rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  ✕
                </button>
                <p className="text-xs text-slate-400 mt-2">{uploadedImage.name}</p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <div className="text-4xl mb-3">📷</div>
                <p className="font-semibold text-slate-700 text-sm">Drop photo here or click to upload</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — max 10MB</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleAnalyze}
          disabled={!canProceed || loading}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
            canProceed && !loading
              ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-lg hover:shadow-xl'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Analyzing damage with AI…
            </span>
          ) : (
            demoMode ? '▶ Launch Demo Assessment' : '🔍 Analyze Damage with AI'
          )}
        </button>

        {!demoMode && (
          <p className="text-center text-xs text-slate-400 mt-3">
            Analysis typically takes 10–20 seconds. The image is sent to our secure AI assessment service.
          </p>
        )}
      </div>
    </div>
  );
}
