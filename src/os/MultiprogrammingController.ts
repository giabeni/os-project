import { LinkedList } from "../aux/LinkedList";
import { Job } from "./Job";

export class MultiprogrammingController {
  private jobsLimit: number;
  private concurrentJobs: number;
  private queue: LinkedList<Job> ;

  public constructor(limit: number) {
    this.concurrentJobs = 0;
    this.jobsLimit = limit;
    this.queue = new LinkedList<Job>();
  }

  /**
   * Verifies if another job can execute now.
   *
   * @return true if it can; false otherwise.
   */
  public canRun(): boolean {
    if (this.concurrentJobs < this.jobsLimit) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Add another job to the execution.
   */
  public run() {
    this.concurrentJobs++;
  }

  /**
   * Removes a job from execution.
   */
  public finish() {
    this.concurrentJobs--;
  }

  /**
   * Verifies if there are no jobs waiting to run.
   *
   * @return true if there are no jobs enqueued; false if there are.
   */
  public hasEmptyQueue(): boolean {
    return this.queue.isEmpty();
  }

  /**
   * Insert the job in the queue if the number of jobs reached the limit.
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
