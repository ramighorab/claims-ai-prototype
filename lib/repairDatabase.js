// lib/repairDatabase.js
// Simulates the insurance company's internal repair cost database.
// In production, this would be queried via SQL based on the AI annotation output.

const REPAIR_DB = {
  'front bumper':             { repair: 320,  replace: 850  },
  'rear bumper':              { repair: 280,  replace: 780  },
  'hood':                     { repair: 450,  replace: 1350 },
  'trunk':                    { repair: 380,  replace: 1100 },
  'trunk lid':                { repair: 380,  replace: 1100 },
  'roof':                     { repair: 650,  replace: 2200 },
  'left front door':          { repair: 520,  replace: 1900 },
  'right front door':         { repair: 520,  replace: 1900 },
  'left rear door':           { repair: 480,  replace: 1750 },
  'right rear door':          { repair: 480,  replace: 1750 },
  'door':                     { repair: 500,  replace: 1800 },
  'left fender':              { repair: 380,  replace: 950  },
  'right fender':             { repair: 380,  replace: 950  },
  'fender':                   { repair: 380,  replace: 950  },
  'left headlight':           { repair: null, replace: 420  },
  'right headlight':          { repair: null, replace: 420  },
  'headlight':                { repair: null, replace: 420  },
  'windshield':               { repair: 180,  replace: 650  },
  'rear windshield':          { repair: null, replace: 580  },
  'left side mirror':         { repair: 120,  replace: 280  },
  'right side mirror':        { repair: 120,  replace: 280  },
  'mirror':                   { repair: 120,  replace: 280  },
  'left rear quarter panel':  { repair: 520,  replace: 1600 },
  'right rear quarter panel': { repair: 520,  replace: 1600 },
  'quarter panel':            { repair: 520,  replace: 1600 },
  'grille':                   { repair: 200,  replace: 480  },
  'tail light':               { repair: null, replace: 320  },
  'taillamp':                 { repair: null, replace: 320  },
  'wheel':                    { repair: 150,  replace: 450  },
  'rim':                      { repair: 150,  replace: 380  },
  'side skirt':               { repair: 200,  replace: 550  },
  'spoiler':                  { repair: 180,  replace: 490  },
};

/**
 * Looks up the cost for a given part and recommendation.
 * Simulates the SQL query: SELECT repair_cost, replace_cost FROM repair_db WHERE part_name LIKE ?
 *
 * @param {string} partName - Part name from AI annotation
 * @param {'repair'|'replace'} recommendation - AI or agent recommendation
 * @returns {number} Cost in USD
 */
export function getCostForPart(partName, recommendation) {
  const key = partName.toLowerCase().trim();

  // 1. Exact match
  if (REPAIR_DB[key]) {
    return resolveCoast(REPAIR_DB[key], recommendation);
  }

  // 2. Partial match — find the closest entry
  for (const [dbKey, costs] of Object.entries(REPAIR_DB)) {
    if (key.includes(dbKey) || dbKey.includes(key)) {
      return resolveCoast(costs, recommendation);
    }
  }

  // 3. Keyword fallback
  if (key.includes('light') || key.includes('lamp')) {
    return resolveCoast({ repair: null, replace: 380 }, recommendation);
  }
  if (key.includes('glass') || key.includes('window')) {
    return resolveCoast({ repair: 180, replace: 600 }, recommendation);
  }
  if (key.includes('panel') || key.includes('body')) {
    return resolveCoast({ repair: 450, replace: 1200 }, recommendation);
  }

  // 4. Generic default
  return recommendation === 'repair' ? 400 : 900;
}

function resolveCoast(costs, recommendation) {
  if (recommendation === 'repair' && costs.repair !== null) {
    return costs.repair;
  }
  // If repair not available or recommendation is replace, use replace cost
  return costs.replace;
}

/**
 * Generates a labor cost on top of parts cost (simplified flat rate).
 */
export function getLaborCost(recommendation, severity) {
  const base = { minor: 80, medium: 150, severe: 280 };
  const multiplier = recommendation === 'replace' ? 1.5 : 1;
  return Math.round((base[severity] || 150) * multiplier);
}
