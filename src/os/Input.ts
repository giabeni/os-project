import { Job } from "./Job";
import { LinkedList } from "../aux/LinkedList";
import * as fs from "fs";
import * as readline from "readline";
import { File } from "./File";
import { Event, EventType } from "./Event";

const JOB_RECORD_LENGTH = 100;

export class Input {

  /**
   * Reads the definition file.
   *
   * @param fileName is the file to be read.
   * @param initialTime marks the current time at the beginning of the execution.
   * @param endTime marks the current time at the end of the execution;
   * @param jobList stores all the jobs the computer can run.
   * @param eventList stores the events described on the file.
   */
  public static read( fileName: string, timing: number[], jobList: LinkedList<Job>,
                      eventList: LinkedList<Event> , filesList: File[] ) {
      // open file
      const fileStream = fs.readFileSync(fileName);

      Input.fillFiles(filesList);

      const lines: string[] = fileStream.toString().split("\n");

      timing[0] = parseInt(lines[1]);
      timing[1] = parseInt(lines[2]);

      // line 4 is blank
      const numJobs = parseInt(lines[3]);

      for (let l = 6; l < 6 + numJobs; l++) {
        const line = lines[l];
        const definition = line.split(" ");
        const jobId = parseInt(definition[0]);
        const processingTime = parseInt(definition[1]);
        const segmentsNumber = parseInt(definition[2]);

        const segmentSizes = [];
        let i: number;
        for (i = 0; i < segmentsNumber; i++) {
          segmentSizes[i] = parseInt(definition[3 + i]);
        }
        const ioRequests = parseInt(definition[3 + i]);
        const numberOfFiles = parseInt(definition[4 + i]);

        const filesUsed: string[] = [];
        for (let j = 0; j < numberOfFiles; j++) {
          filesUsed.push(definition[5 + i + j]);
        }

        // create job and stores it onto the list
        const job = new Job(jobId, processingTime, ioRequests, JOB_RECORD_LENGTH, segmentSizes, filesUsed);
        jobList.push(job);

        for (const element of filesUsed) {
          File.getFile(element, filesList).addOwner(job);
        }
        console.log("Id: " + jobId + "\tProcessing time: " + processingTime +
                    "\tNumber of segments: " + segmentsNumber + "\tI/O requests: " + ioRequests +
                    " \tNumber of files: " + numberOfFiles);

        if (numberOfFiles !== 0) {
          console.log("Files: ", ...filesUsed.map((f) => f + ", "), "\n");
        }

      }
      console.log("\n");

      // get jobs arrival time
      for (let l = 9 + numJobs; l < 9 + 2 * numJobs; l++) {
        const line = lines[l];
        const definition = line.split(" ");
        const jobId = parseInt(definition[0]);
        const arrivalTime = parseInt(definition[1]);

        // search for the job
        const job = Input.findJob(jobList, jobId);

        if (job) {
          // if found, create the event and stores it onto the list in arrival time order
          const event = new Event(job, arrivalTime, EventType.ARRIVAL);
          event.insert(eventList);
          console.log("Job: " + jobId + "\tArrival time: " + arrivalTime);
        } else {
          console.log("Invalid job with id: " + jobId + ".");
        }
      }

      console.log("\n");
      return;
  }

  /**
   * Searches if the job was already defined.
   *
   * @param jobList contains all jobs created.
   * @param jobId identifies the job being searched.
   * @return the job with jobId; or null if not found.
   */
  private static findJob(jobList: LinkedList<Job>, jobId: number): Job {
    for (const j of jobList.items()) {
      if (j.val.getId() === jobId) {
        return j.val;
      }
    }
    return undefined;
  }

  private static fillFiles(filesList: File[]) {

    filesList.push(new File("calc", 32));
    filesList.push(new File("pad", 16));
    filesList.push(new File("minesweeper", 20));
    filesList.push(new File("salt", 5));
    filesList.push(new File("pepper", 10));
    filesList.push(new File("tea", 48));
    filesList.push(new File("coffee", 32));

  }
}
