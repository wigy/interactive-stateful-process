import { Request } from 'express'
import { ProcessingSystem } from '../process/ProcessingSystem'

/**
 * A function selecting a suitable processing system based on the request received.
 */
export type ProcessingConfigurator<VendorElement=unknown, VendorState=unknown, VendorAction=unknown> = (req: Request) => ProcessingSystem<VendorElement, VendorState, VendorAction>
