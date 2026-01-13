const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-24 h-24 border-8 border-sand rounded-full"></div>
        <div className="w-24 h-24 border-8 border-rust border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-olive rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
