export default function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-[calc(100dvh-110px)]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
