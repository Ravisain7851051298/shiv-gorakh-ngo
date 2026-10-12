import { createContentSlice } from "@/store/contentSliceFactory";
import { createContentThunks } from "@/store/contentThunks";

export const blogThunks = createContentThunks("blogs");
export const {
  fetchAll: fetchBlogs,
  fetchById: fetchBlogById,
  create: createBlog,
  update: updateBlog,
  remove: deleteBlog,
} = blogThunks;
const blogSlice = createContentSlice({ name: "blogs", thunks: blogThunks });
export const { clearContentError: clearBlogError, clearCurrentItem: clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer;
