// components/StepIndicator.jsx
'use client';

const STEPS = [
  { number: 1, label: 'Claim Intake' },
  { number: 2, label: 'AI Assessment' },
  { number: 3, label: 'Cost Estimate' },
  { number: 4, label: 'Adjuster Review' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Connecting line behind steps */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 z-0" />

          {STEPS.map((step, index) => {
            const isComplete = step.number < currentStep;
            const isActive = step.number === currentStep;
            const isPending = step.number > currentStep;

            return (
              <div key={step.number} className="flex flex-col items-center z-10 bg-white px-2">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    isComplete
                      ? 'bg-blue-700 border-blue-700 text-white'
                      : isActive
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>

                {/* Label */}
                <span
                  className={`mt-1.5 text-xs font-medium whitespace-nowrap ${
                    isActive ? 'text-blue-700' : isComplete ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
