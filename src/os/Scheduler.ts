import { MultiprogrammingController } from "./MultiprogrammingController";
import { Memory } from "../hardware/Memory";
import { Processor } from "../hardware/Processor";
import { Disc } from "../hardware/Disc";
import { LinkedList } from "../aux/LinkedList";
import { Job } from "./Job";
import { Settings, COLORS } from "../settings/Settings";
import { Input } from "./Input";
import { Event, EventType, EVENTS } from "./Event";
import { File } from "./File";

export class Scheduler {

  private initialTime: number;
  private finalTime: number;

  private multiprogrammingController: MultiprogrammingController;

  private memory: Memory;
  private processor: Processor;
  private disc: Disc;

  private eventList: LinkedList<Event>;
  private jobTable: LinkedList<Job>;
  private timing: number[] = [];
  private filesList: File[] = [];

  private jobSummary: Array<{arrivalTime?: number, processorPeriod?: number, endTime?: number}> = [];

  public constructor() {

    this.memory = new Memory(Settings.MEMORY_SIZE, Settings.MEMORY_RELOCATING_TIME);
    this.processor = new Processor(Settings.PROCESSOR_QUANTUM);
    this.disc = new Disc(Settings.DISC_POSITIONING_TIME, Settings.DISC_LATENCY_TIME, Settings.DISC_TRANSFER_RATE);

    this.eventList = new LinkedList<Event>();
    this.jobTable = new LinkedList<Job>();

    this.multiprogrammingController = new MultiprogrammingController(Settings.MULTIPROGRAMMING_LIMIT);

  }

  /**
   * Reads the input and sets the attributes of scheduler
   */
  public readInputs(inputPath: string = "input.txt") {
    Input.read(inputPath, this.timing, this.jobTable, this.eventList, this.filesList);
    this.initialTime = this.timing[0];
    this.finalTime = this.timing[1];
    return;
  }

  /**
   * Executes all the events stored into the eventList.
   */
  public run() {
    // starts timing
    let currentTime = this.initialTime;

    // print table header
    console.log(COLORS.Bright, COLORS.fg.Cyan, "\n\nExecution:\n", COLORS.Reset);
    console.log(COLORS.fg.Black, "Time\tEvent\tJob\tAction                       \tResults", COLORS.Reset);
    console.log(COLORS.fg.Crimson, currentTime + "\t\t\t\t\t\t\tStarting...", COLORS.Reset);

    // get the first event arriving
    let currentEvent = Event.getNew(this.eventList);
    let nextEvent = null;

    // while there are more events, and current time didn't surpass the end of times
    while (currentEvent != null && currentTime <= this.finalTime) {
      const currentJob = currentEvent.getJob();
      currentTime = currentEvent.getTime();
      // this.printJobSummary();

      switch (currentEvent.getType()) {
        // job arrives
        case EventType.ARRIVAL:

          this.jobSummary[currentJob.getId()] = { arrivalTime: currentTime, processorPeriod: 0 }; // updates Job Summary Table

          if (this.multiprogrammingController.canRun()) {
            this.multiprogrammingController.run();

            nextEvent = new Event(currentJob, currentTime, EventType.REQUEST_MEMORY);
            nextEvent.insert(this.eventList);
            console.log(COLORS.Reset, COLORS.fg.Cyan, currentTime + "\t" + EventType.ARRIVAL + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.ARRIVAL] + "\tJob arrived at the system.");
          } else {
            this.multiprogrammingController.enqueue(currentJob);
            console.log(COLORS.Reset, COLORS.fg.Red, currentTime + "\t" + EventType.ARRIVAL + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.ARRIVAL] + "\tJob entered multiprogramming queue.");
          }

          break;

        // job requests memory allocation
        case EventType.REQUEST_MEMORY:
          if (this.memory.allocate(currentJob.getSegmentList())) {
            nextEvent = new Event(currentJob, currentTime + this.memory.getRelocatingTime(), EventType.REQUEST_PROCESSOR);
            nextEvent.insert(this.eventList);
            console.log(COLORS.Reset, COLORS.fg.Blue, currentTime + "\t" + EventType.REQUEST_MEMORY + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.REQUEST_MEMORY] + "\tMemory allocated to the job.");
          } else {
            this.memory.enqueue(currentJob);
            console.log(COLORS.Reset, COLORS.fg.Red, currentTime + "\t" + EventType.REQUEST_MEMORY + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.REQUEST_MEMORY] + "\tJob entered memory queue.");
          }

          if (Settings.MEMORY_PRINT_SEGMENTS) {
            this.memory.printSegmentMap();
          }

          break;

        // job requests processor execution
        case EventType.REQUEST_PROCESSOR:
          if (this.processor.isFree()) {
            this.processor.assign();

            if (currentJob.getTimeToNextRelease() <= this.processor.getQuantum()) {
              // processes until the release (to IO request or completion)
              if (currentJob.getIoRequests() > 0) {
                nextEvent = new Event(currentJob, currentTime + currentJob.getTimeToNextRelease(), EventType.ISSUE_IO);
                currentJob.partialProcessed(currentJob.getTimeToNextRelease());
                this.jobSummary[currentJob.getId()].processorPeriod += currentJob.getTimeToNextRelease(); // updates Job Summary Table
              } else {
                nextEvent = new Event(currentJob, currentTime + currentJob.getProcessingTime(), EventType.COMPLETION);
                currentJob.fullyProcessed();
                this.jobSummary[currentJob.getId()].processorPeriod += currentJob.getProcessingTime(); // updates Job Summary Table
              }
            } else {
              // processes until the end of the time slice
              nextEvent = new Event(currentJob, currentTime + this.processor.getQuantum(), EventType.TIME_OUT);
              currentJob.partialProcessed(this.processor.getQuantum());
              this.jobSummary[currentJob.getId()].processorPeriod += this.processor.getQuantum(); // updates Job Summary Table
            }
            nextEvent.insert(this.eventList);

            console.log(COLORS.Reset, COLORS.fg.Green, currentTime + "\t" + EventType.REQUEST_PROCESSOR + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.REQUEST_PROCESSOR] + "\tProcessor assigned to the job.");
          } else {
            this.processor.enqueue(currentJob);
            console.log(COLORS.Reset, COLORS.fg.Red, currentTime + "\t" + EventType.REQUEST_PROCESSOR + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.REQUEST_PROCESSOR] + "\tJob entered processor queue.");
          }
          break;

        // job releases the processor, and requests I/O operation
        case EventType.ISSUE_IO:
          this.processor.release();
          nextEvent = new Event(currentJob, currentTime, EventType.REQUEST_IO);
          nextEvent.insert(this.eventList);
          console.log(COLORS.Reset, COLORS.fg.Yellow, currentTime + "\t" + EventType.ISSUE_IO + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.ISSUE_IO] + "\tJob released the processor and issued the disc.");

          // if there are another job waiting for the processor, requests it
          if (!this.processor.hasEmptyQueue()) {
            const jobAux = this.processor.dequeue();
            nextEvent = new Event(jobAux, currentTime + Processor.OVERHEAD_TIME, EventType.REQUEST_PROCESSOR);
            nextEvent.insert(this.eventList);
          }
          break;

        // job releases disc, returning to processor
        case EventType.REQUEST_IO:
          if (this.disc.isFree()) {
            this.disc.assign();
            currentJob.issuedIo();
            nextEvent = new Event(currentJob, currentTime + this.disc.getProcessingTime(currentJob.getRecordLength()), EventType.RELEASE_IO);
            nextEvent.insert(this.eventList);
            console.log(COLORS.Reset, COLORS.fg.Black, currentTime + "\t" + EventType.REQUEST_IO + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.REQUEST_IO] + "\tDisc assigned to the job.");
          } else {
            this.disc.enqueue(currentJob);
            console.log(COLORS.Reset, COLORS.fg.Red, currentTime + "\t" + EventType.REQUEST_IO + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.REQUEST_IO] + "\tJob entered disc queue.");
          }
          break;

        // job releases memory and processor
        case EventType.RELEASE_IO:
          this.disc.release();
          nextEvent = new Event(currentJob, currentTime, EventType.REQUEST_PROCESSOR);
          nextEvent.insert(this.eventList);
          console.log(COLORS.Reset, COLORS.fg.Crimson, currentTime + "\t" + EventType.RELEASE_IO + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.RELEASE_IO] + "\tJob released the disc.");

          // if there are another job waiting for the disc, requests it
          if (!this.disc.hasEmptyQueue()) {
            const jobAux = this.disc.dequeue();
            nextEvent = new Event(jobAux, currentTime, EventType.REQUEST_IO);
            nextEvent.insert(this.eventList);
          }
          break;

        // job completes its execution, releasing memory and the processor
        case EventType.COMPLETION:
          this.processor.release();
          this.memory.release(currentJob.getSegmentList());
          this.multiprogrammingController.finish();
          console.log(COLORS.Reset, COLORS.fg.Green, currentTime + "\t" + EventType.COMPLETION + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.COMPLETION] + "\tJob released processor and memory.", COLORS.Reset);

          this.jobSummary[currentJob.getId()].endTime = currentTime; // updates Job Summary Table

          if (Settings.MEMORY_PRINT_SEGMENTS) {
            this.memory.printSegmentMap();
          }

          // if there is another job waiting for the processor, requests it
          if (!this.processor.hasEmptyQueue()) {
            const jobAux = this.processor.dequeue();
            nextEvent = new Event(jobAux, currentTime + Processor.OVERHEAD_TIME, EventType.REQUEST_PROCESSOR);
            nextEvent.insert(this.eventList);
          }

          // if there is another job waiting for the memory, requests it
          if (!this.memory.hasEmptyQueue() && this.memory.allocate(this.memory.nextSegmentsRequest())) {
            this.memory.release(this.memory.nextSegmentsRequest());
            const jobAux = this.memory.dequeue();
            nextEvent = new Event(jobAux, currentTime, EventType.REQUEST_MEMORY);
            nextEvent.insert(this.eventList);
          }

          // if there is another job waiting for multiprogramming, executes it
          if (!this.multiprogrammingController.hasEmptyQueue()) {
            const jobAux = this.multiprogrammingController.dequeue();
            nextEvent = new Event(jobAux, currentTime, EventType.REQUEST_MEMORY);
            nextEvent.insert(this.eventList);
          }


          break;

        // job completes its time slice, releasing the processor and requesting it at the end of the queue
        case EventType.TIME_OUT:
          this.processor.release();
          // if there are another job waiting for the processor, requests it
          if (!this.processor.hasEmptyQueue()) {
            const jobAux = this.processor.dequeue();
            nextEvent = new Event(jobAux, currentTime + Processor.OVERHEAD_TIME, EventType.REQUEST_PROCESSOR);
            nextEvent.insert(this.eventList);
          }

          nextEvent = new Event(currentJob, currentTime, EventType.REQUEST_PROCESSOR);
          nextEvent.insert(this.eventList);
          console.log(COLORS.Reset, COLORS.fg.Red, currentTime + "\t" + EventType.TIME_OUT + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.TIME_OUT] + "\tJob released processor.", COLORS.Reset);
          break;

        // others...
        default:
          console.log(COLORS.Reset, COLORS.bg.Red, COLORS.fg.Black, currentTime + "\t" + EventType.INVALID + "\t" + currentJob.getId() + "\t" + EVENTS[EventType.INVALID] + "\tInvalid event.");
      }

      // get the following event
      currentEvent = Event.getNew(this.eventList);
    }

    if (currentEvent == null) {
      console.log(COLORS.Reset, COLORS.Blink, currentTime + "\t\t\t\t\t\t\tNo more jobs to simulate.");
    } else {
      console.log(this.finalTime + "\t\t\t\t\t\t\tEnd of simulation.");
    }

    this.printJobSummary();

    console.log("\n\n ***** END OF SIMULATION ****\n");
  }

  /**
   * Prints table with arrival time, end time, processor period and turn around time for each job. Also prints the average turn around time.
   */
  public printJobSummary() {
    /* Prints de Summary of Job Execution */
    console.log("\n\n\n");
    console.log(COLORS.Reset, COLORS.Bright, COLORS.fg.Magenta, "*** JOB SUMMARY *** \n", COLORS.Reset);

    console.log("Job ID \tArrival Time \tEnd Time \tProcessor Period \tT \tW");

    let Tavg = 0;
    let Wavg = 0;
    for (const [id, job] of this.jobSummary.entries()) {
      if (job) {
        const T = job.endTime - job.arrivalTime;
        const W = T / job.processorPeriod;
        console.log(`${id} \t${job.arrivalTime} \t\t${job.endTime} \t\t${job.processorPeriod} \t\t\t${T} \t${W.toFixed(2)}`);
        Tavg += T / this.jobSummary.length;
        Wavg += W / this.jobSummary.length;
      }
    }

    console.log("\n\n Tavg = " + Tavg + "\t Wavg = " + Wavg.toFixed(2) + "\n\n");
  }
}
