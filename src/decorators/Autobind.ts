namespace DDApp {
    export function autobind(_: any, _1: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const adjDescriptor: PropertyDescriptor = {
            configurable: true,
            get() {
                return originalMethod.bind(this);
            }
        };
        return adjDescriptor;
    }
}
