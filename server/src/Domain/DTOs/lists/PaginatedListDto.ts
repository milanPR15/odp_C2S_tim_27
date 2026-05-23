export class PaginatedListDto<T> {
  constructor(
    public readonly items: T[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number
  ) {}

  public get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  public get hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  public get hasPreviousPage(): boolean {
    return this.page > 1;
  }
}