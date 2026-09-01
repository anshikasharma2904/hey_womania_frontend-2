import Link from "next/link";
import { MainNavbar } from "@/components/MainNavbar";
import { StoreFooter } from "@/components/StoreFooter";

async function getBlogs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/blogs`, { next: { revalidate: 60 } });
    const data = await res.json();
    return data.blogs || [];
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNavbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Our Blog</h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Discover the latest trends, tips, and insights in the world of fashion and beauty.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No blogs have been published yet. Check back soon!
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog: any) => (
              <div key={blog.id} className="flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {blog.coverImage && (
                  <div className="flex-shrink-0">
                    <img className="h-48 w-full object-cover" src={blog.coverImage} alt={blog.title} />
                  </div>
                )}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-pink-600">
                      Article
                    </p>
                    <Link href={`/blogs/${blog.slug}`} className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">{blog.title}</p>
                      <p className="mt-3 text-base text-gray-500 line-clamp-3">
                        {blog.excerpt || blog.content.substring(0, 150) + "..."}
                      </p>
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="sr-only">{blog.author}</span>
                      <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold">
                        {blog.author.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {blog.author}
                      </p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={blog.createdAt}>
                          {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
