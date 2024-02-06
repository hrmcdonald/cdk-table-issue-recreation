/** @ignore */
export function getMtrTableDataSourceArrayError(): Error {
  return Error('MtrTableDataSource data must be an Array of an Observable that emits an Array');
}

/** @ignore */
export function getMtrTableDataSourceMultiSortContainerError(): Error {
  return Error(
    'MtrTableDataSource cannot apply a multi-sort to a MtrSortContainer other than MtrMultiSort'
  );
}

/** @ignore */
export function getMtrRemotePaginatedTableDataSourceMissingPaginatorArrayError(): Error {
  return Error(
    'A MtrPaginator must be set as the paginator value for MtrRemotePaginatedTableDataSource'
  );
}
