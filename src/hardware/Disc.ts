import { LinkedList } from "../aux/LinkedList";
import { Job } from "../os/Job";

export const FREE = true;
export const BUSY = false;

export class Disc {
  private status: boolean;
  private positioningTime: number;
  private latencyTime: number;
  private transferRatio: number;
  private queue: LinkedList<Job>;

  private files: File[];

  constructor(pt: number, lt: number, transferRatio: number) {
    this.status = FREE;
    this.positioningTime = pt;
    this.latencyTime = lt;
    this.transferRatio = transferRatio;
    this.queue = new LinkedList<Job>();
    this.files = [];
  }

  /**
   * Verifies disc's status.
   *
   * @return true if FREE; false if BUSY.
   */
  public isFree(): boolean {
    return this.status;
  }

  /**
   * Gets the time taken to this disc to issue a I/O operation.
   *
   * @param recordSize to be processed.
   * @return disc's processing time.
   */
  public getProcessingTime(recordSize: number): number {
    return (this.positioningTime + this.latencyTime + this.transferRatio * recordSize);
  }

  /**
   * Processes an I/O request, busying it.
   */
  public assign(): void {
    this.status = BUSY;
  }

  /**
   * Finishes the I/O request, getting the disc free.
   */
  public release(): void {
    this.status = FREE;
  }

  /**
   * Verifies if there are no jobs waiting for the disc.
   *
   * @return true if there are no jobs enqueued; false if there are.
   */
  public hasEmptyQueue(): boolean {
    return this.queue.isEmpty();
  }

  /**
   * Insert the job in the queue if disc is busy.
   *
   * @param job to be inserted.
   */
  public enqueue(job: Job): void {
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
