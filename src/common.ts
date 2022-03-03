/**
 * Common utility definitions.
 *
 * @module interactive-stateful-process/src/common
 */
import { Knex } from "knex"

/**
 * A Knex database.
 */
// TODO: Isn't this defined also in elements?
export type Database = Knex
