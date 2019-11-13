import Item from "../aux/Item";
import { LinkedList } from "../aux/LinkedList";
import { Job } from "../os/Job";
import { Segment } from "../os/Segment";

export class Memory {
  private totalSize: number;
  private relocatingTime: number;
  private queue: LinkedList<Job>;
  private segmentMap: LinkedList<Segment>;

  public constructor(size: number, rt: number) {
    this.totalSize = size;
    this.relocatingTime = rt;
    this.queue = new LinkedList<Job>();
    this.segmentMap = new LinkedList<Segment>((x, y) => x.equals(y) );
  }

  /**
   * Searches for a point to create a new segment.
   *
   * @param size to be allocated.
   * @return the position of free space; -1 if not found.
   */
  public getFreeSpacePosition(offset: number, size: number): number {
    const segments = this.segmentMap.items();
    let segment: Segment = null;
    let pos: number = offset;

    if (this.segmentMap.count() === 0) {
      return offset;
    }

    for (const seg of segments) {
      segment = seg.val;
      if (pos + size <= segment.getPosition()) {
        return pos;
      }

      if (segment.getPosition() + segment.getSize() > pos) {
        pos = segment.getPosition() + segment.getSize();
      }
    }

    // if there is space at the end of the memory
    if (pos + size < this.totalSize) {
      return pos;
    } else {
      return -1;
    }
  }

  /**
   * Gets the time necessary for the this memory to allocate memory to the job.
   *
   * @return memory's relocating time.
   */
  public getRelocatingTime(): number {
    return this.relocatingTime;
  }

  /**
   * Allocates a part of the memory for the job.
   *
   * @param segment to be allocated.
   * @return true if allocated.
   */
  public allocate(segment: Segment | Segment[]): boolean {
    if (segment instanceof Array) {
      const segments = segment;
      const position: number[] = [];

      for (let i = 0; i < segments.length; i++) {
        if (i > 0) {
          position[i] = this.getFreeSpacePosition(position[i - 1] + segments[i - 1].getSize(), segments[i].getSize());
        } else {
          position[i] = this.getFreeSpacePosition(0, segments[i].getSize());
        }

        if (position[i] === -1) {
          return false;
        }
      }

      for (let i = 0; i < segments.length; i++) {
        segments[i].insert(this.segmentMap, position[i]);
      }
      return true;
    } else {
      const position = this.getFreeSpacePosition(0, segment.getSize());

      if (position === -1) {
        return false;
      } else {
        segment.insert(this.segmentMap, position);
        return true;
      }
    }
  }

  /**
   * Releases a part of the memory from the job.
   *
   * @param segments stores all segment got from the job.
   */
  public release(segments: Segment[]): void {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < segments.length; i++) {
      this.segmentMap.delete(segments[i]);
    }
  }

  /**
   * Verifies if there are no jobs waiting for the memory.
   *
   * @return true if there are no jobs enqueued; false if there are.
   */
  public hasEmptyQueue(): boolean {
    return this.queue.isEmpty();
  }

  /**
   * Gets the segments that describes the memory space required for the first job of the queue.
   *
   * @return the segment list of the next job.
   */
  public nextSegmentsRequest(): Segment[] {
    return this.queue.getFirst().getSegmentList();
  }

  /**
   * Insert the job in the queue if memory is full.
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

  public printSegmentMap(): void {
    console.log("\n\t\t\t * MEMORY SEGMENT MAP * ");
    console.log("\t\t\t=================================");
    console.log("\t\t\t| " + "Position \tSize \tJob ID \t|");
    console.log("\t\t\t---------------------------------");
    for (const segment of this.segmentMap.items()) {
      console.log("\t\t\t| " + segment.val.getPosition() + "\t\t" + segment.val.getSize() + "\t" + segment.val.getJobId() + " \t|");
    }
    console.log("\t\t\t=================================\n");

    console.log("\t\t\tMemory Queue: ", this.queue.print((j) => "Job " + j.getId() + " [" + j.getSegmentList().map((s) => s.getSize()) + "]"), "\n");
  }
}
