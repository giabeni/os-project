import { Segment } from "./Segment";
export class Job {

  private id: number ;
  private memorySpace: number;
  private processingTime: number;
  private ioRequests: number;
  private interrequestTime: number;
  private recordLength: number;
  private segmentList: Segment[];

  private timeToNextRelease: number;
  private filesList: string[];

  public constructor(id: number, procTime: number, io: number, rl: number, segmentSizes: number[], filesList: string[]) {
    this.id = id;
    this.processingTime = procTime;
    this.memorySpace = 0;
    this.ioRequests = io;
    this.segmentList = [];

    for (let i = 0; i < segmentSizes.length; i++) {
      this.segmentList[i] = new Segment(segmentSizes[i], this.id);
      this.memorySpace += segmentSizes[i];
    }

    this.recordLength = rl;
    if (this.ioRequests > 0) {
      this.interrequestTime = this.processingTime / (this.ioRequests + 1);
      this.timeToNextRelease = this.interrequestTime;
    } else {
      this.interrequestTime = 0;
      this.timeToNextRelease = this.processingTime;
    }
    this.filesList = filesList;
  }

  /**
   * Gets this job's numeric identification.
   *
   * @return job's id.
   */
  public getId(): number {
    return this.id;
  }

  /**
   * Gets this job's memory space required for execution.
   *
   * @return job's memory space required.
   */
  public getSize(): number {
    return this.memorySpace;
  }

  /**
   * Gets this job's total processing time.
   *
   * @return job's processing time.
   */
  public getProcessingTime(): number {
    return this.processingTime;
  }

  /**
   * Gets this job's quantity of I/O requests.
   *
   * @return job's i/o requests.
   */
  public getIoRequests(): number {
    return this.ioRequests;
  }

  /**
   * Gets time taken to the next I/O issue.
   *
   * @return job's interrequest time.
   */
  public getInterrequestTime(): number {
    return this.interrequestTime;
  }

  /**
   * Gets time taken to process an I/O request.
   *
   * @return job's record length.
   */
  public getRecordLength(): number {
    return this.recordLength;
  }

  /**
   * Gets the selected segment of this job.
   *
   * @param index of the segment
   * @return job's segments list.
   */
  public getSegmentList(): Segment[] {
    return this.segmentList;
  }

  /**
   * Gets time taken until this job issues another I/O operation, has its quantum finished, or end its processing.
   *
   * @return job's time to the next processor release.
   */
  public getTimeToNextRelease(): number {
    return this.timeToNextRelease;
  }

  /**
   * Reduces the I/O requests remaining for this job to complete execution.
   */
  public issuedIo(): void {
    this.ioRequests--;
    this.timeToNextRelease = this.interrequestTime;
  }

  /**
   * Reduces the remaining time to process this job.
   */
  public partialProcessed(time: number) {
    this.timeToNextRelease -= time;
    this.processingTime -= time;
  }

  /**
   * Removes the remaining time to process this job.
   */
  public fullyProcessed() {
    this.timeToNextRelease = 0;
    this.processingTime = 0;
  }
}
