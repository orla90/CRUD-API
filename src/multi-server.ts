import http, { IncomingMessage, ServerResponse } from "http";
import cluster from "cluster";
import os from "os";
import { requestHandler } from "./utils/request-handlers";
import { User } from "./common/models/user";

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

      cluster.on("exit", (worker) =>
        console.log(`worker ${worker.process.pid} died`),
      );

      const server = http.createServer();
      server.on(
        "request",
        (originalReq: IncomingMessage, originalRes: ServerResponse) => {
          const { pathname } = new URL(
            originalReq.url || "",
            `http://${originalReq.headers.host}`,
          );
          const newPort = (+port + lastWorkerIndex + 1).toString();

          const requestOptions = {
            hostname: "localhost",
            port: newPort,
            path: pathname,
            method: originalReq.method,
            headers: { ...originalReq.headers, host: `localhost:${newPort}` },
          };

          const proxyRequest = http.request(requestOptions, (proxyResponse) => {
            originalRes.writeHead(
              proxyResponse.statusCode as number,
              proxyResponse.headers,
            );
            proxyResponse.pipe(originalRes, { end: true });
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

      const server = http.createServer(requestHandler);
      const workerPort = +port + cluster.worker!.id!;

      server.listen(workerPort, () =>
        console.log(`Worker server listening on port ${workerPort}`),
      );
    }
  } catch {
    console.log("Error");
  }
};
