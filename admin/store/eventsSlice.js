import { createContentSlice } from "@/store/contentSliceFactory";
import { createContentThunks } from "@/store/contentThunks";

export const eventThunks = createContentThunks("events");
export const {
  fetchAll: fetchEvents,
  fetchById: fetchEventById,
  create: createEvent,
  update: updateEvent,
  remove: deleteEvent,
} = eventThunks;
const eventSlice = createContentSlice({ name: "events", thunks: eventThunks });
export const { clearContentError: clearEventError, clearCurrentItem: clearCurrentEvent } = eventSlice.actions;
export default eventSlice.reducer;
