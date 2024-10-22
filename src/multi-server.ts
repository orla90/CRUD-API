import http, { IncomingMessage, ServerResponse } from "http";
import cluster from "cluster";
import os from "os";
import { requestHandler } from "./utils/request-handlers";
import { ClusterMessage, User } from "./common/models/user";
import { ErrorType } from "./common/enum/error-types.enum";
import { updateUsers } from "./utils/db";

export const createMultiServer = (port: string | number) => {
  try {
    const numberOfCPU = os.availableParallelism();

    if (cluster.isPrimary) {
      console.log(`Primary ${process.pid} is running`);

      let users: User[] = [];
      let lastWorkerIndex = 0;

      const workerIDs: number[] = [];
      const numberOfCPUArr = Array(numberOfCPU - 1).fill(1);

      numberOfCPUArr.forEach(() => {
        const worker = cluster.fork();
        workerIDs.push(worker.id);

        worker.on("message", (message) => {
          if (message.type === "state") users = message.data;
        });
      });

      cluster.on("exit", (worker) => {
        console.log(`worker ${worker.process.pid} died`);
      });

      const server = http.createServer();
      server.on(
        "request",
        (originalReq: IncomingMessage, originalRes: ServerResponse) => {
          const { pathname } = new URL(
            originalReq.url || "",
            `http://${originalReq.headers.host}`,
          );
          const MULTI_SERVER_PORT = (+port + lastWorkerIndex + 1).toString();

          const requestOptions = {
            hostname: "localhost",
            port: MULTI_SERVER_PORT,
            path: pathname,
            method: originalReq.method,
            headers: {
              ...originalReq.headers,
              host: `localhost:${MULTI_SERVER_PORT}`,
            },
          };

          const proxyRequest = http.request(requestOptions, (proxyResponse) => {
            originalRes.writeHead(
              proxyResponse.statusCode as number,
              proxyResponse.headers,
            );
            proxyResponse.pipe(originalRes, { end: true });
            console.log(`Request sent to port ${MULTI_SERVER_PORT}`);
          });

          originalReq.pipe(proxyRequest, { end: true });

          const worker =
            cluster.workers && cluster.workers[workerIDs[lastWorkerIndex]];
          worker?.send({ type: "update", data: users });

          lastWorkerIndex =
            lastWorkerIndex === workerIDs.length - 1 ? 0 : lastWorkerIndex + 1;
        },
      );

      server.listen(port, () =>
        console.log(`Primary server listening on port ${port}`),
      );
    } else {
      console.log(`Worker ${process.pid} started`);

      process.on("message", (message: ClusterMessage) => {
        updateUsers(message.data);
      });

      const server = http.createServer(requestHandler);
      const workerPort = +port + cluster.worker!.id!;

      server.listen(workerPort, () =>
        console.log(`Worker server listening on port ${workerPort}`),
      );
    }
  } catch {
    console.log(ErrorType.COMMON_ERROR);
  }
};
