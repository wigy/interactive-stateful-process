export class ProcessingError extends Error {}
export class InvalidFile extends ProcessingError {}
export class InvalidArgument extends ProcessingError {}
export class BadState extends ProcessingError {}
export class NotImplemented extends ProcessingError {}
export class NotFound extends ProcessingError {}
export class DatabaseError extends ProcessingError {}
