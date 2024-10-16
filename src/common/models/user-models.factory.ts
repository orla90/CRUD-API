import { UserJson } from "../json/user.json";
import { User } from "./user";

export class UserModelsFactory {
  public createUser(json: UserJson): User {
    return new User(json);
  }
}
