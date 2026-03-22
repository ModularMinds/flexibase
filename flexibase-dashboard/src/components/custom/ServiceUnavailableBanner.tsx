import Image from "next/image";
import DisconnectImage from "@/assets/disconnect.png";

interface ServiceUnavailableBannerProps {
  serviceName: string;
}

const ServiceUnavailableBanner: React.FC<ServiceUnavailableBannerProps> = ({
  serviceName,
}) => {
  return (
    <div className=" flex flex-col py-20 items-center justify-center ">
      <div>
        <h2 className="text-2xl text-center font-medium">
          {serviceName} Service is Offline
        </h2>
        <p className="lg:w-[500px] text-center">
          Uncomment / Add the service configuration in docker-compose.yml and
          rebuild the compose stack to use this service
        </p>
      </div>

      <Image width={400} height={400} src={DisconnectImage} alt="" />
    </div>
  );
};

export default ServiceUnavailableBanner;
