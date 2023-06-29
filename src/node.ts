class Node {
  id: string;
  status: 'start' | 'end' | 'unvisited' | 'visited';

  constructor(_id: string, _status: 'start' | 'end' | 'unvisited') {
    this.id = _id;
    this.status = _status;
  }
}

export default Node;
