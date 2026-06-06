// app/api/assess/route.js
// Calls the Anthropic vision API to analyze car damage images.
// Returns bounding box annotations for each identified damaged area.

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert automotive damage assessment AI used by an insurance company.
Your job is to analyze car damage photos and identify every damaged area with precision.
You always respond with valid JSON only — no explanations, no markdown, no preamble.`;

const USER_PROMPT = `Analyze this car damage image carefully. Identify ALL damaged areas visible.

For each damaged area, return a JSON array with this exact structure:
[
  {
    "id": 1,
    "boundingBox": {
      "x": 0.10,
      "y": 0.20,
      "width": 0.30,
      "height": 0.25
    },
    "part": "Front bumper",
    "damageType": "Impact dent and paint scrape",
    "severity": "medium",
    "recommendation": "repair",
    "confidence": 87
  }
]

Rules:
- boundingBox values are fractions of the image dimensions (0.0 to 1.0)
- x + width must not exceed 1.0; y + height must not exceed 1.0
- severity must be exactly one of: "minor", "medium", "severe"
- recommendation must be exactly one of: "repair", "replace"
- Use "replace" for severe structural damage, shattered components, or when repair cost exceeds replacement
- confidence is an integer 0-100 reflecting your certainty
- Be specific with part names (e.g. "Left front door" not just "Door")
- Identify all damaged parts — do not miss any visible damage
- Return ONLY the JSON array. No other text.`;

export async function POST(request) {
  try {
    const { imageData, mediaType } = await request.json();

    if (!imageData) {
      return Response.json({ error: 'No image data provided' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    // Strip data URL prefix if present
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const resolvedMediaType = mediaType || 'image/jpeg';

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: resolvedMediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: USER_PROMPT,
            },
          ],
        },
      ],
    });

    const raw = response.content[0].text.trim();

    // Safely parse the JSON response
    let annotations;
    try {
      // Strip any accidental markdown code fences
      const cleaned = raw.replace(/```json|```/g, '').trim();
      annotations = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', raw);
      return Response.json({ error: 'Failed to parse AI assessment. Please try again.' }, { status: 500 });
    }

    // Validate and sanitise each annotation
    const validated = annotations
      .filter(ann => ann.boundingBox && ann.part)
      .map((ann, index) => ({
        id: index + 1,
        boundingBox: {
          x: clamp(ann.boundingBox.x, 0, 0.95),
          y: clamp(ann.boundingBox.y, 0, 0.95),
          width: clamp(ann.boundingBox.width, 0.02, 1 - ann.boundingBox.x),
          height: clamp(ann.boundingBox.height, 0.02, 1 - ann.boundingBox.y),
        },
        part: String(ann.part),
        damageType: String(ann.damageType || 'Damage detected'),
        severity: ['minor', 'medium', 'severe'].includes(ann.severity) ? ann.severity : 'medium',
        recommendation: ['repair', 'replace'].includes(ann.recommendation) ? ann.recommendation : 'repair',
        confidence: Math.min(100, Math.max(0, parseInt(ann.confidence) || 75)),
        agentEdited: false,
      }));

    return Response.json({ annotations: validated });

  } catch (error) {
    console.error('Assessment API error:', error);
    return Response.json(
      { error: error.message || 'Assessment failed. Please try again.' },
      { status: 500 }
    );
  }
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, parseFloat(val) || 0));
}
