import Item from "../aux/Item";
import { LinkedList } from "../aux/LinkedList";
import { Job } from "./Job";
// constants
export const EVENTS = {
  0: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  1: "Arrival                      ",
  2: "Request Memory               ",
  3: "Request Processor            ",
  4: "Release Processor (Issue I/O)",
  5: "Request I/O                  ",
  6: "Complete I/O                 ",
  7: "Completion                   ",
  8: "Time-out                     ",
};

export enum EventType {
  INVALID = 0,
  ARRIVAL = 1,
  REQUEST_MEMORY = 2,
  REQUEST_PROCESSOR = 3,
  ISSUE_IO = 4,
  REQUEST_IO = 5,
  RELEASE_IO = 6,
  COMPLETION = 7,
  TIME_OUT = 8,
}

export class Event {

  // attributes
  private job: Job;
  private time: number;
  private type: EventType;

  public constructor(job: Job, time: number, type: EventType) {
    this.job = job;
    this.time = time;
    this.type = type;
  }

  /**
   * Gets this event's job.
   *
   * @return event's job.
   */
  public getJob(): Job {
    return this.job;
  }

  /**
   * Gets this event's arrival time.
   *
   * @return event's arrival time.
   */
  public getTime(): number {
    return this.time;
  }

  /**
   * Gets this event's type.
   *
   * @return event's type.
   */
  public getType(): EventType {
    return this.type;
  }

  /**
   * Gets this event's type name, formated to fix program output.
   *
   * @return event's type name.
   */
  public getType_toString(): string {
    return EVENTS[this.getType()];
  }

  /**
   * Add this event into the list, in order of arrival.
   *
   * @param eventList stores all events.
   */
  public insert(eventList: LinkedList<Event>) {
    const eventIterator = eventList.items();

    let earlier = false;
    let beforeItem: Item<Event>;

    if (!eventList.isEmpty()) {
      for (const eventItem of eventIterator) {
        if (earlier) {
          break;
        }
        beforeItem = eventItem;
        const event = eventItem.val;
        if (this.time < event.getTime()) {
          eventIterator.return();
          earlier = true;
        }
      }
      eventList.addAfter(beforeItem, this);
    } else {
      eventList.push(this);
    }
  }

  /**
   * Gets the first event to happen.
   *
   * @param eventList stores all events.
   * @return the next event to happen.
   */
  public static getNew(eventList: LinkedList<Event>): Event {
    if (!eventList.isEmpty()) {
      return eventList.shift();
    } else {
      return null;
    }
  }
}
