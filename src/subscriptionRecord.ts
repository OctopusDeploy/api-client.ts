export type Callback<T> = (details: T) => void;

export type Unsubscribe = () => void;

export class SubscriptionRecord<T> {
    private subscriptions: Record<string, Callback<T>> = {};

    subscribe(registrationName: string, callback: Callback<T>): Unsubscribe {
        this.subscriptions[registrationName] = callback;
        return () => this.unsubscribe(registrationName);
    }

    unsubscribe(registrationName: string) {
        delete this.subscriptions[registrationName];
    }

    notify(predicate: (name: string) => boolean, data: T) {
        Object.keys(this.subscriptions)
            .filter(predicate)
            .forEach((key) => this.subscriptions[key](data));
    }

    notifyAll(data: T) {
        this.notify(() => true, data);
    }

    notifySingle(registrationName: string, data: T) {
        if (registrationName in this.subscriptions) {
            this.subscriptions[registrationName](data);
        }
    }
}
