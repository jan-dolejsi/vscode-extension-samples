import { SemVer, ReleaseType } from "semver";

/** This function is separated out to another source file, so it can be tested. */
export function increment(version: string, releaseType: ReleaseType): string {
    return new SemVer(version).inc(releaseType).version;
}