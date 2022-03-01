/**
 * Error types for processing and an exception used to ask more information from UI.
 * @module
 */
import { InteractiveElement } from 'interactive-elements';
export declare class ProcessingError extends Error {
}
export declare class InvalidFile extends ProcessingError {
}
export declare class InvalidArgument extends ProcessingError {
}
export declare class BadState extends ProcessingError {
}
export declare class NotImplemented extends ProcessingError {
}
export declare class NotFound extends ProcessingError {
}
export declare class DatabaseError extends ProcessingError {
}
export declare class SystemError extends ProcessingError {
}
/**
 * Special exception to halt processing in order to require more configuration information from UI.
 */
export declare class AskUI extends Error {
    element: InteractiveElement;
    constructor(element: InteractiveElement);
}
