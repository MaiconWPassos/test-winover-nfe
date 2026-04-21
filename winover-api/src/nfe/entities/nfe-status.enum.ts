export enum NfeStatus {
  PROCESSING = 'PROCESSING',
  AUTHORIZED = 'AUTHORIZED',
  REJECTED = 'REJECTED',
}

export function nfeStatusToApi(status: NfeStatus): string {
  switch (status) {
    case NfeStatus.PROCESSING:
      return 'processamento';
    case NfeStatus.AUTHORIZED:
      return 'autorizada';
    case NfeStatus.REJECTED:
      return 'rejeitada';
    default:
      return 'processamento';
  }
}
