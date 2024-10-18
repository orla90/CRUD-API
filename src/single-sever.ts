import http from "http";
import { requestHandler } from "./utils/request-handlers";

export const createSingleServer = (port: string | number) => {
  const server = http.createServer(requestHandler);

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};
