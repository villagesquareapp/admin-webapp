"use client";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import PostHeader from "./PostHeader";
import PostText from "./PostText";
import PostVideo from "./PostVideo";
import SocialPostActionButtons from "./SocialPostActionButtons";
import { getSinglePost } from "@/app/api/post";
import { formatDistanceToNow } from "date-fns";

const PostDialog = ({
  isOpen,
  setIsOpen,
  post,
  postId,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  post?: IPosts | null;
  postId?: string;
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [postDetails, setPostDetails] = useState<ISinglePost | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (postId && isOpen) {
        try {
          setLoading(true);
          const response = await getSinglePost(postId);
          if (response?.data) {
            setPostDetails(response.data);
          }
        } catch (error) {
          console.error("Error fetching post details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPostDetails();
  }, [postId, isOpen]);

  // Reset states when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentMediaIndex(0);
      setPostDetails(null);
    }
  }, [isOpen]);

  if (!post) return null;

  const media = post.media || [];

  const handlePrevMedia = () => {
    if (!media.length) return;
    setCurrentMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNextMedia = () => {
    if (!media.length) return;
    setCurrentMediaIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  // Create a normalized post object that works with both types
  const displayPost: IPosts = {
    ...post,
    caption: postDetails?.post_details.content.caption || post.caption,
    media: postDetails?.post_details.content.media || post.media || [],
    user: {
      ...post.user,
      name: postDetails?.post_details.user.name || post.user.name,
      profile_picture:
        postDetails?.post_details.user.profile_picture || post.user.profile_picture,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={() => {
            setIsOpen(false);
            setPostDetails(null);
          }}
          className="relative z-50"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
          />
          <div className="fixed inset-0 mx-auto flex items-center justify-center p-4">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[1100px] flex flex-col h-[95dvh] max-h-[850px] overflow-hidden p-0 gap-0 rounded-lg bg-white dark:bg-darkgray shadow-md dark:dark-shadow-md"
            >
              <div className="sticky top-0 bg-background border-b dark:border-gray-600 z-50 m-0 h-16 p-0">
                <div className="flex items-center justify-between px-6 py-3">
                  <DialogTitle className="text-center flex-1 m-0">Post Details</DialogTitle>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="p-1 px-2.5 rounded-full transition-colors"
                  >
                    <Icon icon="solar:close-circle-bold" height={30} />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Loading post details...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 h-[calc(100%-4rem)]">
                  <div className="grid overflow-y-auto col-span-1 w-full bg-white/60 dark:bg-darkgray">
                    <div className="relative grid grid-cols-1 h-fit my-auto center place-self-center">
                      {media.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevMedia}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                          >
                            <Icon
                              icon="solar:arrow-left-linear"
                              className="text-white"
                              width={24}
                              height={24}
                            />
                          </button>
                          <button
                            onClick={handleNextMedia}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                          >
                            <Icon
                              icon="solar:arrow-right-linear"
                              className="text-white"
                              width={24}
                              height={24}
                            />
                          </button>
                        </>
                      )}

                      {media.length > 0 && (
                        <div key={media[currentMediaIndex]?.url}>
                          {media[currentMediaIndex]?.type === "image" && (
                            <div className="w-full aspect-[4/5] relative rounded-xl overflow-hidden">
                              <Image
                                className="object-cover"
                                src={media[currentMediaIndex]?.url || ""}
                                alt="post"
                                fill
                                sizes="500px"
                                quality={90}
                                priority
                              />
                            </div>
                          )}
                          {media[currentMediaIndex]?.type === "video" && (
                            <PostVideo
                              src={media[currentMediaIndex]?.url || ""}
                              showEchoButtons={false}
                            />
                          )}
                        </div>
                      )}

                      {!media.length && (
                        <div className="font-bold text-2xl p-6">
                          <PostText text={displayPost.caption} />
                        </div>
                      )}

                      {media.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {media.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentMediaIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentMediaIndex ? "bg-white" : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 w-full h-full flex flex-col relative">
                    <div className="sticky gap-y-4 bg-background z-10 border-b dark:border-gray-600 pt-4 pb-2">
                      <div className="flex mb-6">
                        <PostHeader post={displayPost} />
                      </div>

                      <PostText text={displayPost.caption} />
                      <SocialPostActionButtons post={displayPost} />
                    </div>
                    <div className="h-[60dvh] max-h-[600px] overflow-y-auto">
                      <div className="p-4 space-y-4">
                        {postDetails?.post_details.comments.map((comment, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                <Image
                                  src={comment.user.profile_picture}
                                  alt={comment.user.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-semibold">{comment.user.name}</span>
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(comment.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-sm pl-10">{comment.text}</p>
                          </div>
                        ))}
                        {!postDetails?.post_details?.comments?.length && (
                          <div className="text-center text-gray-500 font-semibold mt-20">
                            No comments yet!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default PostDialog;
