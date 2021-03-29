
export type OriginType = 'web'

export interface WebOrigin {
    type: OriginType;
    referrer: string;
};

export type Origin = WebOrigin;
