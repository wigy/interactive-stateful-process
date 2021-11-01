"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFlatElement = exports.isContainerElement = exports.isButtonElement = exports.isTextElement = exports.isBooleanElement = exports.isNamedElement = exports.isActiveElement = void 0;
function isActiveElement(object) {
    return typeof object === "object" && object !== null && !!object['actions'];
}
exports.isActiveElement = isActiveElement;
function isNamedElement(object) {
    return typeof object === "object" && object !== null && 'name' in object;
}
exports.isNamedElement = isNamedElement;
function isBooleanElement(object) {
    return typeof object === "object" && object !== null && object['type'] === 'boolean';
}
exports.isBooleanElement = isBooleanElement;
function isTextElement(object) {
    return typeof object === "object" && object !== null && object['type'] === 'text';
}
exports.isTextElement = isTextElement;
function isButtonElement(object) {
    return typeof object === "object" && object !== null && object['type'] === 'button';
}
exports.isButtonElement = isButtonElement;
function isContainerElement(object) {
    return typeof object === "object" && object !== null && !!object['elements'];
}
exports.isContainerElement = isContainerElement;
function isFlatElement(object) {
    return typeof object === "object" && object !== null && object['type'] === 'flat';
}
exports.isFlatElement = isFlatElement;
