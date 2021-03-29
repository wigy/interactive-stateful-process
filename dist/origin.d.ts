export declare type OriginType = 'web';
export interface WebOrigin {
    type: OriginType;
    referrer: string;
}
export declare type Origin = WebOrigin;
