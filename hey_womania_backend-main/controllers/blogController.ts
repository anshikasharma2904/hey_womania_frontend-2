import { Request, Response } from "express";
import { Blog } from "../models/Blog";
import { v4 as uuidv4 } from "uuid";

// Admin APIs

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, coverImage, author, status } = req.body;
    
    // Generate a basic slug from the title
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    // Ensure slug uniqueness
    const existing = await Blog.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newBlog = new Blog({
      id: uuidv4(),
      title,
      slug,
      content,
      excerpt,
      coverImage,
      author: author || "Admin",
      status: status || "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await newBlog.save();
    res.status(201).json({ success: true, blog: newBlog });
  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
};

export const getAdminBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    console.error("Get Admin Blogs Error:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    
    const blog = await Blog.findOneAndUpdate({ id }, updates, { new: true });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json({ success: true, blog });
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({ error: "Failed to update blog" });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findOneAndDelete({ id });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
};

// Public APIs

export const getPublicBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({ status: "Published" }).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    console.error("Get Public Blogs Error:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

export const getPublicBlogBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, status: "Published" });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json({ success: true, blog });
  } catch (error) {
    console.error("Get Public Blog Error:", error);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
};
