// components/AnnotatedImage.jsx
'use client';
import { useState, useRef } from 'react';

const SEVERITY_CONFIG = {
  minor:  { color: '#16a34a', bg: '#dcfce7', label: 'Minor',  textColor: '#15803d' },
  medium: { color: '#d97706', bg: '#fef3c7', label: 'Medium', textColor: '#b45309' },
  severe: { color: '#dc2626', bg: '#fee2e2', label: 'Severe', textColor: '#b91c1c' },
};

function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.textColor }}
    >
      {cfg.label}
    </span>
  );
}

function RecommendationBadge({ rec }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
      rec === 'replace'
        ? 'bg-red-100 text-red-700'
        : 'bg-blue-100 text-blue-700'
    }`}>
      {rec === 'replace' ? 'Replace' : 'Repair'}
    </span>
  );
}

// Read-only version (for adjuster review)
export function AnnotatedImageReadOnly({ imageUrl, annotations }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <ImageCanvas
        imageUrl={imageUrl}
        annotations={annotations}
        hoveredId={hoveredId}
        onHover={setHoveredId}
      />
      <div className="lg:w-72 space-y-2 custom-scroll overflow-y-auto max-h-[480px]">
        {annotations.map(ann => {
          const cfg = SEVERITY_CONFIG[ann.severity] || SEVERITY_CONFIG.medium;
          return (
            <div
              key={ann.id}
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                hoveredId === ann.id ? 'border-blue-400 shadow-md' : 'border-slate-200'
              }`}
              style={hoveredId === ann.id ? { borderColor: cfg.color } : {}}
              onMouseEnter={() => setHoveredId(ann.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: cfg.color }}>
                  {ann.id}
                </div>
                <span className="font-medium text-sm text-slate-800">{ann.part}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1.5">{ann.damageType}</p>
              <div className="flex gap-1.5 flex-wrap">
                <SeverityBadge severity={ann.severity} />
                <RecommendationBadge rec={ann.recommendation} />
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">
                  {ann.confidence}% confidence
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Editable version (for agent assessment)
export default function AnnotatedImage({ imageUrl, annotations, onAnnotationsChange }) {
  const [hoveredId, setHoveredId] = useState(null);

  function updateAnnotation(id, field, value) {
    const updated = annotations.map(ann =>
      ann.id === id ? { ...ann, [field]: value, agentEdited: true } : ann
    );
    onAnnotationsChange(updated);
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Image panel */}
      <div className="flex-1 min-w-0">
        <ImageCanvas
          imageUrl={imageUrl}
          annotations={annotations}
          hoveredId={hoveredId}
          onHover={setHoveredId}
        />
        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="font-medium">Severity:</span>
          {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: cfg.color }} />
              {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Side panel — editable annotations */}
      <div className="xl:w-80 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700 text-sm">
            Damage Annotations ({annotations.length})
          </h3>
          <span className="text-xs text-slate-400">Hover an item to highlight</span>
        </div>

        <div className="space-y-3 custom-scroll overflow-y-auto max-h-[520px] pr-1">
          {annotations.map(ann => {
            const cfg = SEVERITY_CONFIG[ann.severity] || SEVERITY_CONFIG.medium;
            const isHovered = hoveredId === ann.id;

            return (
              <div
                key={ann.id}
                className={`rounded-xl border bg-white p-4 transition-all duration-150 cursor-default ${
                  isHovered ? 'shadow-lg' : 'shadow-sm'
                }`}
                style={{ borderColor: isHovered ? cfg.color : '#e2e8f0' }}
                onMouseEnter={() => setHoveredId(ann.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Header row */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  >
                    {ann.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={ann.part}
                      onChange={e => updateAnnotation(ann.id, 'part', e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 bg-transparent border-0 border-b border-transparent focus:border-blue-400 focus:outline-none pb-0.5"
                    />
                  </div>
                  {ann.agentEdited && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                      Edited
                    </span>
                  )}
                </div>

                {/* Damage type */}
                <div className="mb-2">
                  <label className="text-xs text-slate-400 font-medium block mb-0.5">Damage Type</label>
                  <input
                    type="text"
                    value={ann.damageType}
                    onChange={e => updateAnnotation(ann.id, 'damageType', e.target.value)}
                    className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Severity + Recommendation selects */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-0.5">Severity</label>
                    <select
                      value={ann.severity}
                      onChange={e => updateAnnotation(ann.id, 'severity', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400 bg-white"
                    >
                      <option value="minor">Minor</option>
                      <option value="medium">Medium</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-0.5">Recommendation</label>
                    <select
                      value={ann.recommendation}
                      onChange={e => updateAnnotation(ann.id, 'recommendation', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400 bg-white"
                    >
                      <option value="repair">Repair</option>
                      <option value="replace">Replace</option>
                    </select>
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">AI Confidence</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ann.confidence}%`,
                          backgroundColor: ann.confidence >= 85 ? '#16a34a' : ann.confidence >= 60 ? '#d97706' : '#dc2626',
                        }}
                      />
                    </div>
                    <span className="font-medium text-slate-600">{ann.confidence}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Shared image canvas with bounding box overlay
function ImageCanvas({ imageUrl, annotations, hoveredId, onHover }) {
  const [ready, setReady] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);

  function handleLoad(e) {
    const { naturalWidth, naturalHeight } = e.target;
    setAspectRatio(naturalHeight / naturalWidth);
    setReady(true);
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-200 shadow-sm"
      style={aspectRatio ? { paddingBottom: `${aspectRatio * 100}%` } : { paddingBottom: '60%' }}>

      <img
        src={imageUrl}
        alt="Vehicle damage"
        onLoad={handleLoad}
        className="absolute inset-0 w-full h-full object-fill rounded-xl"
      />

      {/* Overlay bounding boxes */}
      {ready && annotations.map(ann => {
        const cfg = SEVERITY_CONFIG[ann.severity] || SEVERITY_CONFIG.medium;
        const isHovered = hoveredId === ann.id;

        return (
          <div
            key={ann.id}
            className="absolute cursor-pointer transition-all duration-150"
            style={{
              left: `${ann.boundingBox.x * 100}%`,
              top: `${ann.boundingBox.y * 100}%`,
              width: `${ann.boundingBox.width * 100}%`,
              height: `${ann.boundingBox.height * 100}%`,
              border: `2px solid ${cfg.color}`,
              backgroundColor: isHovered ? `${cfg.color}30` : `${cfg.color}10`,
              boxShadow: isHovered ? `0 0 0 2px ${cfg.color}60, inset 0 0 0 1px ${cfg.color}40` : 'none',
            }}
            onMouseEnter={() => onHover(ann.id)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Number badge */}
            <div
              className="absolute -top-5 -left-1 min-w-[20px] h-5 px-1 rounded flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: cfg.color }}
            >
              {ann.id}
            </div>
          </div>
        );
      })}
    </div>
  );
}
