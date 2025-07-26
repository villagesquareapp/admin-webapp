// "use client";

// import { useEffect, useState } from "react";
// import { getPosts, getPostStats } from "@/app/api/post";
// import SmallCards from "@/app/components/dashboards/ecommerce/smallCards";
// import PostTable from "./PostTable";
// import shape1 from "/public/images/shapes/danger-card-shape.png";
// import shape3 from "/public/images/shapes/success-card-shape.png";

// const ClientPostPage = () => {
//   const [posts, setPosts] = useState<IPostResponse | null>(null);
//   const [postStats, setPostStats] = useState<IPostStats | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 20;

//   const fetchAllData = async () => {
//     try {
//       const [statsRes, postsRes] = await Promise.all([
//         getPostStats(),
//         getPosts(currentPage, pageSize),
//       ]);
//       setPostStats(statsRes?.data || null);
//       setPosts(postsRes?.data || null);
//     } catch (error) {
//       console.error("Failed to fetch data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, [currentPage]);

//   const overviewData: IOverviewData[] = [
//     {
//       total: postStats?.total_posts || 0,
//       icon: "mdi:post-outline",
//       bgcolor: "secondary",
//       title: "Total Posts",
//       shape: shape1,
//       link: "",
//     },
//     {
//       total: postStats?.today_posts || 0,
//       icon: "mdi:calendar-today",
//       bgcolor: "primary",
//       title: "Today's Active Posts",
//       shape: shape3,
//       link: "",
//     },
//     {
//       total: postStats?.reported_posts || 0,
//       icon: "mdi:flag-outline",
//       bgcolor: "primary",
//       title: "Reported Posts",
//       shape: shape3,
//       link: "",
//     },
//     {
//       total: postStats?.total_likes || 0,
//       icon: "mdi:heart-outline",
//       bgcolor: "primary",
//       title: "Total Likes",
//       shape: shape3,
//       link: "",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-12 gap-30">
//       <div className="col-span-12">
//         <SmallCards overviewData={overviewData} />
//       </div>
//       <div className="col-span-12">
//         <PostTable
//           posts={posts || null}
//           totalPages={posts?.last_page || 1}
//           currentPage={currentPage}
//           pageSize={pageSize}
//           onRefresh={fetchAllData}
//           onPageChange={(page) => setCurrentPage(page)}
//         />
//       </div>
//     </div>
//   );
// };

// export default ClientPostPage;
