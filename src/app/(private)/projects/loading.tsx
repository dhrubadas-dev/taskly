const ProjectsLoading = () => {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6 space-y-2">
        <div className="bg-muted h-7 w-32 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-64 animate-pulse rounded-md" />
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border px-4 py-3">
            <div className="bg-muted size-4 shrink-0 animate-pulse rounded-full" />
            <div
              className="bg-muted h-4 animate-pulse rounded-md"
              style={{ width: `${35 + ((i * 17) % 30)}%` }}
            />
            <div className="bg-muted ml-auto h-5 w-16 animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsLoading;
