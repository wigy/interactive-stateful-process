"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemError = exports.DatabaseError = exports.NotFound = exports.NotImplemented = exports.BadState = exports.InvalidArgument = exports.InvalidFile = exports.ProcessingError = void 0;
class ProcessingError extends Error {
}
exports.ProcessingError = ProcessingError;
class InvalidFile extends ProcessingError {
}
exports.InvalidFile = InvalidFile;
class InvalidArgument extends ProcessingError {
}
exports.InvalidArgument = InvalidArgument;
class BadState extends ProcessingError {
}
exports.BadState = BadState;
class NotImplemented extends ProcessingError {
}
exports.NotImplemented = NotImplemented;
class NotFound extends ProcessingError {
}
exports.NotFound = NotFound;
class DatabaseError extends ProcessingError {
}
exports.DatabaseError = DatabaseError;
class SystemError extends ProcessingError {
}
exports.SystemError = SystemError;
