const TasksLoading = () => {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6 space-y-2">
        <div className="bg-muted h-7 w-32 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-56 animate-pulse rounded-md" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="bg-muted h-4 w-20 animate-pulse rounded-md" />
          <div className="bg-muted h-9 w-44 animate-pulse rounded-full" />
        </div>

        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <div className="bg-muted size-4 shrink-0 animate-pulse rounded" />
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className="bg-muted h-4 animate-pulse rounded-md"
                  style={{ width: `${45 + ((i * 13) % 35)}%` }}
                />
                <div className="ml-auto flex items-center gap-3">
                  <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
                  <div className="bg-muted hidden h-3 w-12 animate-pulse rounded sm:block" />
                  <div className="bg-muted hidden h-5 w-20 animate-pulse rounded-full sm:block" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksLoading;
