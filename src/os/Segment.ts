import Item from "../aux/Item";
import { LinkedList } from "../aux/LinkedList";
export const REAL = true;
export const VIRTUAL = false;

export class Segment {

  private status: boolean;
  private memoryPosition: number;
  private size: number;
  private jobId: number;

  public constructor(offset: number, jobId: number) {
    this.status = VIRTUAL;
    this.memoryPosition = 0;
    this.size = offset;
    this.jobId = jobId;
  }

  /**
   * Verifies if the segment is allocated in the memory.
   *
   * @return true if it is; false otherwise.
   */
  public isAllocated(): boolean {
    return this.status;
  }

  /**
   * Gets the initial position in the memory for this segment.
   *
   * @return segment's position.
   */
  public getPosition(): number {
    return this.memoryPosition;
  }

  /**
   * Gets the size of this segment.
   *
   * @return segment's size.
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * Gets the ID of the correpondant Job.
   *
   * @return segment's size.
   */
  public getJobId(): number {
    return this.jobId;
  }

  /**
   * Verifies if this segment is equal to that one.
   *
   * @param other segment to be compared to.
   * @return true if they are equal; false if that is null or they differ their parameters.
   */
  public equals(other: Segment) {
    if (other === null) {
      return false;
    } else if (this.memoryPosition === other.memoryPosition && this.size === other.size) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Add this segment into the list, in order of address.
   *
   * @param segmentList stores all used segments.
   * @TODO review logic of iterators
   */
  public insert(segmentList: LinkedList<Segment> , position: number): void {
    const segments = segmentList.items();

    this.status = REAL;
    this.memoryPosition = position;

    let earlier = false;
    let segmentRef: Item<Segment>;
    for (const seg of segments) {
      if (earlier) {
        break;
      }
      segmentRef = seg;
      const segment: Segment = seg.val;

      if (this.memoryPosition < segment.getPosition()) {
        earlier = true;
      }
    }
    if (segmentRef) {
      segmentList.addAfter(segmentRef, this);
    } else {
      segmentList.push(this);
    }
  }

  /**
   * Finds and removes this segment from the list.
   *
   * @param segmentList stores all used segments.
   *
   * @TODO take with comparison between classes
   */
  public remove(segmentList: LinkedList<Segment>): void {
    segmentList.delete(this);

    this.status = VIRTUAL;
    this.memoryPosition = 0;
  }
}
