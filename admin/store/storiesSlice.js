import { createContentSlice } from "@/store/contentSliceFactory";
import { createContentThunks } from "@/store/contentThunks";

export const storyThunks = createContentThunks("stories");
export const {
  fetchAll: fetchStories,
  fetchById: fetchStoryById,
  create: createStory,
  update: updateStory,
  remove: deleteStory,
} = storyThunks;
const storySlice = createContentSlice({ name: "stories", thunks: storyThunks });
export const { clearContentError: clearStoryError, clearCurrentItem: clearCurrentStory } = storySlice.actions;
export default storySlice.reducer;
