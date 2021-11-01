/**
 * Options for the CSV parsing.
 *
 * * `useFirstLineHeadings` - If set, the first line is first trimmed from space an # and then used as headings for columns.
 */
export type ImportCSVOptions = {
  useFirstLineHeadings?: boolean
}
