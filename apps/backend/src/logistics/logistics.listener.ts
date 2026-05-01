import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ShipmentStatusChangedEvent } from '../common/events/domain.events';
import { LogisticsRepository } from './logistics.repository';

@Injectable()
export class LogisticsListener {
  private readonly logger = new Logger(LogisticsListener.name);

  constructor(private readonly logisticsRepository: LogisticsRepository) {}

  @OnEvent('shipment.status_changed')
  async handleShipmentStatusChanged(event: ShipmentStatusChangedEvent) {
    this.logger.log(
      `Shipment ${event.shipmentId} changed from ${event.oldStatus} to ${event.newStatus}`
    );

    // Placeholder for future logic: 
    // e.g., Notify customers, update expected delivery dates, trigger external logistics providers, etc.
    
    if (event.newStatus === 'COMPLETED') {
        this.logger.log(`Shipment ${event.shipmentId} marked as COMPLETED. Inventory sync finished.`);
    }
  }
}
