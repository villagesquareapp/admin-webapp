import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { cn } from "lib/utils";

const CustomAvatar = ({
  className,
  src,
  name,
}: {
  className?: string;
  src: string;
  name: string;
}) => {
  return (
    <Avatar className={cn("border-foreground border", className)}>
      <AvatarImage src={src} />
      <AvatarFallback>{name}</AvatarFallback>
    </Avatar>
  );
};

export default CustomAvatar;
