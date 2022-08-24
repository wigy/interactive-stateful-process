import { Router } from 'express';
import { ProcessingConfigurator } from '.';
import { Database } from '..';
export declare function router<VendorElement, VendorState, VendorAction>(db: Database, configurator: ProcessingConfigurator<VendorElement, VendorState, VendorAction>): Router;
