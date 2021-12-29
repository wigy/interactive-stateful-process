import { InteractiveElement } from 'interactive-elements'

export class ProcessingError extends Error {}
export class InvalidFile extends ProcessingError {}
export class InvalidArgument extends ProcessingError {}
export class BadState extends ProcessingError {}
export class NotImplemented extends ProcessingError {}
export class NotFound extends ProcessingError {}
export class DatabaseError extends ProcessingError {}
export class SystemError extends ProcessingError {}

/**
 * Special exception to halt processing in order to require more configuration information from UI.
 */
export class AskUI extends Error {
  public element: InteractiveElement

  constructor(element: InteractiveElement) {
    super('Need more information from UI.')
    this.element = element
  }
}
