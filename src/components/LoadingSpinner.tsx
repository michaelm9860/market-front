import { Circles } from "react-loader-spinner";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-full" style={{height: "88vh"}}>
      <Circles
        height="80%"
        width="80%"
        color="#447aa1"
        ariaLabel="circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
};

export default LoadingSpinner;
