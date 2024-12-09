export function topologicalSort(graph: Map<string, string[]>): string[] {
  const inDegree = new Map<string, number>();
  const nodes = Array.from(graph.keys());

  nodes.forEach((node) => inDegree.set(node, 0));
  graph.forEach((edges, node) => {
    edges.forEach((e) => inDegree.set(e, (inDegree.get(e) || 0) + 1));
  });

  const queue: string[] = [];
  inDegree.forEach((deg, node) => {
    if (deg === 0) queue.push(node);
  });

  const result: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);
    for (const neighbor of graph.get(current)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (result.length !== nodes.length) {
    throw new Error('Cycle detected or invalid graph');
  }

  return result;
}
