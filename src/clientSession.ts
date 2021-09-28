import Caching from "./caching";

export class ClientSession {
  constructor(readonly cache: Caching, readonly isAuthenticated: () => boolean, private readonly endSession: () => void) { }
  end = () => {
    this.endSession();
    this.cache.clearAll();
  };
}