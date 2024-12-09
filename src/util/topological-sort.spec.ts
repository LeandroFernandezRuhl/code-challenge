import { topologicalSort } from './topological-sort.util';

describe('Topological Sort', () => {
  it('should handle a graph with multiple disconnected components', () => {
    const graph = new Map<string, string[]>();
    graph.set('A', ['B']);
    graph.set('B', []);
    graph.set('C', ['D']);
    graph.set('D', []);

    const order = topologicalSort(graph);
    expect(order).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D']));
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('D'));
  });

  it('should handle a graph with a single node', () => {
    const graph = new Map<string, string[]>();
    graph.set('SingleNode', []);

    const order = topologicalSort(graph);
    expect(order).toEqual(['SingleNode']);
  });

  it('should handle an empty graph', () => {
    const graph = new Map<string, string[]>();
    const order = topologicalSort(graph);
    expect(order).toEqual([]);
  });

  it('should throw an error for a cyclic graph', () => {
    const graph = new Map<string, string[]>();
    graph.set('A', ['B']);
    graph.set('B', ['C']);
    graph.set('C', ['A']); // Cycle here

    expect(() => topologicalSort(graph)).toThrow(
      'Cycle detected or invalid graph',
    );
  });

  it('should handle a graph with multiple valid topological orders', () => {
    const graph = new Map<string, string[]>();
    graph.set('A', ['B', 'C']);
    graph.set('B', []);
    graph.set('C', []);

    const order = topologicalSort(graph);
    expect(order).toEqual(expect.arrayContaining(['A', 'B', 'C']));
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('C'));
  });

  it('should handle a graph with no dependencies', () => {
    const graph = new Map<string, string[]>();
    graph.set('A', []);
    graph.set('B', []);
    graph.set('C', []);

    const order = topologicalSort(graph);
    expect(order).toEqual(expect.arrayContaining(['A', 'B', 'C']));
  });
});
