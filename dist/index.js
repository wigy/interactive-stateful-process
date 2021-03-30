export * from './origin';
export function getOrigin() {
    return { type: 'web', referrer: 'http://localhost' };
}
export default {
    getOrigin
};
