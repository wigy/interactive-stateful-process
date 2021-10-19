import { Knex } from "knex"
import Opaque from 'ts-opaque'

/**
 * A time as milliseconds from Epoch.
 */
export type TimeStamp = Opaque<number, 'TimeStamp'>
/**
 * A Knex database.
 */
export type Database = Knex
