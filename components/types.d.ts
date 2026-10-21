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

/** The two ways the dashboard can display the birthday list. */
export type CalendarView = "agenda" | "month";

/** Payload accepted by the add-birthday dialog. */
export interface NewBirthday {
  name: string;
  date: moment.Moment;
  color: string;
}
