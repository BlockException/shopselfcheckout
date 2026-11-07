import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEvent {
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly eventType: string;
  public readonly timestamp: Date;
  public readonly version: number;
  public readonly metadata: Record<string, any>;

  constructor(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    timestamp: Date,
    metadata: Record<string, any> = {}
  ) {
    this.eventId = uuidv4();
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.eventType = eventType;
    this.timestamp = timestamp;
    this.version = 0;
    this.metadata = metadata;
  }
}
