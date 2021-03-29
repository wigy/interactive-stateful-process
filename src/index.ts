import { Origin } from './origin';

export default function getOrigin(): Origin {
    return { type: 'web', referrer: 'http://localhost' }
}
