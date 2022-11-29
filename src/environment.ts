export default class Environment {
    static isInDevelopmentMode(): boolean {
        return !process.env.NODE_ENV || process.env.NODE_ENV !== "production";
    }
}
