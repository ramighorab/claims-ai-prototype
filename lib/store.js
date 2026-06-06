// lib/store.js
// Simple localStorage-based state management for the prototype.
// In production this would be replaced by a proper backend database.

export function generateClaimId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `CLM-${timestamp}-${random}`;
}

function getAllClaims() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('claimvision_claims');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistClaims(claims) {
  localStorage.setItem('claimvision_claims', JSON.stringify(claims));
}

export function saveClaim(claim) {
  const claims = getAllClaims();
  claims[claim.id] = { ...claim, updatedAt: new Date().toISOString() };
  persistClaims(claims);
}

export function getClaim(id) {
  const claims = getAllClaims();
  return claims[id] || null;
}

export function updateClaim(id, updates) {
  const claims = getAllClaims();
  if (!claims[id]) return null;
  claims[id] = { ...claims[id], ...updates, updatedAt: new Date().toISOString() };
  persistClaims(claims);
  return claims[id];
}
