import _ from "./listHelpers";
export * from "./dateHelpers";
export * from "./bindFunctions";
export * from "./reactHelpers";
export * from "./cssHelpers";
export { _ };

/**
 * Create a promises which resolves after "milliseconds" time elapsed. This is for testing purposes.
 * @param milliseconds how much delay the next statement
 */
export function delay(milliseconds: number): Promise<any> {
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
    return promise;
}