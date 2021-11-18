import { ImportSegment, SegmentId, TextFileLine } from "./TextFileLine";
/**
 * Initial state of the text file import.
 */
export declare type ImportStateText<StageType> = {
    stage: StageType;
    files: {
        [text: string]: {
            lines: TextFileLine[];
        };
    };
    segments?: Record<SegmentId, ImportSegment>;
    results?: Record<SegmentId, unknown>;
};
/**
 * Union of all import states.
 */
export declare type ImportState = ImportStateText<'initial'> | ImportStateText<'segmented'> | ImportStateText<'classified'> | ImportStateText<'analyzed'> | ImportStateText<'executed'>;
export declare function isImportState(obj: unknown): obj is ImportState;
