import { SemVer } from 'semver';
export declare class Version {
    private _version;
    private _semver;
    constructor(_version?: string);
    isAlpha(): boolean;
    isBeta(): boolean;
    isReleaseCandidate(): boolean;
    isKnown(): boolean;
    isLocal(): boolean;
    isGreaterThanOrEqualTo(other: SemVer): boolean;
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly qualifier: string;
    readonly extra: string;
    toString(): string;
    static fromProject(): Version;
    static assertCompatibleAngularVersion(projectRoot: string): void;
    static assertTypescriptVersion(projectRoot: string): void;
}
