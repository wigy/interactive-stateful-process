import { Origin } from './origin';

export * from './origin';

export function getOrigin(): Origin {
    return { type: 'web', referrer: 'http://localhost' }
}

export default {
    getOrigin
}
