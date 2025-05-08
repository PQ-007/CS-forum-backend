// src/service/type.ts
export type User = {
  id?: string;
  name: string;
  email: string;
  type?: string;
  token?: string;
};

export interface DataType {
  authorized?: boolean;
  user?: User;
  init?: boolean;
}
export enum Action {
  SIGN_OUT = "SIGN_OUT",
  SIGN_IN = "SIGN_IN",
  INIT = "INIT",
}
export type ReducerType = (state: DataType, action: Actions) => DataType;

export type Actions =
  | [Action.SIGN_OUT]
  | [Action.SIGN_IN, User]
  | [Action.INIT, boolean];

export type Refreshs = {
  info: () => void;
};
export type AuthContextType = [DataType, (action: Actions) => void];
export type AuthReducerType = (state: DataType, action: Actions) => DataType;
