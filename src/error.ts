export class ProcessingError extends Error {}
export class InvalidArgument extends ProcessingError {}
export class BadState extends ProcessingError {}
export class NotImplemented extends ProcessingError {}