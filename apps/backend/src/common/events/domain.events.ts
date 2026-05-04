export class OrderPaidEvent {
  constructor(
    public readonly orderId: string,
    public readonly paymentIntentId: string,
    public readonly amount: number,
    public readonly currency: string,
  ) {}
}

export class OrderCancelledEvent {
  constructor(public readonly orderId: string) {}
}

export class ShipmentStatusChangedEvent {
  constructor(
    public readonly shipmentId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
  ) {}
}

export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
  ) {}
}
