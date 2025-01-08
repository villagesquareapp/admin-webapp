export const PostText = ({ text }: { text: string }) => {
  const renderTextWithHashtags = (text: string) => {
    const words = text.split(" ");
    return words.map((word, index) => {
      if (word.startsWith("#")) {
        return (
          <span key={index} className="text-primary">
            {word}{" "}
          </span>
        );
      }
      return word + " ";
    });
  };

  return <div className=" px-4 whitespace-pre-line">{renderTextWithHashtags(text)}</div>;
};

export default PostText;
