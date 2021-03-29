import { Origin } from './origin';

export { Origin, OriginType, WebOrigin } from './origin';

export function getOrigin(): Origin {
    return { type: 'web', referrer: 'http://localhost' }
}

export default {
    getOrigin
}
