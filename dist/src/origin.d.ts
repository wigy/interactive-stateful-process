export declare type OriginType = '[unknonwn]' | 'web';
export interface UnknownOrigin {
    type: '[unknown]';
}
export interface WebOrigin {
    type: 'web';
    referrer: string;
}
export declare type Origin = UnknownOrigin | WebOrigin;
