import { LinkedList } from "../aux/LinkedList";
import { Job } from "../os/Job";

const FREE: boolean = true;
const BUSY: boolean = false;

export class Processor {

  public static OVERHEAD_TIME: number = 0;
  private quantum: number;
  private status: boolean;
  private queue: LinkedList<Job>;

  public constructor(timeSlice: number) {
    this.status = FREE;
    this.quantum = timeSlice;
    this.queue = new LinkedList<Job>();
  }

  /**
   * Verifies processor's status.
   *
   * @return true if FREE; false if BUSY.
   */
  public isFree(): boolean {
    return this.status;
  }

  /**
   * Gets the maximum time slice this processor can give.
   *
   * @return processor's defined quantum.
   */
  public getQuantum(): number {
    return this.quantum;
  }

  /**
   * Executes on the processor, busying it.
   */
  public assign() {
    this.status = BUSY;
  }

  /**
   * Finishes the execution, getting the processor free.
   */
  public release() {
    this.status = FREE;
  }

  /**
   * Verifies if there are no jobs waiting for the processor.
   *
   * @return true if there are no jobs enqueued; false if there are.
   */
  public hasEmptyQueue(): boolean {
    return this.queue.isEmpty();
  }

  /**
   * Insert the job in the queue if processor is busy.
   *
   * @param job to be inserted.
   */
  public enqueue(job: Job) {
    this.queue.push(job);
  }

  /**
   * Removes the job from the top of the queue.
   */
  public dequeue(): Job {
    if (!this.queue.isEmpty()) {
      return this.queue.shift();
    } else {
      return null;
    }
  }
}
