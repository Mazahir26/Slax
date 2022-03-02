import moment from "moment";

export interface eventData {
  name: string;
  date: string;
  user: string;
  _id: string;
  color: string;
  isUser?: boolean;
}
export interface rawEvent {
  name: string;
  date: Date;
  user: string;
  color: string;
  isUser?: boolean;
}

export interface event {
  name: string;
  date: moment.Moment;
  user: string;
  _id: string;
  color: string;
  isUser?: boolean;
}
