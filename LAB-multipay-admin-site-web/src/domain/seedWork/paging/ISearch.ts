import IPaging from './IPaging';

export default interface ISearch<T> {
  data: T[];
  paging: IPaging;
}
