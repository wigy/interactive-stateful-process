
export type OriginType = '[unknonwn]' | 'web'

export interface UnknownOrigin {
    type: '[unknown]'
};

export interface WebOrigin {
    type: 'web'
    referrer: string
};

export type Origin = UnknownOrigin | WebOrigin
