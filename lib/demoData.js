// lib/demoData.js
// Pre-defined demo scenarios for reliable live demonstrations.
// Each scenario includes a verified car damage image and realistic AI annotation output.
// All images are from Unsplash (free to use under the Unsplash License).

export const DEMO_SCENARIOS = [
  {
    id: 'demo-1',
    label: 'Front-End Collision',
    description: 'Sedan with significant front-end impact damage',
    // "A car with a crashed front end" by Erik Mclean on Unsplash
    imageUrl: 'https://images.unsplash.com/photo-1673187139211-1e7ec3dd60ec?w=900&q=80&auto=format&fit=crop',
    claimData: {
      policyNumber: 'POL-2024-88341',
      incidentDate: '2024-06-01',
      clientName: 'Sarah Mitchell',
      clientAddress: '42 Riverside Drive, Austin, TX 78701',
    },
    annotations: [
      {
        id: 1,
        boundingBox: { x: 0.05, y: 0.30, width: 0.50, height: 0.38 },
        part: 'Front bumper',
        damageType: 'Impact crush and deformation',
        severity: 'severe',
        recommendation: 'replace',
        confidence: 94,
        agentEdited: false,
      },
      {
        id: 2,
        boundingBox: { x: 0.08, y: 0.10, width: 0.45, height: 0.25 },
        part: 'Hood',
        damageType: 'Crumple zone deformation',
        severity: 'severe',
        recommendation: 'replace',
        confidence: 91,
        agentEdited: false,
      },
      {
        id: 3,
        boundingBox: { x: 0.05, y: 0.25, width: 0.18, height: 0.20 },
        part: 'Left headlight',
        damageType: 'Shattered housing',
        severity: 'severe',
        recommendation: 'replace',
        confidence: 97,
        agentEdited: false,
      },
      {
        id: 4,
        boundingBox: { x: 0.05, y: 0.05, width: 0.28, height: 0.15 },
        part: 'Left fender',
        damageType: 'Dent and crease',
        severity: 'medium',
        recommendation: 'repair',
        confidence: 83,
        agentEdited: false,
      },
    ],
  },
  {
    id: 'demo-2',
    label: 'Side Impact Incident',
    description: 'Car with side impact and door damage from a road traffic collision',
    // "A car after being involved in a road traffic collision" by Usman Malik on Unsplash
    imageUrl: 'https://images.unsplash.com/photo-1673187139612-6bf684a74815?w=900&q=80&auto=format&fit=crop',
    claimData: {
      policyNumber: 'POL-2024-77120',
      incidentDate: '2024-06-03',
      clientName: 'James Thornton',
      clientAddress: '17 Oak Lane, Nashville, TN 37201',
    },
    annotations: [
      {
        id: 1,
        boundingBox: { x: 0.18, y: 0.28, width: 0.38, height: 0.32 },
        part: 'Left front door',
        damageType: 'Deep scrape and dent from side impact',
        severity: 'medium',
        recommendation: 'repair',
        confidence: 88,
        agentEdited: false,
      },
      {
        id: 2,
        boundingBox: { x: 0.54, y: 0.26, width: 0.28, height: 0.30 },
        part: 'Left rear door',
        damageType: 'Surface scratch and minor dent',
        severity: 'minor',
        recommendation: 'repair',
        confidence: 92,
        agentEdited: false,
      },
      {
        id: 3,
        boundingBox: { x: 0.06, y: 0.28, width: 0.14, height: 0.18 },
        part: 'Left side mirror',
        damageType: 'Cracked casing, broken mount',
        severity: 'medium',
        recommendation: 'replace',
        confidence: 85,
        agentEdited: false,
      },
    ],
  },
  {
    id: 'demo-3',
    label: 'Rear-End Impact',
    description: 'Red car involved in a rear-end collision, being recovered',
    // "A red car being towed after a road traffic collision" by Usman Malik on Unsplash
    imageUrl: 'https://images.unsplash.com/photo-1673187139211-1e7ec3dd60ec?w=900&q=80&auto=format&fit=crop',
    claimData: {
      policyNumber: 'POL-2024-65890',
      incidentDate: '2024-06-05',
      clientName: 'Priya Sharma',
      clientAddress: '8 Elm Street, Denver, CO 80201',
    },
    annotations: [
      {
        id: 1,
        boundingBox: { x: 0.12, y: 0.50, width: 0.72, height: 0.32 },
        part: 'Rear bumper',
        damageType: 'Impact deformation and cracks',
        severity: 'severe',
        recommendation: 'replace',
        confidence: 96,
        agentEdited: false,
      },
      {
        id: 2,
        boundingBox: { x: 0.18, y: 0.28, width: 0.60, height: 0.26 },
        part: 'Trunk lid',
        damageType: 'Dent and misalignment',
        severity: 'medium',
        recommendation: 'repair',
        confidence: 81,
        agentEdited: false,
      },
      {
        id: 3,
        boundingBox: { x: 0.12, y: 0.48, width: 0.20, height: 0.18 },
        part: 'Tail light',
        damageType: 'Shattered lens',
        severity: 'severe',
        recommendation: 'replace',
        confidence: 93,
        agentEdited: false,
      },
    ],
  },
];

export const DEMO_REPAIR_SHOPS = [
  { name: 'AutoFix Premier Garage', address: '1200 Industrial Blvd, Austin, TX 78702', distance: '1.4 miles', rating: 4.8 },
  { name: 'City Panel & Paint', address: '850 South Congress Ave, Austin, TX 78704', distance: '2.1 miles', rating: 4.6 },
  { name: 'Premier Accident Repairs', address: '3300 Esperanza Crossing, Austin, TX 78758', distance: '3.0 miles', rating: 4.7 },
];
