// In-memory storage (shared with other functions)
let clicks = new Map();

export default function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clickData = clicks.get(id) || [];
  res.json({ 
    clicks: clickData.length,
    timestamps: clickData 
  });
}