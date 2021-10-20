import { Knex } from "knex";
import Opaque from 'ts-opaque';
/**
 * A time as milliseconds from Epoch.
 */
export declare type TimeStamp = Opaque<number, 'TimeStamp'>;
/**
 * A Knex database.
 */
export declare type Database = Knex;
/**
 * An ID for database entries.
 */
export declare type ID = number | null;
