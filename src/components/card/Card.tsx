import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileService } from "../../services/file-service";
import styles from "./Card.module.scss";

const Card = ({
  id,
  image,
  name,
  additionalDetail,
  objectType,
  objectTypeUrl,
  buttons
}: {
  id: number;
  image: string;
  name: string;
  additionalDetail: string;
  objectType: string;
  objectTypeUrl: string;
  buttons?: JSX.Element;
}) => {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string>("");
  const [customAdditionalDetail, setCustomAdditionalDetail] =
    useState<JSX.Element | null>(null);
  const goToItemPage = () => {
    navigate(`/${objectTypeUrl}/${id}`);
  };

  const getPreviewImage = async () => {
    try {
      const res = await FileService.getFile(image);
      setPreviewImage(res);
    } catch (e) {
      console.error(e);
      setPreviewImage("/public/assets/post_img_not_found_default.png");
    }
  };

  useEffect(() => {
    getPreviewImage();
    if (objectType === "user") {
      if (additionalDetail.includes("(active user)")) {
        additionalDetail = additionalDetail.replace("(active user)", "");
        setCustomAdditionalDetail(
          <>
            <span className={styles.activeUserCardMark}>This is you</span>
            
            {additionalDetail}
          </>
        );
      }
    } else if (objectType === "group") {
      if (additionalDetail === "Private group") {
        setCustomAdditionalDetail(
          <>
            {additionalDetail + " "}
            <i className="bi bi-shield-lock"></i>
          </>
        );
      }
    } else {
      setCustomAdditionalDetail(null);
    }
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.cardImageContainer}>
        {buttons && buttons}
        <img
          onClick={goToItemPage}
          src={previewImage}
          alt={`${objectType} preview image`}
          className={
            objectType === "user" ? styles.userImage : styles.postOrGroupImage
          }
        />
      </div>
      <div className={styles.cardDetails}>
        <div className={styles.name}>{name}</div>
        <p>
          {customAdditionalDetail ? customAdditionalDetail : additionalDetail}
        </p>
      </div>
    </div>
  );
};

export default Card;
