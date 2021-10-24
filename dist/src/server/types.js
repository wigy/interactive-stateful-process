"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStatus = void 0;
/**
 * Overall status of the process.
 *
 *  * INCOMPLETE - Something has stopped the process before it has been finished properly.
 *  * WAITING - The process is currently waiting for external input.
 *  * SUCCEEDED - The process is completed successfully.
 *  * FAILED - The process is completed unsuccessfully.
 *  * CRASHED - A handler has crashed at some point and process is halted.
 *
 */
var ProcessStatus;
(function (ProcessStatus) {
    ProcessStatus["INCOMPLETE"] = "INCOMPLETE";
    ProcessStatus["WAITING"] = "WAITING";
    ProcessStatus["SUCCEEDED"] = "SUCCEEDED";
    ProcessStatus["FAILED"] = "FAILED";
    ProcessStatus["CRASHED"] = "CRASHED";
})(ProcessStatus = exports.ProcessStatus || (exports.ProcessStatus = {}));
