import { NodeStatusType } from './types';

class Node {
  r: number;
  c: number;
  id: string;
  status: NodeStatusType;

  constructor(_r: number, _c: number, _id: string, _status: NodeStatusType) {
    this.r = _r;
    this.c = _c;
    this.id = _id;
    this.status = _status;
  }
}

export default Node;
