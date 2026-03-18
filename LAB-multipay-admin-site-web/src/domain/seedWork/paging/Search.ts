import ISearch from './ISearch';
import IPaging from './IPaging';
import { Paging } from './Paging';

export class Search<T> implements ISearch<T> {
  data: T[];
  paging: IPaging;
  constructor(data: T[] = [], paging: IPaging = new Paging()) {
    this.data = data;
    this.paging = paging;
  }
}
