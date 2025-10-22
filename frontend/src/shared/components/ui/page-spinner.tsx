import { LoadingSpinner } from "./loading-spinner";

const PageSpinner = () => {
  return (
    <div className="my-20 w-full h-full flex justify-center items-center">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default PageSpinner;
