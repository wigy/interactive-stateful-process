"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.NotFound = exports.NotImplemented = exports.BadState = exports.InvalidArgument = exports.InvalidFile = exports.ProcessingError = void 0;
var ProcessingError = /** @class */ (function (_super) {
    __extends(ProcessingError, _super);
    function ProcessingError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ProcessingError;
}(Error));
exports.ProcessingError = ProcessingError;
var InvalidFile = /** @class */ (function (_super) {
    __extends(InvalidFile, _super);
    function InvalidFile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidFile;
}(ProcessingError));
exports.InvalidFile = InvalidFile;
var InvalidArgument = /** @class */ (function (_super) {
    __extends(InvalidArgument, _super);
    function InvalidArgument() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidArgument;
}(ProcessingError));
exports.InvalidArgument = InvalidArgument;
var BadState = /** @class */ (function (_super) {
    __extends(BadState, _super);
    function BadState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BadState;
}(ProcessingError));
exports.BadState = BadState;
var NotImplemented = /** @class */ (function (_super) {
    __extends(NotImplemented, _super);
    function NotImplemented() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NotImplemented;
}(ProcessingError));
exports.NotImplemented = NotImplemented;
var NotFound = /** @class */ (function (_super) {
    __extends(NotFound, _super);
    function NotFound() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NotFound;
}(ProcessingError));
exports.NotFound = NotFound;
var DatabaseError = /** @class */ (function (_super) {
    __extends(DatabaseError, _super);
    function DatabaseError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DatabaseError;
}(ProcessingError));
exports.DatabaseError = DatabaseError;
