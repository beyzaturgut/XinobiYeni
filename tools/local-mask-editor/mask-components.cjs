// Find meaningful connected mask regions using row runs, keeping memory bounded for full-resolution assets.
function connectedComponents(raw, width, height) {
  if (!Buffer.isBuffer(raw) || raw.length !== width * height * 4) throw Error('Mask dimensions do not match the source.');
  const parent = [], runs = []; let previous = [];
  function find(value) { let root = value; while (parent[root] !== root) root = parent[root]; while (parent[value] !== value) { const next = parent[value]; parent[value] = root; value = next; } return root; }
  function unite(left, right) { left = find(left); right = find(right); if (left !== right) parent[right] = left; }
  for (let y = 0; y < height; y++) {
    const current = []; let x = 0;
    while (x < width) {
      while (x < width && raw[(y * width + x) * 4 + 3] === 0) x++;
      if (x === width) break;
      const start = x; while (x + 1 < width && raw[(y * width + x + 1) * 4 + 3] !== 0) x++; const end = x;
      if (parent.length >= 500000) throw Error('Mask component structure exceeds the safe analysis limit.');
      const id = parent.length; parent.push(id);
      for (const neighbor of previous) { if (neighbor.end < start - 1) continue; if (neighbor.start > end + 1) break; unite(id, neighbor.id); }
      const run={y,start,end,id}; current.push(run); runs.push(run); x++;
    }
    previous = current;
  }
  const groups = new Map();
  for (const run of runs) {
    const root=find(run.id); let group=groups.get(root);
    if(!group){group={top:run.y,bottom:run.y,left:run.start,right:run.end,area:0,runs:[]};groups.set(root,group);}
    group.top=Math.min(group.top,run.y);group.bottom=Math.max(group.bottom,run.y);group.left=Math.min(group.left,run.start);group.right=Math.max(group.right,run.end);
    group.area+=run.end-run.start+1;group.runs.push({y:run.y,start:run.start,end:run.end});
  }
  const minimumArea = Math.max(64, Math.floor(width * height * 0.00025));
  return [...groups.values()].filter(group=>group.area>=minimumArea).sort((a,b)=>a.top-b.top||a.left-b.left);
}
function significantComponentCount(raw,width,height){return connectedComponents(raw,width,height).length;}
module.exports = { connectedComponents, significantComponentCount };
