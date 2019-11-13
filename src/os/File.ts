import { LinkedList } from "../aux/LinkedList";
import { Job } from "./Job";

const PRIVATE = true;
const PUBLIC = false;

export class File {

  /**
   * Gets file based on a file name and the files list
   * @param name
   * @param fileList list of existent files in disc
   * @return File searched. Null if non-existent
   */
  public static getFile(name: string, fileList: File[]): File {
    return fileList.find((f) => f.getName() === name);
  }

  // attributes
  public name: string;
  public privacy: boolean;
  private size: number;
  private owner: Job[];
  private queue: LinkedList<Job>;

  public constructor(name: string, size: number) {
    this.privacy = PUBLIC;
    this.name = name;
    this.size = size;
    this.owner = [];
    this.queue = new LinkedList<Job>();
  }

  /**
   * Gets the name of the file
   *
   * @return filename
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Gets privacy level of the file
   *
   * @return true if file is private, false if file is public
   */
  public isPrivate(): boolean {
    return this.privacy;
  }

  /**
   * Gets file size
   *
   * @return file size
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * Verifies if specified job owns the file
   *
   * @param job Possible owner of file
   * @return true if job is owner, false if job is not owner
   */
  public isOwner(job: Job) {
    if (this.owner.find((j) => j.getId() === job.getId())) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Adds new owner to the file
   * @param job new owner
   */
  public addOwner(job: Job) {
    this.owner.push(job);
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
   * Insert the job in the queue if file is busy.
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
