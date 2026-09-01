import { MainNavbar } from "@/components/MainNavbar";
import { StoreFooter } from "@/components/StoreFooter";

async function getBlogBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/blogs/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.blog;
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return null;
  }
}

export default async function BlogDetails({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MainNavbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Blog Not Found</h1>
            <p className="mt-2 text-gray-500">The article you are looking for does not exist.</p>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MainNavbar />
      <main className="flex-grow">
        {blog.coverImage && (
          <div className="w-full h-64 sm:h-96 relative">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
              {blog.title}
            </h1>
            <div className="mt-6 flex items-center justify-center space-x-4 text-gray-500">
              <span className="font-medium text-pink-600">{blog.author}</span>
              <span>&bull;</span>
              <time dateTime={blog.createdAt}>
                {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
            </div>
          </div>

          {blog.excerpt && (
            <p className="text-xl text-gray-500 mb-8 italic text-center leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          <div className="prose prose-lg prose-pink max-w-none text-gray-800">
            {/* Extremely basic content rendering. For rich text, you'd use a markdown parser or dangerouslySetInnerHTML */}
            <div className="whitespace-pre-wrap">{blog.content}</div>
          </div>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
